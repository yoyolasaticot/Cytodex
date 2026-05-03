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
    "drop-shadow(0 0 12px rgba(255,146,72,0.56)) drop-shadow(0 0 24px rgba(255,111,43,0.24)) drop-shadow(0 10px 18px rgba(0,0,0,0.34))",
  Argent:
    "drop-shadow(0 0 14px rgba(236,249,255,0.72)) drop-shadow(0 0 28px rgba(146,232,255,0.34)) drop-shadow(0 0 42px rgba(255,211,151,0.16)) drop-shadow(0 12px 20px rgba(0,0,0,0.34))",
  Or: "drop-shadow(0 0 18px rgba(255,235,132,0.86)) drop-shadow(0 0 38px rgba(255,188,48,0.54)) drop-shadow(0 0 58px rgba(255,120,36,0.28)) drop-shadow(0 14px 24px rgba(0,0,0,0.36))",
};

const imageToneFilters: Record<Exclude<BadgeLevel, null> | "Vide", string> = {
  Vide: "grayscale(1) saturate(0.55) brightness(0.72) contrast(1.08)",
  Bronze: "sepia(0.9) saturate(1.95) hue-rotate(342deg) brightness(1.06) contrast(1.13)",
  Argent: "grayscale(0.9) sepia(0.28) saturate(1.05) hue-rotate(174deg) brightness(1.28) contrast(1.08)",
  Or: "sepia(0.98) saturate(2.15) hue-rotate(356deg) brightness(1.2) contrast(1.12)",
};

const badgeSparkleClassNames: Record<Exclude<BadgeLevel, null>, string> = {
  Bronze: "bg-[#ffd0a1] shadow-[0_0_10px_rgba(255,146,72,0.85)]",
  Argent: "bg-[#f5fdff] shadow-[0_0_12px_rgba(160,232,255,0.9)]",
  Or: "bg-[#fff2a8] shadow-[0_0_14px_rgba(255,210,72,0.95)]",
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
  const sparkleClassName = level ? badgeSparkleClassNames[level] : "";
  const [imageAvailable, setImageAvailable] = useState(Boolean(badgeDisplay.imageSrc));

  useEffect(() => {
    setImageAvailable(Boolean(badgeDisplay.imageSrc));
  }, [badgeDisplay.imageSrc]);

  if (badgeDisplay.imageSrc && imageAvailable) {
    return (
      <div
        className={`relative shrink-0 overflow-visible ${classes.frame}`}
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
        {level ? (
          <>
            <span
              className={`pointer-events-none absolute left-[17%] top-[18%] h-1.5 w-1.5 rotate-45 ${sparkleClassName} animate-[cytodex-badge-sparkle_1.9s_ease-in-out_infinite]`}
              aria-hidden="true"
            />
            <span
              className={`pointer-events-none absolute right-[16%] top-[33%] h-1 w-1 rotate-45 ${sparkleClassName} animate-[cytodex-badge-sparkle_2.25s_ease-in-out_0.45s_infinite]`}
              aria-hidden="true"
            />
            <span
              className={`pointer-events-none absolute bottom-[18%] left-[30%] h-1 w-1 rotate-45 ${sparkleClassName} animate-[cytodex-badge-sparkle_2.1s_ease-in-out_0.9s_infinite]`}
              aria-hidden="true"
            />
            <style jsx>{`
              @keyframes cytodex-badge-sparkle {
                0%,
                100% {
                  opacity: 0;
                  transform: scale(0.35) rotate(45deg);
                }
                48% {
                  opacity: 1;
                  transform: scale(1.35) rotate(45deg);
                }
              }
            `}</style>
          </>
        ) : null}
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
