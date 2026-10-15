# 0003: The commands never overrule the linter or edit the ticket

Status: accepted

## Context

A model asked to review a ticket tends to be helpful in the wrong way: it softens a failed check, answers the
questions it should have raised, or quietly rewrites the requirements.

## Decision

`/refine-ticket` reports the linter's errors verbatim before adding anything of its own, asks the product owner
questions with options but never answers them, cites a file and line for every claim about the code, and does
not edit the ticket. `/write-ac-tests` refuses to run on a ticket that is not ready, and proves each test can
fail by breaking the code in one small way.

## Consequences

- The output is more cautious than a free-form review, and says "not ready" more often.
- A real run on the not-ready sample ticket produced seven blockers, seven questions with options, code gaps
  with file and line evidence, and no invented criteria.
