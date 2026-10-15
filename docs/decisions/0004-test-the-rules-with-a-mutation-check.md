# 0004: Test the rules with a mutation check

Status: accepted

## Context

A rule is only trustworthy if a test fails when the rule breaks. Line coverage does not show that.

## Decision

`scripts/mutation-check.py` breaks 12 rules and behaviours one at a time (for example, ignoring unresolved
questions, applying the UI rules to every ticket type, or exiting 0 for a ticket that is not ready) and fails if
any run stays green. A pattern that no longer matches the code also fails, so the check cannot silently stop
covering a rule.

## Consequences

- All 12 are caught today, and CI runs the check.
- The patterns are tied to the code's text and need updating when a rule is refactored.
