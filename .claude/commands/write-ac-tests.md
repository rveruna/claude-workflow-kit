---
description: Turn an approved ticket's acceptance criteria into Gherkin scenarios and test skeletons
argument-hint: <path to ticket.md>
allowed-tools: Bash(npx tsx src/cli.ts:*), Bash(npx vitest:*), Read, Write, Grep, Glob
---

Turn the acceptance criteria in `$ARGUMENTS` into executable checks.

## 1. Only proceed for a ticket that is ready

Run `npx tsx src/cli.ts $ARGUMENTS`. If the ticket is not ready, stop and say why. Tests written from
criteria nobody has agreed are just guesses written down.

## 2. One scenario per criterion

Write `features/<ticket-slug>.feature`. Each criterion becomes one scenario in Given / When / Then
form, keeping the ticket's own wording so the link back to the ticket stays obvious. If a criterion
cannot be written as a scenario, list it under "Not testable as written" and say what is missing.
Do not invent behaviour to make it fit.

## 3. One test per scenario

Write `tests/<ticket-slug>.test.ts` using vitest. Each scenario gets a test named after it, arranged as
arrange, act, assert, calling the real code. Reuse helpers that already exist in `tests/`.

## 4. Prove the tests can fail

Run the tests. Then break the code under test in one small way (for example flip a comparison) and
confirm at least one test fails, then restore it. A test that cannot fail proves nothing. Report which
mutation you tried and which test caught it.

## Rules

- Never weaken an assertion to make a test pass. If a test fails, report it as a finding.
- Do not change production code unless the user asks. Report failing criteria instead.
- Finish with a table: criterion, scenario, test, and whether it passed.
