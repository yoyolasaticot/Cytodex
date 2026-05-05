"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { CytodexCard } from "@/lib/cards";
import { Button } from "@/components/ui/button";
import CategoryBadge from "@/components/cytodex/CategoryBadge";
import { computeBadge } from "@/components/cytodex/dexTypes";

type HomeScreenProps = {
  cards: CytodexCard[];
  categories: string[];
  user: SupabaseUser;
  profile: {
    username: string;
    avatar_key: string;
  } | null;
  onOpenDex: () => void;
  onLogout: () => Promise<void>;
};

export default function HomeScreen({
  cards,
  categories,
  user,
  profile,
  onOpenDex,
  onLogout,
}: HomeScreenProps) {
  const nameFrameRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLHeadingElement>(null);
  const [nameFontSize, setNameFontSize] = useState(30);

  const badgeData = useMemo(() => {
    return categories.map((category) => {
      const inCategory = cards.filter((c) => c.category === category);
      const completed = inCategory.filter((c) => c.completed).length;

      return {
        category,
        badge: computeBadge(completed, inCategory.length),
      };
    });
  }, [cards, categories]);

  const displayName =
    profile?.username ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Microscopeur";

  const avatarKey = profile?.avatar_key || "avatar-1";

  useLayoutEffect(() => {
    const nameFrame = nameFrameRef.current;
    const nameText = nameTextRef.current;
    if (!nameFrame || !nameText) return;

    const updateNameSize = () => {
      const maxFontSize = window.matchMedia("(min-width: 640px)").matches
        ? 36
        : 30;
      const minFontSize = 16;

      nameText.style.fontSize = `${maxFontSize}px`;
      const availableWidth = nameFrame.clientWidth;
      const neededWidth = nameText.scrollWidth;
      const nextFontSize =
        neededWidth > availableWidth
          ? Math.max(minFontSize, Math.floor((maxFontSize * availableWidth) / neededWidth))
          : maxFontSize;

      setNameFontSize(nextFontSize);
    };

    updateNameSize();

    const resizeObserver = new ResizeObserver(updateNameSize);
    resizeObserver.observe(nameFrame);
    window.addEventListener("resize", updateNameSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateNameSize);
    };
  }, [displayName]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#15314c_0%,#09131f_44%,#050b14_100%)] px-4 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-[#86e7ff]/34 bg-[#09131f]/68 px-5 py-2.5 text-sm font-semibold text-[#eafcff] shadow-[0_14px_30px_rgba(2,8,18,0.28)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#ffd166]/55 hover:text-[#fff3cf]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Deconnexion
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-[#86e7ff]/20 bg-[linear-gradient(135deg,#081624_0%,#173853_44%,#f36f45_100%)] p-6 text-white shadow-[0_24px_80px_rgba(1,8,18,0.34)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,231,255,0.24),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(255,209,102,0.2),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative flex min-w-0 items-center justify-between gap-4 sm:gap-6">
            <div ref={nameFrameRef} className="min-w-0 flex-1">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[#9fe9ff]">
                Microscopeur
              </p>
              <h1
                ref={nameTextRef}
                className="font-heading overflow-hidden whitespace-nowrap font-semibold leading-snug text-white"
                style={{ fontSize: nameFontSize }}
              >
                {displayName}
              </h1>
            </div>

            <div className="z-10 shrink-0 rounded-[26px] border border-[#86e7ff]/24 bg-[#09131f]/32 p-2.5 shadow-[0_0_28px_rgba(67,190,255,0.14)] backdrop-blur sm:p-3">
              <img
                src={`/Avatars/${avatarKey}.png`}
                alt="avatar"
                className="h-24 w-24 object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.24)] sm:h-36 sm:w-36"
              />
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[24px] border border-[#86e7ff]/12 bg-[linear-gradient(180deg,rgba(8,19,31,0.82),rgba(11,23,38,0.92))] px-5 py-6 shadow-[0_20px_48px_rgba(1,7,15,0.3)] sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(134,231,255,0.02)_48%,transparent_100%),radial-gradient(circle_at_top_left,rgba(134,231,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(243,111,69,0.08),transparent_26%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-12 [background-image:linear-gradient(rgba(134,231,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative flex h-full min-h-[280px] items-center justify-center">
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {badgeData.map(({ category, badge }) => {
                return (
                  <div
                    key={category}
                    className="flex flex-col items-center justify-center rounded-[18px] border border-[#86e7ff]/14 bg-[linear-gradient(180deg,rgba(10,24,38,0.72),rgba(8,19,31,0.78))] p-4 text-center shadow-[0_12px_24px_rgba(1,6,14,0.2)]"
                  >
                    <CategoryBadge category={category} level={badge} size="lg" />
                    <p className="mt-3 break-words text-sm leading-snug font-medium text-[#eafcff]">
                      {category}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <Button
            type="button"
            onClick={onOpenDex}
            className="min-h-[72px] w-full rounded-full border border-[#86e7ff]/34 bg-[linear-gradient(180deg,#10273a,#0d1e2e)] font-heading text-xl font-semibold leading-snug text-[#e6fbff] shadow-[0_0_0_1px_rgba(134,231,255,0.08),0_18px_40px_rgba(1,7,15,0.34)] transition hover:-translate-y-0.5 hover:border-[#ffd166]/55 hover:text-[#fff3cf] sm:text-2xl"
          >
            Acceder aux fiches
          </Button>
        </div>
      </div>
    </div>
  );
}
