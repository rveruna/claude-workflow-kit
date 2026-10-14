---
description: Check a ticket is ready to build, against the real code, without assuming anything
argument-hint: <path to ticket.md>
allowed-tools: Bash(npx tsx src/cli.ts:*), Read, Grep, Glob
---

Review the ticket at `$ARGUMENTS` before anyone starts building it. Your job is to find what is
missing or contradictory, not to fill the gaps yourself.

## 1. Run the deterministic checks first

Run `npx tsx src/cli.ts --json $ARGUMENTS`. These rules are code, not opinion. Report every `error`
finding verbatim as a blocker before you add anything of your own. Do not argue with the linter.

## 2. Read the ticket, then the code it touches

Read the ticket. Use Grep and Glob to find the code each criterion depends on, then read it.
If you cannot find code for something, say so. Never assume how existing behaviour works.

## 3. Look for what the linter cannot see

- Two criteria that contradict each other, or a criterion that contradicts what the code does today.
- Terms the ticket never defines (for example "active", "recent", "total").
- Edge cases the criteria skip: zero, one, many, boundaries, permissions, concurrent changes.
- States and accessibility: what a screen reader announces, focus order, error recovery.
- Criteria that two people could implement differently and both claim to be right.

## 4. Report in exactly this shape

**Verdict:** Ready or Not ready, with one sentence why.

**Blockers:** the linter errors, verbatim.

**Questions for the product owner:** numbered. For each, say why it matters and list the options you
see, so the answer is quick. Never answer your own question.

**Gaps between the ticket and the code:** each with `file:line` evidence.

**Proposed criteria:** only for gaps you found. Label every one "proposal, needs sign-off".

## Rules

- Do not edit the ticket. Someone with authority over the requirements decides what changes.
- Every claim about the code cites `file:line`. No citation, no claim.
- If the ticket is ready, say so plainly and stop. Do not invent concerns to look thorough.
