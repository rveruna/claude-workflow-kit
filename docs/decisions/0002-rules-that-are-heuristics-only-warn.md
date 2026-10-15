# 0002: Rules that are heuristics only warn

Status: accepted

## Context

Whether a summary has enough words is a fact. Whether a criterion is "testable as written" is not: the check
looks for a Given/When/Then shape or one of a short list of observable verbs, and that list is a small English
heuristic. Treating a heuristic as an error would block a good ticket for using a verb that is not on the list.

## Decision

Errors block a ticket and are reserved for facts: a missing title, summary, criteria, design link or state, and
any unresolved question. The vague-wording and observable-outcome checks only warn. `--strict` makes warnings
block too, for teams that want it.

## Consequences

- A ticket is never held up by the quality of a word list.
- Warnings can be ignored, so a team that ignores all of them gets less from the tool. `--strict` is there for that.
