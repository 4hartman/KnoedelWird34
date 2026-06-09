// Starter content for new projects. A new project is seeded from a template so
// the editor is never empty. Phase 4 expands this list; Phase 1 ships one solid
// default. `makeId` provides stable, collision-resistant ids without relying on
// Date.now()/Math.random() patterns that the runtime distinguishes by id.

import type { QuizConfig, ThemeConfig } from '../types';

export const DEFAULT_THEME: ThemeConfig = {
  palette: {
    primary: '#cf6a45',
    accent: '#e0a23c',
    text: '#3a2a1c',
    card: '#fdf4e6',
  },
  backgroundCss:
    'linear-gradient(135deg, #f3e3c9 0%, #e0a23c 45%, #cf6a45 100%)',
  font: 'Quicksand',
  headingFont: 'Playfair Display',
};

let idCounter = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}${idCounter}_${performance.now().toString(36).replace('.', '')}`;
}

export interface Template {
  key: string;
  name: string;
  description: string;
  config: QuizConfig;
  theme: ThemeConfig;
}

function tripTemplate(): Template {
  return {
    key: 'trip-ab',
    name: 'Überraschungsreise (2 Ziele)',
    description:
      'Ein A/B-Quiz, das mit einer Reise-Überraschung endet — wie das Original.',
    theme: { ...DEFAULT_THEME },
    config: {
      meta: {
        recipient: 'Jubilar*in',
        occasion: 'Geburtstag',
        voteBarEnabled: false,
      },
      intro: {
        greeting: 'Alles Gute, {recipient}!',
        subtitle: 'Bevor wir das Geheimnis lüften, ein kleines Quiz...',
        buttonText: "Los geht's",
      },
      destinations: {
        a: {
          label: 'Ziel A',
          emoji: '🏝️',
          title: 'Überraschung!',
          tagline: 'Sonne, Meer und Entspannung',
          details: 'Beschreibe hier das erste mögliche Reiseziel.',
        },
        b: {
          label: 'Ziel B',
          emoji: '🏔️',
          title: 'Überraschung!',
          tagline: 'Berge, frische Luft und Abenteuer',
          details: 'Beschreibe hier das zweite mögliche Reiseziel.',
        },
      },
      questions: [
        {
          id: 'q1',
          question: 'Was klingt nach perfektem Urlaubsmorgen?',
          hint: 'Bauchgefühl reicht!',
          options: [
            { id: 'a', text: 'Kaffee auf einer sonnigen Terrasse', points: { a: 1 } },
            { id: 'b', text: 'Frühstück mit Bergblick', points: { b: 1 } },
          ],
        },
        {
          id: 'q2',
          question: 'Wonach steht dir der Sinn?',
          options: [
            { id: 'a', text: 'Im Meer schwimmen', points: { a: 1 } },
            { id: 'b', text: 'Eine Wanderung machen', points: { b: 1 } },
          ],
        },
      ],
      tiebreaker: {
        id: 'tb',
        question: 'Unentschieden! Was lockt dich mehr?',
        options: [
          { id: 'a', text: 'Salzige Meeresluft', winner: 'a' },
          { id: 'b', text: 'Frischer Bergwind', winner: 'b' },
        ],
      },
    },
  };
}

function multiDestinationTemplate(): Template {
  return {
    key: 'multi-destination',
    name: 'Mehrere Ziele',
    description:
      'Ein Quiz mit drei oder mehr möglichen Ergebnissen — ideal für mehr Auswahl.',
    theme: {
      ...DEFAULT_THEME,
      backgroundCss: 'linear-gradient(135deg, #0a4d8c 0%, #2e8bc0 45%, #e8c074 100%)',
    },
    config: {
      meta: { recipient: 'Jubilar*in', occasion: 'Geburtstag', voteBarEnabled: false },
      intro: {
        greeting: 'Alles Gute, {recipient}!',
        subtitle: 'Finde heraus, wohin die Reise geht...',
        buttonText: "Los geht's",
      },
      destinations: {
        beach: { label: 'Strand', emoji: '🏖️', title: 'Überraschung!', tagline: 'Sonne und Meer' },
        mountains: { label: 'Berge', emoji: '🏔️', title: 'Überraschung!', tagline: 'Gipfel und Wanderungen' },
        city: { label: 'Stadt', emoji: '🌆', title: 'Überraschung!', tagline: 'Kultur und Trubel' },
      },
      questions: [
        {
          id: 'q1',
          question: 'Was lädt dich am meisten ein?',
          options: [
            { id: 'a', text: 'Eine Hängematte am Wasser', points: { beach: 1 } },
            { id: 'b', text: 'Ein Bergpfad mit Aussicht', points: { mountains: 1 } },
            { id: 'c', text: 'Ein lebhafter Marktplatz', points: { city: 1 } },
          ],
        },
        {
          id: 'q2',
          question: 'Womit verbringst du den Abend?',
          options: [
            { id: 'a', text: 'Barfuß im Sand', points: { beach: 1 } },
            { id: 'b', text: 'Am Lagerfeuer', points: { mountains: 1 } },
            { id: 'c', text: 'In einem Restaurant', points: { city: 1 } },
          ],
        },
      ],
      tiebreaker: {
        id: 'tb',
        question: 'Unentschieden! Was zählt am meisten?',
        options: [
          { id: 'a', text: 'Entspannung', winner: 'beach' },
          { id: 'b', text: 'Natur', winner: 'mountains' },
        ],
      },
    },
  };
}

function personalityTemplate(): Template {
  return {
    key: 'personality',
    name: 'Persönlichkeitsquiz',
    description:
      'Ein lockeres Quiz, das einen von mehreren „Typen" als Ergebnis verrät.',
    theme: {
      ...DEFAULT_THEME,
      backgroundCss: 'linear-gradient(135deg, #6a1b4d 0%, #b3306f 50%, #f2a9c4 100%)',
      palette: { primary: '#b3306f', accent: '#6a1b4d', text: '#3a2f1f', card: '#fff5fa' },
    },
    config: {
      meta: { recipient: 'Du', occasion: 'Quiz', voteBarEnabled: false },
      intro: {
        greeting: 'Welcher Typ bist du, {recipient}?',
        subtitle: 'Beantworte ein paar Fragen und finde es heraus!',
        buttonText: 'Quiz starten',
      },
      destinations: {
        adventurer: { label: 'Abenteurer*in', emoji: '🧭', title: 'Dein Typ:', tagline: 'Immer auf der Suche nach dem Nervenkitzel' },
        dreamer: { label: 'Träumer*in', emoji: '🌙', title: 'Dein Typ:', tagline: 'Kopf in den Wolken, Herz am rechten Fleck' },
      },
      questions: [
        {
          id: 'q1',
          question: 'Freier Nachmittag — was machst du?',
          options: [
            { id: 'a', text: 'Etwas Neues ausprobieren', points: { adventurer: 1 } },
            { id: 'b', text: 'Ein Buch und Tee', points: { dreamer: 1 } },
          ],
        },
        {
          id: 'q2',
          question: 'Dein idealer Urlaub?',
          options: [
            { id: 'a', text: 'Backpacking durch unbekanntes Land', points: { adventurer: 1 } },
            { id: 'b', text: 'Ein ruhiges Häuschen am See', points: { dreamer: 1 } },
          ],
        },
      ],
      tiebreaker: {
        id: 'tb',
        question: 'Letzte Frage: Was beschreibt dich besser?',
        options: [
          { id: 'a', text: 'Mutig', winner: 'adventurer' },
          { id: 'b', text: 'Verträumt', winner: 'dreamer' },
        ],
      },
    },
  };
}

export const TEMPLATES: Template[] = [
  tripTemplate(),
  multiDestinationTemplate(),
  personalityTemplate(),
];

export function templateByKey(key: string): Template {
  return TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0];
}

export function defaultTemplate(): Template {
  return TEMPLATES[0];
}
