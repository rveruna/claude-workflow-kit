import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lintTicket } from './lint.js';
import { formatResult, formatSummary } from './report.js';
import { describeRules } from './rules/index.js';

export interface CliOutput {
  code: number;
  stdout: string;
}

const USAGE = 'Usage: ticket-lint [--json] [--strict] [--rules] <ticket.md>...';

/** Exit code 0 = every ticket ready, 1 = at least one not ready, 2 = bad usage or unreadable file. */
export function run(args: string[], read: (path: string) => string = (p) => readFileSync(p, 'utf8')): CliOutput {
  const json = args.includes('--json');
  const strict = args.includes('--strict');
  if (args.includes('--rules')) return { code: 0, stdout: describeRules().join('\n') };

  const paths = args.filter((a) => !a.startsWith('--'));
  if (paths.length === 0) return { code: 2, stdout: USAGE };

  const results = [];
  for (const path of paths) {
    let content: string;
    try {
      content = read(path);
    } catch {
      return { code: 2, stdout: `Cannot read ${path}` };
    }
    const result = lintTicket(path, content);
    if (strict && result.findings.length > 0) result.ready = false;
    results.push(result);
  }

  const code = results.every((r) => r.ready) ? 0 : 1;
  const stdout = json
    ? JSON.stringify(results, null, 2)
    : results.map(formatResult).join('\n\n') + formatSummary(results);
  return { code, stdout };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code, stdout } = run(process.argv.slice(2));
  console.log(stdout);
  process.exitCode = code;
}
