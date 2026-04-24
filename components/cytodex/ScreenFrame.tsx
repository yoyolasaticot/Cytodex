"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-[#1f1f24] bg-[#fff6dd] px-5 py-2.5 text-sm font-semibold text-[#1f1f24] shadow-[0_10px_30px_rgba(31,31,36,0.12)] transition hover:-translate-y-0.5 hover:bg-[#ffeebd]";

export const largePrimaryButtonClassName =
  "min-h-[56px] rounded-full border border-[#1f1f24] bg-[#fff6dd] px-6 text-base font-semibold text-[#1f1f24] shadow-[0_14px_34px_rgba(31,31,36,0.14)] transition hover:-translate-y-0.5 hover:bg-[#ffeebd]";

const appShellClassName =
  "min-h-screen bg-[linear-gradient(180deg,#fdf7ef_0%,#fffdf8_48%,#eef6ff_100%)] px-4 py-4 sm:px-5 sm:py-6";
const outerPanelClassName =
  "mx-auto flex max-w-6xl flex-col gap-4 rounded-[32px] border border-[#1f1f24]/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.94),rgba(255,248,234,0.92))] p-3 shadow-[0_24px_80px_rgba(31,31,36,0.12)] backdrop-blur";
const innerPanelClassName =
  "relative overflow-hidden rounded-[26px] border border-[#1f1f24]/8 bg-[linear-gradient(160deg,#fffdf8_0%,#fff7ea_55%,#f2f7ff_100%)] p-4 text-[#1f1f24] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]";

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
        <div className="relative overflow-hidden rounded-[24px] border border-[#1f1f24]/10 bg-[linear-gradient(135deg,#1e2030_0%,#2f4764_52%,#ff7a59_100%)] p-5 text-white shadow-[0_16px_48px_rgba(31,31,36,0.18)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(255,214,107,0.24),transparent_28%)]" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/70">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/78 sm:text-base">
                {description}
              </p>
            </div>

            <Button
              type="button"
              onClick={onBack}
              className="rounded-full border border-white/35 bg-white/12 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
            >
              {backLabel}
            </Button>
          </div>
        </div>

        <div className={innerPanelClassName}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,89,0.09),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(76,130,255,0.08),transparent_26%)]" />
          <div className="pointer-events-none absolute left-[3%] top-[4%] h-20 w-20 rounded-full border border-[#1f1f24]/8 bg-white/55" />
          <div className="pointer-events-none absolute right-[5%] top-[8%] h-3 w-24 rounded-full bg-[#ffd66b]/45" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
