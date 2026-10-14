export interface Transaction {
  id: string;
  /** ISO date, e.g. 2026-09-14. */
  date: string;
  category: string;
  /** Positive for spending, negative for a refund. */
  amountPence: number;
}

export interface CategoryTotal {
  category: string;
  totalPence: number;
}

export interface MonthlySummary {
  month: string;
  totalPence: number;
  topCategories: CategoryTotal[];
}

const TOP_CATEGORY_COUNT = 3;

/** Totals a month's spending by category; refunds reduce their own category. */
export function monthlySummary(transactions: Transaction[], month: string): MonthlySummary {
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (!t.date.startsWith(month)) continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amountPence);
  }
  const totals = [...byCategory].map(([category, totalPence]) => ({ category, totalPence }));
  totals.sort((a, b) => b.totalPence - a.totalPence || a.category.localeCompare(b.category));
  return {
    month,
    totalPence: totals.reduce((sum, c) => sum + c.totalPence, 0),
    topCategories: totals.slice(0, TOP_CATEGORY_COUNT),
  };
}
