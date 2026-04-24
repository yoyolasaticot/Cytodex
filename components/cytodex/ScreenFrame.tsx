"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-[#8be8ff]/45 bg-[linear-gradient(180deg,#13324a,#0c1c2d)] px-5 py-2.5 text-center text-sm font-semibold tracking-[0.08em] text-[#e6fbff] shadow-[0_0_0_1px_rgba(139,232,255,0.14),0_0_24px_rgba(67,190,255,0.14),0_16px_34px_rgba(4,12,24,0.36)] transition hover:-translate-y-0.5 hover:border-[#ffd166]/70 hover:text-[#fff3cf]";

export const largePrimaryButtonClassName =
  "min-h-[56px] rounded-full border border-[#8be8ff]/45 bg-[linear-gradient(180deg,#13324a,#0c1c2d)] px-6 text-center text-base font-semibold tracking-[0.08em] text-[#e6fbff] shadow-[0_0_0_1px_rgba(139,232,255,0.14),0_0_28px_rgba(67,190,255,0.14),0_18px_38px_rgba(4,12,24,0.38)] transition hover:-translate-y-0.5 hover:border-[#ffd166]/70 hover:text-[#fff3cf]";

const appShellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top,#164468_0%,#08121f_40%,#040912_100%)] px-4 py-4 sm:px-5 sm:py-6";
const outerPanelClassName =
  "mx-auto flex max-w-7xl flex-col gap-4";
const innerPanelClassName =
  "relative overflow-hidden rounded-[24px] border border-[#86e7ff]/12 bg-[linear-gradient(180deg,rgba(8,19,31,0.8),rgba(11,23,38,0.9))] p-4 text-[#eafcff] shadow-[0_18px_48px_rgba(1,6,14,0.34)] sm:p-5";

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
        <div className="relative overflow-hidden rounded-[22px] border border-[#86e7ff]/18 bg-[linear-gradient(135deg,#071523_0%,#14354f_48%,#1a5674_72%,#ff8c43_100%)] p-5 text-white shadow-[0_18px_44px_rgba(1,8,18,0.32)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,231,255,0.3),transparent_32%),radial-gradient(circle_at_78%_24%,rgba(255,209,102,0.24),transparent_24%),linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)]" />
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 max-w-4xl flex-1">
              <p className="mb-2 text-[11px] uppercase tracking-[0.26em] text-[#9fe9ff]">
                {eyebrow}
              </p>
              <h1 className="font-heading text-2xl font-semibold leading-snug text-white sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/76 sm:text-base">
                {description}
              </p>
            </div>

            <Button
              type="button"
              onClick={onBack}
              className="w-full rounded-full border border-[#86e7ff]/34 bg-[#09131f]/44 px-5 py-2.5 text-center text-sm font-semibold tracking-[0.08em] text-[#eafcff] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#ffd166]/50 hover:text-[#fff3cf] sm:w-auto"
            >
              {backLabel}
            </Button>
          </div>
        </div>

        <div className={innerPanelClassName}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(134,231,255,0.04)_100%),radial-gradient(circle_at_top_left,rgba(134,231,255,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(243,111,69,0.08),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-12 [background-image:linear-gradient(rgba(134,231,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.16)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
