import type { LintResult } from './types.js';

export function formatResult(result: LintResult): string {
  const header = `${result.ready ? 'READY    ' : 'NOT READY'}  ${result.path}`;
  const lines = result.findings.map((f) => {
    const where = f.line ? `:${f.line}` : '';
    return `  ${f.severity === 'error' ? 'error  ' : 'warning'}  [${f.rule}]${where}  ${f.message}`;
  });
  return [header, ...lines].join('\n');
}

export function formatSummary(results: LintResult[]): string {
  const ready = results.filter((r) => r.ready).length;
  return `\n${ready} of ${results.length} tickets ready`;
}
