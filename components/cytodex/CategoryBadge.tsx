"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeLevel, getBadgeDisplay } from "@/components/cytodex/dexTypes";

type CategoryBadgeProps = {
  category: string;
  level: BadgeLevel;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: {
    frame: "h-16 w-16",
    image: 64,
    text: "text-xs",
  },
  lg: {
    frame: "h-20 w-20",
    image: 80,
    text: "text-sm",
  },
};

const imageGlowFilters: Record<Exclude<BadgeLevel, null> | "Vide", string> = {
  Vide: "drop-shadow(0 8px 14px rgba(0,0,0,0.32))",
  Bronze:
    "drop-shadow(0 0 10px rgba(214,118,52,0.36)) drop-shadow(0 10px 18px rgba(0,0,0,0.34))",
  Argent:
    "drop-shadow(0 0 14px rgba(188,224,255,0.46)) drop-shadow(0 0 24px rgba(134,231,255,0.22)) drop-shadow(0 12px 20px rgba(0,0,0,0.34))",
  Or: "drop-shadow(0 0 16px rgba(255,215,87,0.62)) drop-shadow(0 0 34px rgba(255,183,48,0.36)) drop-shadow(0 14px 24px rgba(0,0,0,0.36))",
};

const imageToneFilters: Record<Exclude<BadgeLevel, null> | "Vide", string> = {
  Vide: "grayscale(1) saturate(0.55) brightness(0.72) contrast(1.08)",
  Bronze: "sepia(0.82) saturate(1.45) hue-rotate(342deg) brightness(0.92) contrast(1.08)",
  Argent: "grayscale(1) sepia(0.22) saturate(0.78) hue-rotate(170deg) brightness(1.18) contrast(1.04)",
  Or: "sepia(0.95) saturate(1.72) hue-rotate(356deg) brightness(1.08) contrast(1.08)",
};

export default function CategoryBadge({
  category,
  level,
  size = "md",
}: CategoryBadgeProps) {
  const badgeDisplay = getBadgeDisplay(level, category);
  const classes = sizeClasses[size];
  const badgeLevel = level ?? "Vide";
  const imageFilter = `${imageToneFilters[badgeLevel]} ${imageGlowFilters[badgeLevel]}`;
  const [imageAvailable, setImageAvailable] = useState(Boolean(badgeDisplay.imageSrc));

  useEffect(() => {
    setImageAvailable(Boolean(badgeDisplay.imageSrc));
  }, [badgeDisplay.imageSrc]);

  if (badgeDisplay.imageSrc && imageAvailable) {
    return (
      <div
        className={`relative shrink-0 ${classes.frame}`}
        title={`${category} - ${badgeDisplay.label}`}
      >
        <Image
          src={badgeDisplay.imageSrc}
          alt={`${category} - badge ${badgeDisplay.label}`}
          width={classes.image}
          height={classes.image}
          unoptimized
          className={`h-full w-full object-contain ${level ? "" : "opacity-75"}`}
          style={{ filter: imageFilter }}
          onError={() => setImageAvailable(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${classes.frame} shrink-0 items-center justify-center rounded-full border-[3px] text-center font-semibold ${classes.text} ${badgeDisplay.className}`}
      title={`${category} - ${badgeDisplay.label}`}
    >
      <span className="px-2 leading-tight">{level ? badgeDisplay.label : ""}</span>
    </div>
  );
}
