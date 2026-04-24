"use client";

import { useMemo } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { CytodexCard } from "@/lib/cards";
import { Button } from "@/components/ui/button";

type BadgeLevel = "Bronze" | "Argent" | "Or" | null;

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

function computeBadge(completed: number, total: number): BadgeLevel {
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  if (ratio >= 100) return "Or";
  if (ratio >= 70) return "Argent";
  if (ratio >= 50) return "Bronze";
  return null;
}

function getBadgeDisplay(level: BadgeLevel) {
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

export default function HomeScreen({
  cards,
  categories,
  user,
  profile,
  onOpenDex,
  onLogout,
}: HomeScreenProps) {
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

          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="shrink-0 rounded-[24px] border border-[#86e7ff]/24 bg-[#09131f]/32 p-3 backdrop-blur shadow-[0_0_24px_rgba(67,190,255,0.12)]">
              <img
                src={`/Avatars/${avatarKey}.png`}
                alt="avatar"
                className="h-24 w-24 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[#9fe9ff]">
                Operateur Cytodex
              </p>
              <h1 className="font-heading break-words text-3xl font-semibold leading-snug text-white sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/78 sm:text-base">
                Tableau de bord du labo retro-futuriste pour repertorier,
                verifier et completer tes fiches d&apos;observation.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[24px] border border-[#86e7ff]/12 bg-[linear-gradient(180deg,rgba(8,19,31,0.82),rgba(11,23,38,0.92))] px-5 py-6 shadow-[0_20px_48px_rgba(1,7,15,0.3)] sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(134,231,255,0.02)_48%,transparent_100%),radial-gradient(circle_at_top_left,rgba(134,231,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(243,111,69,0.08),transparent_26%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-12 [background-image:linear-gradient(rgba(134,231,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="relative flex h-full min-h-[280px] items-center justify-center">
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {badgeData.map(({ category, badge }) => {
                const badgeDisplay = getBadgeDisplay(badge);

                return (
                  <div
                    key={category}
                    className="flex flex-col items-center justify-center rounded-[18px] border border-[#86e7ff]/14 bg-[linear-gradient(180deg,rgba(10,24,38,0.72),rgba(8,19,31,0.78))] p-4 text-center shadow-[0_12px_24px_rgba(1,6,14,0.2)]"
                  >
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full border-[3px] text-center text-sm font-semibold ${badgeDisplay.className}`}
                      title={`${category} - ${badgeDisplay.label}`}
                    >
                      <span className="px-2 leading-tight">
                        {badge ? badgeDisplay.label : ""}
                      </span>
                    </div>
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
