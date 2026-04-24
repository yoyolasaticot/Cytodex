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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdf7ef_0%,#fffdf8_48%,#eef6ff_100%)] px-4 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col gap-4">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-[#1f1f24] bg-[#fff6dd] px-5 py-2.5 text-sm font-semibold text-[#1f1f24] shadow-[0_10px_30px_rgba(31,31,36,0.12)] transition hover:-translate-y-0.5 hover:bg-[#ffeebd]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Deconnexion
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-[#1f1f24]/10 bg-[linear-gradient(135deg,#1e2030_0%,#2f4764_52%,#ff7a59_100%)] p-6 text-white shadow-[0_24px_80px_rgba(31,31,36,0.16)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(255,214,107,0.24),transparent_24%)]" />

          <div className="relative flex items-center gap-5">
            <div className="shrink-0 rounded-[24px] border border-white/20 bg-white/10 p-3 backdrop-blur">
              <img
                src={`/Avatars/${avatarKey}.png`}
                alt="avatar"
                className="h-24 w-24 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
              />
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/70">
                Microscopeur
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/78 sm:text-base">
                Ton espace Cytodex, entre collection scientifique et petit clin
                d&apos;oeil aux interfaces cultes des annees 80-90.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[32px] border border-[#1f1f24]/10 bg-[linear-gradient(160deg,#fffdf8_0%,#fff7ea_52%,#f2f7ff_100%)] px-6 py-8 shadow-[0_22px_54px_rgba(31,31,36,0.1)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,89,0.09),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(76,130,255,0.08),transparent_26%)]" />
          <div className="pointer-events-none absolute left-[4%] top-[8%] h-20 w-20 rounded-full border border-[#1f1f24]/8 bg-white/55" />
          <div className="pointer-events-none absolute right-[8%] top-[12%] h-3 w-24 rounded-full bg-[#ffd66b]/50" />

          <div className="relative flex h-full min-h-[320px] items-center justify-center">
            <div className="grid w-full grid-cols-2 gap-6 sm:gap-8">
              {badgeData.map(({ category, badge }) => {
                const badgeDisplay = getBadgeDisplay(badge);

                return (
                  <div
                    key={category}
                    className="flex flex-col items-center justify-center rounded-[26px] border border-[#1f1f24]/8 bg-white/72 p-5 text-center shadow-[0_14px_30px_rgba(31,31,36,0.05)] backdrop-blur"
                  >
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-full border-[3px] text-center text-sm font-semibold text-black ${badgeDisplay.className}`}
                      title={`${category} - ${badgeDisplay.label}`}
                    >
                      <span className="px-2 leading-tight">
                        {badge ? badgeDisplay.label : ""}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#1f1f24]">
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
            className="min-h-[72px] w-full rounded-full border border-[#1f1f24] bg-[#fff6dd] text-2xl font-semibold text-[#1f1f24] shadow-[0_18px_40px_rgba(31,31,36,0.12)] transition hover:-translate-y-0.5 hover:bg-[#ffeebd]"
          >
            Acceder aux fiches
          </Button>
        </div>
      </div>
    </div>
  );
}
