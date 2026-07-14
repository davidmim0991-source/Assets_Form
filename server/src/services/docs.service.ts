import { docs } from './googleAuth';
import { withRetry } from '../utils/retry';
import { createGoogleDoc } from './drive.service';

/**
 * Google Docs service.
 * Creates a single consolidated document with the full client JSON payload.
 */

type NamedStyle = 'TITLE' | 'NORMAL_TEXT';

/**
 * Accumulates Docs API batchUpdate requests while tracking the insertion
 * index. Docs API indices are UTF-16 code units, which is exactly what
 * JavaScript's String.length measures, so plain length arithmetic is safe.
 */
class DocContentBuilder {
  readonly requests: object[] = [];
  private index = 1; // Docs body content starts at index 1.

  addParagraph(text: string, style: NamedStyle): this {
    const content = `${text}\n`;
    this.requests.push({
      insertText: { location: { index: this.index }, text: content },
    });
    this.requests.push({
      updateParagraphStyle: {
        range: { startIndex: this.index, endIndex: this.index + content.length },
        paragraphStyle: { namedStyleType: style },
        fields: 'namedStyleType',
      },
    });
    this.index += content.length;
    return this;
  }
}

/**
 * Creates one Google Doc containing the complete client JSON record.
 * Written last so all submission details live in a single place.
 */
export async function createClientJsonDoc(
  parentFolderId: string,
  clientJson: object
): Promise<string> {
  const documentId = await createGoogleDoc('Client Information', parentFolderId);
  const jsonText = JSON.stringify(clientJson, null, 2);

  const builder = new DocContentBuilder();
  builder.addParagraph('Client Information — Full JSON', 'TITLE');
  builder.addParagraph(jsonText, 'NORMAL_TEXT');

  await withRetry(
    () =>
      docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: builder.requests },
      }),
    { label: 'fill Client Information JSON doc' }
  );

  return documentId;
}
