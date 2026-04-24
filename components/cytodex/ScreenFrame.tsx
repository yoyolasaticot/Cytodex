"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-[#86e7ff]/40 bg-[linear-gradient(180deg,#10273a,#0d1e2e)] px-5 py-2.5 text-sm font-semibold text-[#e6fbff] shadow-[0_0_0_1px_rgba(134,231,255,0.12),0_12px_30px_rgba(4,12,24,0.34)] transition hover:-translate-y-0.5 hover:border-[#ffd166]/55 hover:text-[#fff3cf]";

export const largePrimaryButtonClassName =
  "min-h-[56px] rounded-full border border-[#86e7ff]/40 bg-[linear-gradient(180deg,#10273a,#0d1e2e)] px-6 text-base font-semibold text-[#e6fbff] shadow-[0_0_0_1px_rgba(134,231,255,0.12),0_16px_34px_rgba(4,12,24,0.36)] transition hover:-translate-y-0.5 hover:border-[#ffd166]/55 hover:text-[#fff3cf]";

const appShellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top,#14304a_0%,#09131f_42%,#050b14_100%)] px-4 py-4 sm:px-5 sm:py-6";
const outerPanelClassName =
  "mx-auto flex max-w-6xl flex-col gap-4 rounded-[32px] border border-[#86e7ff]/15 bg-[linear-gradient(160deg,rgba(8,19,32,0.92),rgba(6,14,24,0.96))] p-3 shadow-[0_30px_90px_rgba(1,6,14,0.52)] backdrop-blur";
const innerPanelClassName =
  "relative overflow-hidden rounded-[26px] border border-[#86e7ff]/12 bg-[linear-gradient(180deg,#08131f_0%,#0b1726_52%,#0d1e30_100%)] p-4 text-[#eafcff] shadow-[inset_0_1px_0_rgba(134,231,255,0.06)]";

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
        <div className="relative overflow-hidden rounded-[24px] border border-[#86e7ff]/20 bg-[linear-gradient(135deg,#081624_0%,#15324b_46%,#f36f45_100%)] p-5 text-white shadow-[0_18px_56px_rgba(1,8,18,0.36)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,231,255,0.24),transparent_32%),radial-gradient(circle_at_78%_24%,rgba(255,209,102,0.22),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_22%,transparent_78%,rgba(134,231,255,0.05)_100%)]" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-2 text-[11px] uppercase tracking-[0.26em] text-[#9fe9ff]">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/76 sm:text-base">
                {description}
              </p>
            </div>

            <Button
              type="button"
              onClick={onBack}
              className="rounded-full border border-[#86e7ff]/34 bg-[#09131f]/44 px-5 py-2.5 text-sm font-semibold text-[#eafcff] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#ffd166]/50 hover:text-[#fff3cf]"
            >
              {backLabel}
            </Button>
          </div>
        </div>

        <div className={innerPanelClassName}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(134,231,255,0.02)_48%,transparent_100%),radial-gradient(circle_at_top_left,rgba(134,231,255,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(243,111,69,0.08),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(134,231,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.18)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="pointer-events-none absolute left-[3%] top-[4%] h-20 w-20 rounded-full border border-[#86e7ff]/16 bg-[#0f2030]" />
          <div className="pointer-events-none absolute right-[5%] top-[8%] h-3 w-24 rounded-full bg-[#ffd166]/35" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
