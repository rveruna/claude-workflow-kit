import { describe, expect, it } from 'vitest';
import { monthlySummary, type Transaction } from '../examples/budget-app/src/summary.js';

// These tests follow the acceptance criteria in tickets/001-monthly-summary.md.
const tx = (id: string, date: string, category: string, amountPence: number): Transaction => ({
  id,
  date,
  category,
  amountPence,
});

describe('monthlySummary (ticket 001)', () => {
  const data = [
    tx('1', '2026-09-02', 'Groceries', 4500),
    tx('2', '2026-09-09', 'Groceries', 3000),
    tx('3', '2026-09-10', 'Transport', 2000),
    tx('4', '2026-09-11', 'Eating out', 1500),
    tx('5', '2026-09-12', 'Fun', 500),
    tx('6', '2026-08-30', 'Groceries', 9999),
  ];

  it('totals the month and returns the top three categories, biggest first', () => {
    const summary = monthlySummary(data, '2026-09');
    expect(summary.totalPence).toBe(11500);
    expect(summary.topCategories).toEqual([
      { category: 'Groceries', totalPence: 7500 },
      { category: 'Transport', totalPence: 2000 },
      { category: 'Eating out', totalPence: 1500 },
    ]);
  });

  it('ignores other months', () => {
    expect(monthlySummary(data, '2026-08').totalPence).toBe(9999);
  });

  it('returns an empty summary for a month with no transactions (empty state)', () => {
    expect(monthlySummary(data, '2026-10')).toEqual({ month: '2026-10', totalPence: 0, topCategories: [] });
  });

  it('subtracts a refund from its own category (resolved open question)', () => {
    const summary = monthlySummary([...data, tx('7', '2026-09-20', 'Groceries', -2500)], '2026-09');
    expect(summary.topCategories[0]).toEqual({ category: 'Groceries', totalPence: 5000 });
  });

  it('breaks ties alphabetically so the order is stable', () => {
    const summary = monthlySummary([tx('1', '2026-09-01', 'B', 100), tx('2', '2026-09-01', 'A', 100)], '2026-09');
    expect(summary.topCategories.map((c) => c.category)).toEqual(['A', 'B']);
  });
});
