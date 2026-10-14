import { listItems, sectionText } from '../parse.js';
import type { Finding, Rule, Ticket } from '../types.js';

const MIN_SUMMARY_WORDS = 8;

const VAGUE_TERMS = [
  'fast', 'quick', 'quickly', 'easy', 'easily', 'intuitive', 'user-friendly', 'nice', 'good',
  'seamless', 'properly', 'appropriate', 'appropriately', 'as needed', 'etc', 'and so on', 'simple',
];

const OBSERVABLE_VERBS = [
  'shows', 'displays', 'returns', 'rejects', 'sends', 'saves', 'disables', 'enables', 'navigates',
  'announces', 'redirects', 'hides', 'creates', 'deletes', 'updates', 'stores', 'logs', 'blocks',
  'allows', 'fails', 'succeeds', 'appears', 'renders', 'prevents', 'redirected', 'shown', 'saved',
];

const URL = /https?:\/\/\S+/i;
const GIVEN_WHEN_THEN = /\bgiven\b.*\bwhen\b.*\bthen\b/i;

function mentions(text: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/[-]/g, '\\-')}\\b`, 'i').test(text);
}

const titlePresent: Rule = {
  id: 'title-present',
  description: 'A ticket has a title.',
  check: (t) =>
    t.title ? [] : [{ rule: 'title-present', severity: 'error', message: 'Add a "# Title" heading.' }],
};

const typeDeclared: Rule = {
  id: 'type-declared',
  description: 'The ticket declares Type: ui, api or chore, so type-specific rules are not skipped.',
  check: (t) =>
    t.type === 'unknown'
      ? [{ rule: 'type-declared', severity: 'warning', message: 'Add "Type: ui", "Type: api" or "Type: chore".' }]
      : [],
};

const summaryPresent: Rule = {
  id: 'summary-present',
  description: `The summary explains the change in at least ${MIN_SUMMARY_WORDS} words.`,
  check: (t) => {
    const words = sectionText(t.sections.get('summary')).split(/\s+/).filter(Boolean).length;
    if (words === 0) return [{ rule: 'summary-present', severity: 'error', message: 'Add a "## Summary" section.' }];
    if (words < MIN_SUMMARY_WORDS) {
      return [
        {
          rule: 'summary-present',
          severity: 'error',
          message: `Summary is ${words} words; explain the change in at least ${MIN_SUMMARY_WORDS}.`,
        },
      ];
    }
    return [];
  },
};

const criteriaPresent: Rule = {
  id: 'criteria-present',
  description: 'There is at least one acceptance criterion.',
  check: (t) =>
    listItems(t.sections.get('acceptance criteria')).length > 0
      ? []
      : [{ rule: 'criteria-present', severity: 'error', message: 'Add a "## Acceptance criteria" list.' }],
};

const criteriaObservable: Rule = {
  id: 'criteria-observable',
  description: 'Each criterion states an outcome someone could observe or test.',
  check: (t) =>
    listItems(t.sections.get('acceptance criteria'))
      .filter((item) => !GIVEN_WHEN_THEN.test(item.text))
      .filter((item) => !OBSERVABLE_VERBS.some((verb) => mentions(item.text, verb)))
      .map((item) => ({
        rule: 'criteria-observable',
        severity: 'warning',
        message: `Not testable as written: "${item.text}". Say what the user or system does or sees.`,
        line: item.line,
      })),
};

const noVagueLanguage: Rule = {
  id: 'no-vague-language',
  description: 'Summary and criteria avoid words nobody can verify.',
  check: (t) => {
    const lines = [...(t.sections.get('summary') ?? []), ...(t.sections.get('acceptance criteria') ?? [])];
    return lines.flatMap(({ text, line }) =>
      VAGUE_TERMS.filter((term) => mentions(text, term)).map(
        (term): Finding => ({
          rule: 'no-vague-language',
          severity: 'warning',
          message: `"${term}" cannot be verified. Give a measurable or observable alternative.`,
          line,
        }),
      ),
    );
  },
};

const uiStates: Rule = {
  id: 'ui-states',
  description: 'UI tickets cover the loading, error and empty states.',
  check: (t) => {
    if (t.type !== 'ui') return [];
    const text = [sectionText(t.sections.get('acceptance criteria')), sectionText(t.sections.get('states'))].join(' ');
    return ['loading', 'error', 'empty']
      .filter((state) => !mentions(text, state))
      .map((state): Finding => ({
        rule: 'ui-states',
        severity: 'error',
        message: `No ${state} state described. Add it to the criteria or a "## States" section.`,
      }));
  },
};

const designLinked: Rule = {
  id: 'design-linked',
  description: 'UI tickets link to the agreed design.',
  check: (t) => {
    if (t.type !== 'ui') return [];
    return URL.test(sectionText(t.sections.get('design')))
      ? []
      : [{ rule: 'design-linked', severity: 'error', message: 'Add a "## Design" section with a link to the design.' }];
  },
};

const questionsResolved: Rule = {
  id: 'questions-resolved',
  description: 'Open questions are answered (ticked) before work starts.',
  check: (t) =>
    listItems(t.sections.get('open questions'))
      .filter((item) => !item.checked)
      .map((item): Finding => ({
        rule: 'questions-resolved',
        severity: 'error',
        message: `Unresolved question: "${item.text}". Answer it and tick it with [x].`,
        line: item.line,
      })),
};

export const rules: readonly Rule[] = [
  titlePresent,
  typeDeclared,
  summaryPresent,
  criteriaPresent,
  criteriaObservable,
  noVagueLanguage,
  uiStates,
  designLinked,
  questionsResolved,
];

export function describeRules(): string[] {
  return rules.map((r) => `${r.id}: ${r.description}`);
}

export type { Ticket };
