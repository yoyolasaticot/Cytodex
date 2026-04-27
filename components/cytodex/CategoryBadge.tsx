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

export default function CategoryBadge({
  category,
  level,
  size = "md",
}: CategoryBadgeProps) {
  const badgeDisplay = getBadgeDisplay(level, category);
  const classes = sizeClasses[size];
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
          className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)]"
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
