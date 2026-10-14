import { describe, expect, it } from 'vitest';
import { listItems, parseTicket, sectionText } from '../src/parse.js';

const SAMPLE = `# Add a thing
Type: UI
Owner: Ada

## Summary
One line here.

## Acceptance criteria
- first item
* [ ] second item
1. [x] third item
plain text, not an item
`;

describe('parseTicket', () => {
  const ticket = parseTicket('t.md', SAMPLE);

  it('reads the title', () => {
    expect(ticket.title).toBe('Add a thing');
  });

  it('reads metadata with case-insensitive keys and type', () => {
    expect(ticket.meta['owner']).toBe('Ada');
    expect(ticket.type).toBe('ui');
  });

  it('falls back to unknown for a missing or unrecognised type', () => {
    expect(parseTicket('t.md', '# T\n').type).toBe('unknown');
    expect(parseTicket('t.md', '# T\nType: banana\n').type).toBe('unknown');
  });

  it('splits sections by lower-cased heading and keeps source line numbers', () => {
    const lines = ticket.sections.get('acceptance criteria');
    expect(lines?.[0]).toEqual({ text: '- first item', line: 9 });
  });

  it('ignores a second top-level heading and blank lines', () => {
    const t = parseTicket('t.md', '# One\n# Two\n\n## Summary\n\nbody\n');
    expect(t.title).toBe('One');
    expect(t.sections.get('summary')).toEqual([{ text: 'body', line: 6 }]);
  });

  it('handles Windows line endings', () => {
    const t = parseTicket('t.md', '# T\r\nType: api\r\n\r\n## Summary\r\nhello\r\n');
    expect(t.type).toBe('api');
    expect(sectionText(t.sections.get('summary'))).toBe('hello');
  });
});

describe('listItems', () => {
  const items = listItems(parseTicket('t.md', SAMPLE).sections.get('acceptance criteria'));

  it('returns bullets and numbered items with markers stripped', () => {
    expect(items.map((i) => i.text)).toEqual(['first item', 'second item', 'third item']);
  });

  it('tracks ticked checkboxes', () => {
    expect(items.map((i) => i.checked)).toEqual([false, false, true]);
  });

  it('returns nothing for a missing section', () => {
    expect(listItems(undefined)).toEqual([]);
    expect(sectionText(undefined)).toBe('');
  });
});
