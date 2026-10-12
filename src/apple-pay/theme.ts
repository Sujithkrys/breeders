// "Apple Pay is now in India", a concept launch film in Apple's style (not affiliated with Apple). 1920×1080, 60fps.
// Pure product film with no voice, then the Breeders end card.
// Shot spans are in seconds.
export const AP = { fps: 60, width: 1920, height: 1080 };
export const SHOT = {
  phone: [0, 12], // side button macro → pull back, card rises → double-click, Face ID, done
  chai: [12, 17], // orange world: tap at a chai stall · No PIN. No OTP.
  metro: [17, 21], // purple world: metro gate, wrist flick
  online: [21, 25], // teal world: laptop + app checkout
  privacy: [25, 29], // dark: card number dissolves · Private by design.
  axis: [29, 34], // white: orbs + cards · Starting with Axis Bank.
  hero: [34, 40], // phone + watch lockup · Apple Pay. Now in India.
  outro: [46, 52],
} as const;
export const TOTAL = 52;

export const UI = "Inter, sans-serif";
export const HEAD = "'Inter Tight', Inter, sans-serif";
export const C = {
  ink: "#0B0B0C",
  gray: "#86868B",
  paper: "#F5F5F7",
  orange: ["#FFC46B", "#FF7A1A", "#C2410C"],
  purple: ["#B57BFF", "#6A1FD6", "#1E0646"],
  teal: ["#6FF2DF", "#13B3A2", "#00302D"],
};
