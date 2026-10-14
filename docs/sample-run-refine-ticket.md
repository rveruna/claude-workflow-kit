# Sample run: `/refine-ticket`

A real run of the command on `tickets/002-improve-transactions.md`, using Claude Code in non-interactive
mode (`claude -p "/refine-ticket tickets/002-improve-transactions.md"`). The output is unedited except that
one closing line about an unrelated local tooling log is left out. Model output varies between runs.

What to notice: the linter's errors come first and verbatim, the questions are for the product owner and
come with options but no answers, every claim about the code cites a file and line, and it proposes no
criteria because every gap needs a product decision first.

---

**Verdict:** Not ready. The summary is 3 words, the criteria can't be verified, and the design and the two open questions are unanswered. [Certain]

Nobody can say what "improve" means yet, so building now would mean guessing the requirements.

**Blockers** (linter `error` findings, verbatim):
- `summary-present`: Summary is 3 words; explain the change in at least 8.
- `ui-states`: No loading state described. Add it to the criteria or a "## States" section.
- `ui-states`: No error state described. Add it to the criteria or a "## States" section.
- `ui-states`: No empty state described. Add it to the criteria or a "## States" section.
- `design-linked`: Add a "## Design" section with a link to the design.
- `questions-resolved` (line 12): Unresolved question: "Which devices do we need to support?". Answer it and tick it with [x].
- `questions-resolved` (line 13): Unresolved question: "What does "better" mean for people with hundreds of transactions?". Answer it and tick it with [x].

The linter also raised warnings on both criteria: `criteria-observable` and `no-vague-language` on "fast", "easy", "nice" and "etc" (lines 8-9).

**Questions for the product owner:**

You are probably treating the two open questions as the whole gap. They are the smallest part of it, because the ticket never says what problem it solves.

1. **What is wrong with the screen today?** This decides the scope. Without it, "better" can't be tested, and two people could build different things and both claim to be right.
   - Options: slow to load, hard to find a transaction, hard to read, or something else.
2. **What does "better" mean for hundreds of transactions?** This is the ticket's own open question. The behaviour changes a lot depending on the answer.
   - Options: pagination, infinite scroll, search, filter by category or date, grouping by day or month, or a combination.
3. **Which devices and screen sizes are in scope?** This is also the ticket's own open question. "All devices etc" has no edge.
   - Options: a named list of phones and browsers, a minimum width, or whatever your analytics shows.
4. **What does "fast" mean, as a number?** Without a number it can't be tested.
   - Options: time to first rows under N ms on a named connection, or time to scroll or filter under N ms. Or drop the criterion and cover speed through the loading state.
5. **Is accessibility in scope?** The ticket is silent on screen-reader announcements, focus order and error recovery, and "easy to use" could mean any of them.
   - Options: a WCAG level, or a stated out-of-scope.
6. **Where is the design?** The linter requires a link. If there is no design, that is a blocker in itself.
7. **What do the loading, error and empty states look like?** The linter requires all three.
   - Example: ticket 001 uses the wording "No spending yet this month" for its empty state. Say whether this screen reuses it or needs its own.

**Gaps between the ticket and the code:**
- I found no code for a transactions screen anywhere in the repo, so I can't check any criterion against existing behaviour. The only related code is `examples/budget-app/src/summary.ts:24-37`, the monthly summary calculation, and it has no UI, no list, no sorting, no pagination and no filtering.
- The `Transaction` type at `examples/budget-app/src/summary.ts:1-8` has `id`, `date`, `category` and `amountPence`. It has no merchant, description or account. If "better" means search, the data to search doesn't exist yet. [Likely]
- Ticket 001 (`tickets/001-monthly-summary.md:5`) puts a summary card at the top of this same screen. Ticket 002 doesn't mention it, so it's unclear whether the improvements must leave that card alone. [Guessing]

**Proposed criteria:** none. Every gap above needs a product decision first, and I'd only be making up requirements. Once questions 1-3 are answered, I can draft criteria for sign-off.

I didn't edit the ticket.
