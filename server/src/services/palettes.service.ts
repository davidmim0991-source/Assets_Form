import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { config } from '../config/env';

/**
 * Color palettes service.
 * Palettes are read from a local file in the project directory (a Word
 * document or plain text/CSS file) containing coolors.co CSS exports.
 * Each export block starts with a "CSS HEX" comment followed by CSS
 * variables, e.g.:
 *
 *   /* CSS HEX *\/
 *   --crimson-violet: #5f0f40ff;
 *   --deep-crimson: #9a031eff;
 *
 * Every "CSS HEX" block becomes one selectable palette, so new palettes can
 * be added by pasting another export into the file. The file's modification
 * time is used to refresh the cache automatically.
 */

export interface Palette {
  id: string;
  /** Human-readable color names derived from the CSS variable names. */
  colorNames: string[];
  /** 6-digit hex values, e.g. "#5f0f40". */
  colors: string[];
}

let cache: { palettes: Palette[]; mtimeMs: number } | null = null;

/** Extracts plain text from a .docx file (a zip containing word/document.xml). */
function extractDocxText(filePath: string): string {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry('word/document.xml');
  if (!entry) throw new Error(`"${path.basename(filePath)}" is not a valid .docx file`);
  const xml = entry.getData().toString('utf-8');
  // Paragraph ends become newlines; all other tags are stripped.
  return xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/** Parses every "CSS HEX" export block into a palette. */
export function parsePalettes(text: string): Palette[] {
  const palettes: Palette[] = [];
  // Split on the "CSS HEX" comment; the first chunk (before it) has no palette.
  const blocks = text.split(/\/\*\s*CSS\s+HEX\s*\*\//i).slice(1);

  for (const block of blocks) {
    // Only read up to the next comment so HSL/SCSS duplicates are ignored.
    const section = block.split('/*')[0];
    const colorNames: string[] = [];
    const colors: string[] = [];

    const varRegex = /--([\w-]+)\s*:\s*#([0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?\s*;/g;
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(section)) !== null) {
      colorNames.push(match[1].replace(/-/g, ' '));
      colors.push(`#${match[2].toLowerCase()}`);
    }

    if (colors.length > 0) {
      palettes.push({ id: `palette-${palettes.length + 1}`, colorNames, colors });
    }
  }
  return palettes;
}

/** Reads and parses the palettes file; cached until the file changes on disk. */
export async function getPalettes(): Promise<Palette[]> {
  const filePath = config.colorPalettesFile;
  if (!filePath || !fs.existsSync(filePath)) {
    if (filePath) console.warn(`[palettes] File not found: ${filePath}`);
    return [];
  }

  const { mtimeMs } = fs.statSync(filePath);
  if (cache && cache.mtimeMs === mtimeMs) return cache.palettes;

  const text = filePath.toLowerCase().endsWith('.docx')
    ? extractDocxText(filePath)
    : fs.readFileSync(filePath, 'utf-8');

  const palettes = parsePalettes(text);
  cache = { palettes, mtimeMs };
  console.log(`[palettes] Loaded ${palettes.length} palettes from ${path.basename(filePath)}`);
  return palettes;
}
