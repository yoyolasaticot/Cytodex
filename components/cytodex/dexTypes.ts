"use client";

import { CytodexCard } from "@/lib/cards";

export type CardUpdate = Partial<
  Pick<
    CytodexCard,
    "characteristics" | "pathologies" | "completed" | "found" | "images"
  >
>;

export type BadgeLevel = "Bronze" | "Argent" | "Or" | null;

export function computeBadge(completed: number, total: number): BadgeLevel {
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  if (ratio >= 100) return "Or";
  if (ratio >= 70) return "Argent";
  if (ratio >= 50) return "Bronze";
  return null;
}

export function getBadgeDisplay(level: BadgeLevel) {
  if (level === "Or") {
    return {
      label: "Or",
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#fff7bf,#e0b100_68%,#a66b00)] border-[#7a5200] shadow-[0_0_18px_rgba(255,215,0,0.35)]",
    };
  }

  if (level === "Argent") {
    return {
      label: "Argent",
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#ffffff,#cfd5dd_68%,#7a8794)] border-[#5f6872] shadow-[0_0_14px_rgba(220,220,230,0.28)]",
    };
  }

  if (level === "Bronze") {
    return {
      label: "Bronze",
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#f6d2b1,#b87333_68%,#6c3d18)] border-[#5b3215] shadow-[0_0_14px_rgba(184,115,51,0.25)]",
    };
  }

  return {
    label: "Vide",
    className:
      "bg-[radial-gradient(circle_at_30%_30%,#cfcfcf,#a9a9a9_68%,#7d7d7d)] border-[#6b6b6b] opacity-75",
  };
}
