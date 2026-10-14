# Monthly spending summary
Type: ui

## Summary
Show a summary card at the top of the transactions screen that totals spending for the selected month by category.

## Acceptance criteria
- Given a month with transactions, when the screen opens, then the card shows the total spent and the top three categories with amounts in pounds.
- Given a month with no transactions, when the screen opens, then the card shows the empty state "No spending yet this month".
- Given the totals are being fetched, then a loading skeleton is shown in place of the card.
- Given the fetch fails, then the card shows an error message with a Retry button, and pressing Retry fetches again.
- Given a screen reader is active, when the card receives focus, then it announces the month, the total and the top category.

## Design
https://example.com/designs/monthly-summary

## Open questions
- [x] Do refunds reduce the category total? Yes, a refund is subtracted from its own category.
