# Export transactions as CSV
Type: api

## Summary
Add an endpoint that returns a user's transactions for a chosen month as a downloadable CSV file.

## Acceptance criteria
- Given a valid month, when the endpoint is called, then it returns a CSV with one row per transaction and a header row.
- Given a month with no transactions, when the endpoint is called, then it returns only the header row.
- Given an invalid month value, when the endpoint is called, then it rejects the request with a 400 status and a clear message.
