"use client";

import { useMemo } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { LogOut, Medal } from "lucide-react";
import { CytodexCard } from "@/lib/cards";
import { Button } from "@/components/ui/button";

type BadgeLevel = "Bronze" | "Argent" | "Or" | null;

type HomeScreenProps = {
  cards: CytodexCard[];
  categories: string[];
  user: SupabaseUser;
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
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Microscopeur";

  const avatarKey =
    (user.user_metadata?.avatar_key as string | undefined) || "avatar-1";

  return (
    <div className="min-h-screen bg-[#d9d9d9] p-3 sm:p-5">
      <div className="mx-auto w-full max-w-md border-[5px] border-black bg-[#efefef] p-4 shadow-[6px_6px_0_#000]">
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            onClick={onLogout}
            className="rounded-none border-[3px] border-black bg-[#efe8d2] px-4 py-2 text-sm font-medium text-black shadow-[3px_3px_0_#000] hover:bg-[#e3dbc2]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <div className="border-[5px] border-black bg-[#e9e2cf] p-4 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center border-[4px] border-black bg-[#d8d1bc]">
              <img
                src={`/avatars/${avatarKey}.png`}
                alt="Avatar utilisateur"
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/avatars/avatar-1.png";
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-black/70">
                Microscopeur
              </p>
              <h1 className="break-words text-3xl font-semibold leading-tight text-black">
                {displayName}
              </h1>
            </div>
          </div>
        </div>

        <div className="mt-4 border-[6px] border-black bg-black p-4">
          <div className="relative overflow-hidden border-[3px] border-[#4c4c4c] bg-[linear-gradient(180deg,#2f2f31,#1f1f21)] px-5 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_18%,rgba(255,255,255,0.02)_32%,transparent_45%)]" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_22px_rgba(255,255,255,0.08)]" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-center gap-2 text-white">
                <Medal className="h-6 w-6" />
                <h2 className="text-2xl font-medium tracking-wide">BADGES</h2>
              </div>

              <div className="grid grid-cols-2 gap-y-8">
                {badgeData.map(({ category, badge }) => {
                  const badgeDisplay = getBadgeDisplay(badge);

                  return (
                    <div
                      key={category}
                      className="flex flex-col items-center justify-center"
                    >
                      <div
                        className={`flex h-28 w-28 items-center justify-center rounded-full border-[3px] text-center text-sm font-semibold text-black ${badgeDisplay.className}`}
                        title={`${category} — ${badgeDisplay.label}`}
                      >
                        <span className="px-2 leading-tight">
                          {badge ? badgeDisplay.label : ""}
                        </span>
                      </div>

                      <p className="mt-3 max-w-[130px] text-center text-xs uppercase tracking-[0.08em] text-white/85">
                        {category}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            onClick={onOpenDex}
            className="min-h-[72px] w-full rounded-none border-[5px] border-black bg-[#efe8d2] text-2xl font-medium text-black shadow-[5px_5px_0_#000] hover:bg-[#e3dbc2]"
          >
            Accéder aux fiches
          </Button>
        </div>
      </div>
    </div>
  );
}