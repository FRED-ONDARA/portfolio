import type { Theme } from "@/lib/store";

export const ACCENT = "#ff5710";

export function scenePalette(theme: Theme) {
  return theme === "dark"
    ? { solid: "#2b2b30", soft: "#3a3a40", glass: "#e9e6e0", ink: "#f5f3ef", line: "#5a5a60", shadow: 0.55 }
    : { solid: "#ffffff", soft: "#dcd8d1", glass: "#ffffff", ink: "#0c0c0d", line: "#b9b5ae", shadow: 0.22 };
}

export type ScenePalette = ReturnType<typeof scenePalette>;
