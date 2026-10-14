import { parseTicket } from './parse.js';
import { rules } from './rules/index.js';
import type { Finding, LintResult } from './types.js';

export function lintTicket(path: string, content: string): LintResult {
  const ticket = parseTicket(path, content);
  const findings: Finding[] = rules.flatMap((rule) => rule.check(ticket));
  findings.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
  return { path, ready: findings.every((f) => f.severity !== 'error'), findings };
}
