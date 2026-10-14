export type TicketType = 'ui' | 'api' | 'chore' | 'unknown';

export interface Line {
  text: string;
  /** 1-based line number in the source file. */
  line: number;
}

export interface Ticket {
  path: string;
  title: string | undefined;
  type: TicketType;
  meta: Record<string, string>;
  /** Sections keyed by lower-case heading, e.g. "acceptance criteria". */
  sections: Map<string, Line[]>;
}

export type Severity = 'error' | 'warning';

export interface Finding {
  rule: string;
  severity: Severity;
  message: string;
  line?: number;
}

export interface Rule {
  id: string;
  description: string;
  check(ticket: Ticket): Finding[];
}

export interface LintResult {
  path: string;
  ready: boolean;
  findings: Finding[];
}
