// Colour belongs to task type, not specialty: six bounded values rather than one hue per
// specialty, which would be a rainbow and would mostly fail contrast. Each pairs a readable ink
// with a wash of the same hue; both inks clear 4.5:1 on the card at badge size. Shared by the
// board and the demo so the two always look the same.
export const TASK_TONE: Record<string, { text: string; wash: string; stripe: string }> = {
  qip: { text: "#1d4fa8", wash: "#1d4fa814", stripe: "#1d4fa8" },
  audit: { text: "#0a6c78", wash: "#05808f14", stripe: "#0a6c78" },
  research: { text: "#6b3fa0", wash: "#6b3fa014", stripe: "#6b3fa0" },
  presentation: { text: "#9a5116", wash: "#9a511614", stripe: "#9a5116" },
  teaching: { text: "#166835", wash: "#1a7a3f14", stripe: "#166835" },
  other: { text: "#5a5650", wash: "#5a565014", stripe: "#9b958c" },
};

export const taskTone = (t: string) => TASK_TONE[t] ?? TASK_TONE.other;
