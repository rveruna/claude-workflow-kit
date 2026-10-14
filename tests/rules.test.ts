import { describe, expect, it } from 'vitest';
import { lintTicket } from '../src/lint.js';
import { describeRules } from '../src/rules/index.js';

const GOOD_UI = `# Title
Type: ui

## Summary
Show a clear summary card at the top of the transactions screen for the month.

## Acceptance criteria
- Given a month with data, when the screen opens, then the card shows the total.
- Given no data, then the empty state is shown.
- Given loading, then a skeleton is shown.
- Given a failure, then an error message is shown.

## Design
https://example.com/design
`;

function ruleIds(content: string): string[] {
  return lintTicket('t.md', content).findings.map((f) => f.rule);
}

describe('a ticket that meets every rule', () => {
  it('is ready with no findings', () => {
    const result = lintTicket('t.md', GOOD_UI);
    expect(result.findings).toEqual([]);
    expect(result.ready).toBe(true);
  });
});

describe('title-present and type-declared', () => {
  it('requires a title', () => {
    expect(ruleIds(GOOD_UI.replace('# Title\n', ''))).toContain('title-present');
  });

  it('warns, without blocking, when the type is missing', () => {
    const result = lintTicket('t.md', GOOD_UI.replace('Type: ui\n', ''));
    expect(result.findings.map((f) => f.rule)).toContain('type-declared');
    expect(result.findings.find((f) => f.rule === 'type-declared')?.severity).toBe('warning');
  });
});

describe('summary-present', () => {
  it('requires a summary', () => {
    expect(ruleIds(GOOD_UI.replace(/## Summary\n.*\n/, ''))).toContain('summary-present');
  });

  it('rejects a summary that is too short to explain anything', () => {
    const content = GOOD_UI.replace(/Show a clear.*\n/, 'Make it better.\n');
    const finding = lintTicket('t.md', content).findings.find((f) => f.rule === 'summary-present');
    expect(finding?.message).toContain('3 words');
  });
});

describe('criteria rules', () => {
  it('requires acceptance criteria', () => {
    expect(ruleIds(GOOD_UI.replace(/## Acceptance criteria[\s\S]*## Design/, '## Design'))).toContain('criteria-present');
  });

  it('warns about criteria with no observable outcome, with the line number', () => {
    const content = GOOD_UI.replace('- Given no data, then the empty state is shown.', '- The screen handles empty data gracefully');
    const finding = lintTicket('t.md', content).findings.find((f) => f.rule === 'criteria-observable');
    expect(finding?.line).toBe(9);
    expect(finding?.message).toContain('handles empty data gracefully');
  });

  it('flags each vague word once per line it appears on', () => {
    const content = GOOD_UI.replace('then the card shows the total.', 'then it is fast and easy.');
    const vague = lintTicket('t.md', content).findings.filter((f) => f.rule === 'no-vague-language');
    expect(vague.map((f) => f.message)).toEqual(
      expect.arrayContaining([expect.stringContaining('"fast"'), expect.stringContaining('"easy"')]),
    );
  });

  it('does not treat a word that merely contains a vague term as vague', () => {
    const content = GOOD_UI.replace('then the card shows the total.', 'then the card shows the goodwill total.');
    expect(ruleIds(content)).not.toContain('no-vague-language');
  });
});

describe('UI-only rules', () => {
  it('requires loading, error and empty states for ui tickets', () => {
    const content = GOOD_UI.replace('- Given loading, then a skeleton is shown.\n', '');
    const messages = lintTicket('t.md', content)
      .findings.filter((f) => f.rule === 'ui-states')
      .map((f) => f.message);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('loading');
  });

  it('accepts states described in a separate States section', () => {
    const content = GOOD_UI.replace(/- Given no data.*\n- Given loading.*\n- Given a failure.*\n/, '') + '\n## States\nLoading, error and empty are covered by the design.\n';
    expect(ruleIds(content)).not.toContain('ui-states');
  });

  it('requires a design link for ui tickets', () => {
    expect(ruleIds(GOOD_UI.replace('https://example.com/design', 'see Figma'))).toContain('design-linked');
  });

  it('skips ui-only rules for api and chore tickets', () => {
    const api = GOOD_UI.replace('Type: ui', 'Type: api').replace(/## Design\n.*\n/, '');
    expect(ruleIds(api)).not.toContain('design-linked');
    expect(ruleIds(api)).not.toContain('ui-states');
  });
});

describe('questions-resolved', () => {
  it('blocks on unresolved questions and reports their line', () => {
    const content = GOOD_UI + '\n## Open questions\n- [ ] Which month is the default?\n- [x] Do refunds count? Yes.\n';
    const findings = lintTicket('t.md', content).findings.filter((f) => f.rule === 'questions-resolved');
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain('Which month');
    expect(lintTicket('t.md', content).ready).toBe(false);
  });
});

describe('result ordering and rule catalogue', () => {
  it('orders findings by line number', () => {
    const lines = lintTicket('t.md', '# T\nType: ui\n\n## Summary\nhi\n\n## Acceptance criteria\n- be nice\n- be fast\n').findings
      .map((f) => f.line ?? 0);
    expect(lines).toEqual([...lines].sort((a, b) => a - b));
  });

  it('describes every rule', () => {
    expect(describeRules().length).toBeGreaterThanOrEqual(9);
  });
});
