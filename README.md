# claude-workflow-kit

[![CI](https://github.com/rveruna/claude-workflow-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/rveruna/claude-workflow-kit/actions/workflows/ci.yml)
[![CodeQL](https://github.com/rveruna/claude-workflow-kit/actions/workflows/codeql.yml/badge.svg)](https://github.com/rveruna/claude-workflow-kit/actions/workflows/codeql.yml)

Tickets that reach developers half-defined cost more than any bug: someone builds the wrong thing, or
stops to ask questions that could have been answered a week earlier. This kit checks a ticket **before**
work starts, using the right tool for each kind of check:

- **Code for rules.** A small, tested linter decides things that have a right answer: is there a summary,
  are there testable criteria, does a UI ticket cover loading, error and empty states, is there a design
  link, are any questions still open.
- **An LLM for judgement.** Two [Claude Code](https://claude.com/claude-code) commands handle what code
  can't: contradictions, undefined terms, gaps between the ticket and the real codebase, and turning approved
  criteria into tests.

The commands run the linter first and treat its errors as blockers, so the model never overrules a
deterministic rule. Everything in `tickets/` and `examples/` is invented sample data.

## The linter

```text
$ npx tsx src/cli.ts tickets/001-monthly-summary.md
READY      tickets/001-monthly-summary.md
1 of 1 tickets ready
```

```text
$ npx tsx src/cli.ts tickets/002-improve-transactions.md
NOT READY  tickets/002-improve-transactions.md
  error    [summary-present]  Summary is 3 words; explain the change in at least 8.
  error    [ui-states]  No loading state described. Add it to the criteria or a "## States" section.
  error    [ui-states]  No error state described. Add it to the criteria or a "## States" section.
  error    [ui-states]  No empty state described. Add it to the criteria or a "## States" section.
  error    [design-linked]  Add a "## Design" section with a link to the design.
  warning  [criteria-observable]:8  Not testable as written: "The screen should be fast and easy to use". ...
  warning  [no-vague-language]:8  "fast" cannot be verified. Give a measurable or observable alternative.
  warning  [no-vague-language]:8  "easy" cannot be verified. Give a measurable or observable alternative.
  error    [questions-resolved]:12  Unresolved question: "Which devices do we need to support?". ...
  ...
0 of 1 tickets ready
```

Errors block a ticket. Warnings are advice (`--strict` makes them block too). `--json` gives machine-readable
output and the exit code is 0 (ready), 1 (not ready) or 2 (bad usage), so it drops into CI or a pre-commit hook.
`--rules` lists every rule.

| Rule | What it checks |
|---|---|
| `title-present`, `type-declared` | The ticket has a title and a `Type:` so type-specific rules are not silently skipped |
| `summary-present` | A summary of at least 8 words |
| `criteria-present`, `criteria-observable` | Acceptance criteria exist and each states something observable |
| `no-vague-language` | No "fast", "easy", "nice", "etc" and similar words nobody can verify |
| `ui-states` (UI tickets) | Loading, error and empty states are described |
| `design-linked` (UI tickets) | A design link is present |
| `questions-resolved` | No unticked open questions |

## The Claude Code commands

| Command | What it does |
|---|---|
| `/refine-ticket <ticket.md>` | Runs the linter, reads the code the ticket touches, and reports contradictions, undefined terms and ticket-versus-code gaps, with `file:line` evidence. Questions go to the product owner and the model never answers them itself. Never edits the ticket. |
| `/write-ac-tests <ticket.md>` | Refuses unless the ticket is ready, then turns each criterion into a Gherkin scenario and a vitest test, and proves the tests can fail by breaking the code in one small way. |

`tests/example-summary.test.ts` shows the kind of test the second command produces, written against the
invented budget app in `examples/`.

[`docs/sample-run-refine-ticket.md`](docs/sample-run-refine-ticket.md) is a real run of `/refine-ticket` on the
not-ready sample ticket, so you can see the output without installing anything. `/write-ac-tests` has not been
run end to end yet.

## How it is tested

- 41 tests, 97.7% statement and 98.6% branch coverage, with thresholds enforced in CI.
- Tests include the real command line: exit codes are checked by running the CLI as a process.
- `npm run mutation-check` breaks the rules, the parser and the CLI on purpose, 12 ways in all, and expects a test to fail every time (12 of 12 caught).

## Practices

- **CI on every push to main and every pull request:** lint, a Prettier check, an audit of production dependencies (high severity and above), the type-check, the tests with coverage, the mutation check, and the sample tickets that should be ready.
- **Before every commit:** a Husky hook formats and lints the staged files.
- **Kept current and watched:** Dependabot groups weekly updates, and CodeQL scans every push to main, every pull request and weekly.
- **Decisions are written down:** [docs/decisions](docs/decisions) records the choices that were not obvious, starting with [why code decides the rules and a model handles judgement](docs/decisions/0001-deterministic-rules-for-rules-a-model-for-judgement.md).
- **No runtime dependencies:** the tool imports only Node built-ins (it runs through tsx, a dev dependency), so there is nothing to audit in production.

## Limits

- The two commands are prompts. The linter is tested; the commands are not evaluated at scale, so treat their output as a review to read, not a verdict.
- The vague-word and observable-verb lists are small English heuristics, which is why those rules only warn.
- The parser expects the simple markdown layout shown in `tickets/`.

## Run it

```bash
npm install
npm test
npm run test:coverage
npm run mutation-check
npm run demo        # lint every sample ticket
```

To use the commands, open this folder in Claude Code and run `/refine-ticket tickets/002-improve-transactions.md`.

## Licence

MIT
