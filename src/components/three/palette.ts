import type { Theme } from "@/lib/store";

export const ACCENT = "#ff5710";

export function scenePalette(theme: Theme) {
  return theme === "dark"
    ? {
        solid: "#2b2b30",
        soft: "#3a3a40",
        glass: "#e9e6e0",
        ink: "#f5f3ef",
        line: "#6a6a72",
        shadow: 0.55,
        star: "#f5f3ef",
        starSize: 0.035,
        starOpacity: 0.85,
        orbitOpacity: 0.55,
      }
    : {
        solid: "#ffffff",
        soft: "#dcd8d1",
        glass: "#ffffff",
        ink: "#0c0c0d",
        line: "#b9b5ae",
        shadow: 0.22,
        star: "#8a867f",
        starSize: 0.022,
        starOpacity: 0.55,
        orbitOpacity: 0.7,
      };
}

export type ScenePalette = ReturnType<typeof scenePalette>;
