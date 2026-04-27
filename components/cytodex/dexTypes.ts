"use client";

import { CytodexCard } from "@/lib/cards";

export type CardUpdate = Partial<
  Pick<
    CytodexCard,
    "characteristics" | "pathologies" | "completed" | "found" | "images"
  >
>;

export type BadgeLevel = "Bronze" | "Argent" | "Or" | null;

type BadgeImageSet = Record<Exclude<BadgeLevel, null> | "Vide", string>;

const categoryBadgeImages: Record<string, BadgeImageSet> = {
  myeloide: {
    Vide: "/badges/myeloide/ombre.jfif",
    Bronze: "/badges/myeloide/bronze.jfif",
    Argent: "/badges/myeloide/argent.jfif",
    Or: "/badges/myeloide/or.jfif",
  },
};

export function computeBadge(completed: number, total: number): BadgeLevel {
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  if (ratio >= 100) return "Or";
  if (ratio >= 70) return "Argent";
  if (ratio >= 50) return "Bronze";
  return null;
}

function normalizeCategoryKey(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getCategoryBadgeImages(category: string) {
  const categoryKey = normalizeCategoryKey(category);

  if (categoryBadgeImages[categoryKey]) {
    return categoryBadgeImages[categoryKey];
  }

  if (categoryKey.includes("myeloide")) {
    return categoryBadgeImages.myeloide;
  }

  return undefined;
}

export function getBadgeDisplay(level: BadgeLevel, category?: string) {
  const label = level ?? "Vide";
  const imageSrc = category ? getCategoryBadgeImages(category)?.[label] : undefined;

  if (level === "Or") {
    return {
      label: "Or",
      imageSrc,
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#fff4bf,#ffcc59_48%,#8c5a00_100%)] border-[#ffd166]/70 text-[#261500] shadow-[0_0_20px_rgba(255,209,102,0.35)]",
    };
  }

  if (level === "Argent") {
    return {
      label: "Argent",
      imageSrc,
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#eefcff,#a6dfff_52%,#32536a_100%)] border-[#86e7ff]/65 text-[#03131d] shadow-[0_0_18px_rgba(134,231,255,0.28)]",
    };
  }

  if (level === "Bronze") {
    return {
      label: "Bronze",
      imageSrc,
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#ffd9bf,#f38a54_52%,#6f2f17_100%)] border-[#f7a26e]/65 text-[#240d07] shadow-[0_0_16px_rgba(243,111,69,0.26)]",
    };
  }

  return {
    label: "Vide",
    imageSrc,
    className:
      "bg-[linear-gradient(180deg,rgba(15,33,49,0.92),rgba(8,18,28,0.92))] border-[#86e7ff]/20 text-[#89a7b3] opacity-85",
  };
}
