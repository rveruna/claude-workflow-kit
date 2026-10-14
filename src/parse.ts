import type { Line, Ticket, TicketType } from './types.js';

const TYPES: readonly TicketType[] = ['ui', 'api', 'chore'];
const META_LINE = /^([A-Za-z][A-Za-z ]*):\s*(.+)$/;

/** Parses a markdown ticket: `# Title`, `Key: value` lines, then `## Section` blocks. */
export function parseTicket(path: string, content: string): Ticket {
  const meta: Record<string, string> = {};
  const sections = new Map<string, Line[]>();
  let title: string | undefined;
  let current: Line[] | undefined;

  content.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    const text = raw.trim();

    if (text.startsWith('## ')) {
      current = [];
      sections.set(text.slice(3).trim().toLowerCase(), current);
      return;
    }
    if (text.startsWith('# ') && title === undefined) {
      title = text.slice(2).trim();
      return;
    }
    if (current) {
      if (text !== '') current.push({ text, line });
      return;
    }
    const match = META_LINE.exec(text);
    if (match?.[1] && match[2]) meta[match[1].trim().toLowerCase()] = match[2].trim();
  });

  const declared = meta['type']?.toLowerCase();
  const type = TYPES.find((t) => t === declared) ?? 'unknown';
  return { path, title, type, meta, sections };
}

const LIST_MARKER = /^(?:[-*]|\d+[.)])\s+/;
const CHECKBOX = /^\[( |x|X)\]\s*/;

export interface Item extends Line {
  /** True for `- [x]` items, false for `- [ ]` and plain bullets. */
  checked: boolean;
}

/** List items of a section, with the bullet and checkbox stripped from `text`. */
export function listItems(lines: Line[] | undefined): Item[] {
  const items: Item[] = [];
  for (const { text, line } of lines ?? []) {
    const withoutMarker = text.replace(LIST_MARKER, '');
    if (withoutMarker === text) continue;
    const box = CHECKBOX.exec(withoutMarker);
    items.push({
      text: withoutMarker.replace(CHECKBOX, '').trim(),
      line,
      checked: box?.[1]?.toLowerCase() === 'x',
    });
  }
  return items;
}

export function sectionText(lines: Line[] | undefined): string {
  return (lines ?? []).map((l) => l.text).join(' ');
}
