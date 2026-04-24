"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const primaryButtonClassName =
  "rounded-none border-[3px] border-black bg-[#efe8d2] px-4 py-2 text-sm font-medium text-black shadow-[3px_3px_0_#000] hover:bg-[#e3dbc2]";

export const largePrimaryButtonClassName =
  "min-h-[56px] rounded-none border-[4px] border-black bg-[#efe8d2] px-4 text-base font-medium text-black shadow-[4px_4px_0_#000] hover:bg-[#e3dbc2]";

const appShellClassName =
  "min-h-screen bg-[#faf8f1] px-4 py-4 sm:px-5 sm:py-5";
const outerPanelClassName =
  "mx-auto flex max-w-6xl flex-col gap-4 rounded-[6px] border-[4px] border-[#3a2414] bg-[linear-gradient(180deg,#8a5a35,#5c3821)] p-3 shadow-[8px_8px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-2px_0_rgba(0,0,0,0.24)]";
const innerPanelClassName =
  "relative overflow-hidden rounded-[2px] border-[3px] border-[#2f2f2f] bg-[linear-gradient(180deg,#2a2c2f,#191a1d)] p-4 text-[#f3ead8] shadow-[inset_0_0_26px_rgba(255,255,255,0.08)]";

type ScreenFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  onBack: () => void;
  backLabel: string;
  children: React.ReactNode;
};

export default function ScreenFrame({
  eyebrow,
  title,
  description,
  onBack,
  backLabel,
  children,
}: ScreenFrameProps) {
  return (
    <div className={appShellClassName}>
      <div className={outerPanelClassName}>
        <div className="border-[4px] border-black bg-[#e9e2cf] p-4 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-black/70">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-black sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-black/70 sm:text-base">
                {description}
              </p>
            </div>

            <Button type="button" onClick={onBack} className={primaryButtonClassName}>
              {backLabel}
            </Button>
          </div>
        </div>

        <div className={innerPanelClassName}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_16%,rgba(255,255,255,0.03)_30%,transparent_44%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_18%,transparent_72%,rgba(255,255,255,0.05)_100%)]" />
          <div className="pointer-events-none absolute left-[-12%] top-[8%] h-[14%] w-[65%] rotate-[-14deg] bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute right-[8%] top-[12%] h-[20%] w-[20%] rounded-full bg-white/6 blur-xl" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
