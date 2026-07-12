/**
 * Diagnostic: lists everything the authorized account can see in Drive,
 * and checks direct access to the configured root folder.
 * Run with: npx tsx scripts/check-drive-access.ts
 */
import { drive } from '../src/services/googleAuth';
import { config } from '../src/config/env';

async function main() {
  console.log('Auth mode: OAuth (your Google account)');
  console.log(`Configured root folder id: ${config.driveRootFolderId}\n`);

  try {
    const res = await drive.files.get({
      fileId: config.driveRootFolderId,
      supportsAllDrives: true,
      fields: 'id, name, mimeType, owners(emailAddress)',
    });
    console.log('ROOT FOLDER ACCESS: OK');
    console.log(`  Name: ${res.data.name}`);
    console.log(`  Owner: ${res.data.owners?.[0]?.emailAddress ?? '(shared drive)'}`);
  } catch (err) {
    const status = (err as { status?: number }).status;
    console.log(`ROOT FOLDER ACCESS: FAILED (HTTP ${status})`);
  }

  const list = await drive.files.list({
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    q: 'trashed = false',
    fields: 'files(id, name, mimeType, sharingUser(emailAddress))',
    pageSize: 50,
  });
  const files = list.data.files ?? [];
  console.log(`\nItems visible to the authorized account: ${files.length}`);
  for (const f of files) {
    const kind = f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file';
    console.log(`  - [${kind}] "${f.name}" (id: ${f.id})`);
  }
}

main().catch((err) => {
  console.error('Diagnostic failed:', (err as Error).message);
  process.exit(1);
});
