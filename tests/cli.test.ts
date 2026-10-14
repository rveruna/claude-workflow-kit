import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { run } from '../src/cli.js';
import { formatResult } from '../src/report.js';
import { lintTicket } from '../src/lint.js';

const read = (p: string) => readFileSync(p, 'utf8');

describe('cli', () => {
  it('exits 0 when every ticket is ready', () => {
    const { code, stdout } = run(['tickets/001-monthly-summary.md', 'tickets/003-export-endpoint.md']);
    expect(code).toBe(0);
    expect(stdout).toContain('2 of 2 tickets ready');
  });

  it('exits 1 and explains why when a ticket is not ready', () => {
    const { code, stdout } = run(['tickets/002-improve-transactions.md']);
    expect(code).toBe(1);
    expect(stdout).toContain('NOT READY');
    expect(stdout).toContain('[questions-resolved]');
    expect(stdout).toContain('[ui-states]');
  });

  it('prints machine-readable output with --json', () => {
    const { stdout } = run(['--json', 'tickets/002-improve-transactions.md']);
    const parsed = JSON.parse(stdout) as { ready: boolean; findings: { rule: string }[] }[];
    expect(parsed[0]?.ready).toBe(false);
    expect(parsed[0]?.findings.some((f) => f.rule === 'design-linked')).toBe(true);
  });

  it('treats warnings as failures with --strict', () => {
    const content = '# T\nType: chore\n\n## Summary\nTidy up the build scripts so they are quick to run locally.\n\n## Acceptance criteria\n- Running the build shows no warnings.\n';
    expect(run(['t.md'], () => content).code).toBe(0);
    expect(run(['--strict', 't.md'], () => content).code).toBe(1);
  });

  it('exits 2 with usage when no file is given', () => {
    expect(run([])).toEqual({ code: 2, stdout: expect.stringContaining('Usage') });
  });

  it('exits 2 when a file cannot be read', () => {
    const result = run(['missing.md'], () => {
      throw new Error('ENOENT');
    });
    expect(result).toEqual({ code: 2, stdout: 'Cannot read missing.md' });
  });

  it('lists the rules with --rules', () => {
    expect(run(['--rules']).stdout).toContain('questions-resolved');
  });

  it('formats a finding with its line number', () => {
    const text = formatResult(lintTicket('x.md', read('tickets/002-improve-transactions.md')));
    expect(text).toMatch(/error\s+\[questions-resolved\]:\d+/);
  });
});

describe('the real command line', () => {
  const cli = (...args: string[]) =>
    spawnSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args], { encoding: 'utf8' });

  it('exits 0 for a ready ticket', () => {
    const result = cli('tickets/001-monthly-summary.md');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('READY');
  });

  it('exits 1 for a ticket that is not ready', () => {
    expect(cli('tickets/002-improve-transactions.md').status).toBe(1);
  });

  it('exits 2 for a missing file', () => {
    expect(cli('nope.md').status).toBe(2);
  });
});
