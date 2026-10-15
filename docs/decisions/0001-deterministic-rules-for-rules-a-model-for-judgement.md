# 0001: Use code for rules and a model for judgement

Status: accepted

## Context

A ticket is ready when it can be built without guessing. Some of that is a matter of fact (is there a design
link, are any questions still open) and some is a matter of judgement (do two criteria contradict each other,
does the ticket match what the code does). A model can do both, but it can also be talked out of a rule, and
its answer to the same question can change between runs.

## Decision

Rules that have a right answer are code (`src/rules/`), tested and repeatable. Anything that needs reading the
codebase or weighing meaning is left to a model, in the Claude Code commands. The commands run the linter first
and treat its errors as blockers.

## Consequences

- The same ticket always gets the same rule results, and a rule change shows up in a test.
- The model's output is advice to read, not a verdict. A sample run is in
  [docs/sample-run-refine-ticket.md](../sample-run-refine-ticket.md).
- The commands are prompts and are not evaluated at scale. That is stated in the README.
