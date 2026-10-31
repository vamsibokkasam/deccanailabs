/** Copy and stage cuts for the scroll hero. Edit these to retune the story. */
export const STAGE_CUTS = [0.33, 0.66];

export const STAGES = [
  {
    id: "pick",
    label: "01",
    kicker: "01 · Learn",
    title: "Build foundations",
    detail: "Structured learning with guided mentorship.",
    bubble: "Let's build your foundations.",
  },
  {
    id: "build",
    label: "02",
    kicker: "02 · Execute",
    title: "Ship real work",
    detail: "Turn ideas into practical projects you can show.",
    bubble: "Now we make it practical.",
  },
  {
    id: "ship",
    label: "03",
    kicker: "03 · Lead",
    title: "Grow with impact",
    detail: "Confidence and leadership for what comes next.",
    bubble: "Then you lead with what you learned.",
  },
];

/**
 * Scroll progress keyframes for Decco.
 * Each pair is [progress stops, values]. Values are pixels or degrees.
 */
export const POSE = {
  x: [
    [0, 0.33, 0.5, 0.66, 0.84, 1],
    [28, 28, -64, -64, 12, 12],
  ],
  y: [
    [0, 0.33, 0.66, 0.78, 0.9, 1],
    [0, 0, 42, -32, 8, 0],
  ],
  rotateY: [
    [0, 0.33, 0.66, 1],
    [0, 0, 25, -8],
  ],
  rotateZ: [
    [0, 0.33, 0.66, 0.84, 1],
    [0, 0, -6, 7, 4],
  ],
  scale: [
    [0, 0.66, 0.84, 1],
    [1, 1, 1.25, 1.16],
  ],
};

export const MANUAL_POSE = [
  { x: 0, y: 0, rotateY: 0, rotateZ: 0, scale: 1 },
  { x: -28, y: 18, rotateY: 25, rotateZ: -6, scale: 1 },
  { x: 6, y: 0, rotateY: -8, rotateZ: 4, scale: 1.12 },
];
