// Light-first palette. The screen carries no dark blocks at all — the single
// darkest thing is the red CTA, so the eye lands on the one action that matters.
// Ground, hero and cards all sit on the same warm yellow axis, which removes the
// hue conflict that made an earlier teal hero read as a loud coloured slab.
export const COLORS = {
  bg: "#F7F4EC",
  surface: "#FFFFFF",
  surfaceLine: "#E7E0D2",
  chip: "#F4EEE0",

  text: "#2A2622",
  textDim: "#6F695E",
  textFaint: "#7D7567",
  placeholder: "#6F6558",

  // The input block. Butter yellow, one step off the ground, so it reads as the
  // first thing to do without needing weight.
  hero: "#FBE7BF",
  heroLine: "#F0DCB0",
  heroDeep: "#F5DCA6",

  // The hypnosis screen alone shifts to peach: the colour change itself signals
  // "you are eating now", and it is the one screen with no cards.
  trance: "#FBDDCE",
  tranceDeep: "#F8CDB8",
  tranceRing: "#F5C2AA",

  // money saved — the only saturated colour in the app
  accent: "#A8352A",
  accentHi: "#C1462C",
  accentTint: "#F7E4DF",
  accentInk: "#FFFFFF",

  // calories avoided
  kcal: "#7A5230",

  // macros
  carb: "#D9A441",
  protein: "#5A7A9B",
  fat: "#C4724F",
};

export const RADIUS = {
  sm: 13,
  md: 18,
  lg: 26,
};

// Elevation replaces tone as the way surfaces separate, since every surface is
// now light. `lift` is reserved for the input hero and the summary panels.
export const SHADOW = {
  soft: {
    shadowColor: "#1F1B18",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  lift: {
    shadowColor: "#1F1B18",
    shadowOpacity: 0.09,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  button: {
    shadowColor: "#A8352A",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
} as const;
