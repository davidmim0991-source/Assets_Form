import { docs } from './googleAuth';
import { withRetry } from '../utils/retry';
import { createGoogleDoc } from './drive.service';
import { SubmissionData } from '../types';

/**
 * Google Docs service.
 * Creates the human-readable "Client Information" document.
 */

type NamedStyle = 'TITLE' | 'SUBTITLE' | 'HEADING_2' | 'NORMAL_TEXT';

const PAGE_LABELS: Record<string, string> = {
  homepage: 'דף הבית',
  about: 'אודותינו',
  contact: 'צור קשר',
  faq: 'שאלות נפוצות',
  privacy: 'מדיניות פרטיות',
  landing: 'דף נחיתה',
};

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

const EMPTY = '—';

function value(v: string | undefined): string {
  const trimmed = (v ?? '').trim();
  return trimmed === '' ? EMPTY : trimmed;
}

/**
 * Creates and fills the human-readable "Client Information" Google Doc.
 */
export async function createClientInformationDoc(
  parentFolderId: string,
  data: SubmissionData,
  clientNumber: string,
  submissionDate: string
): Promise<string> {
  const documentId = await createGoogleDoc('Client Information', parentFolderId);

  const palettesText =
    data.selectedPalettes.length > 0
      ? data.selectedPalettes.map((p) => `${p.id}: ${p.colors.join(', ')}`).join('\n')
      : EMPTY;

  const pagesText =
    data.selectedPageTypes.length > 0
      ? data.selectedPageTypes.map((id) => PAGE_LABELS[id] || id).join(', ')
      : EMPTY;

  const sections: Array<[heading: string, content: string]> = [
    ['Business Name', value(data.businessName)],
    ['Email', value(data.email)],
    ['Phone', value(data.phone)],
    ['Instagram', value(data.instagram)],
    ['Facebook', value(data.facebook)],
    ['TikTok', value(data.tiktok)],
    ['Brand Colors', value(data.brandColors)],
    ['Selected Color Palettes', palettesText],
    ['Fonts', value(data.fonts)],
    ['Domain', value(data.domain)],
    ['Existing Website', value(data.existingWebsite)],
    ['Portfolio Link', value(data.portfolioLink)],
    ['Requested Pages', pagesText],
    ['Design Style', data.designStyleText ?? EMPTY],
    ['Testimonials', value(data.testimonialsText)],
    ['About the Business', value(data.aboutBusiness)],
    ['Additional Notes', value(data.notes)],
    ['Submission Date', submissionDate],
    ['Client Number', clientNumber],
  ];

  const builder = new DocContentBuilder();
  builder.addParagraph('Client Information', 'TITLE');
  builder.addParagraph(`${clientNumber} - ${data.businessName}`, 'SUBTITLE');
  for (const [heading, content] of sections) {
    builder.addParagraph(heading, 'HEADING_2');
    builder.addParagraph(content, 'NORMAL_TEXT');
  }

  await withRetry(
    () =>
      docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: builder.requests },
      }),
    { label: 'fill Client Information doc' }
  );

  return documentId;
}
