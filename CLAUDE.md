# claude-workflow-kit

A ticket-readiness linter (`src/`) plus two Claude Code commands (`.claude/commands/`).

- `npm test` runs the suite. `npm run mutation-check` breaks each rule on purpose and expects a test to fail.
- Rules live in `src/rules/index.ts`. Add a rule there with a test in `tests/rules.test.ts` and a mutation in
  `scripts/mutation-check.py`.
- Keep rules deterministic. Judgement calls belong in the commands, not the linter.
- Everything in `tickets/` and `examples/` is invented sample data.
