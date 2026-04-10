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
    <div className="min-h-screen bg-[#d9d9d9] px-4 py-3 flex flex-col">
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
            <div className="shrink-0">
  <img
  src={`/Avatars/${avatarKey}.png`}
  alt="avatar"
  className="h-28 w-28 object-contain drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]"
/>
</div>

            <div className="flex-1 overflow-hidden">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-black/70">
                Microscopeur
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-black whitespace-nowrap">
                {displayName}
              </h1>
            </div>
          </div>
        </div>

        <div className="relative mt-4 flex-1 rounded-[6px] border-[4px] border-[#3a2414] bg-[linear-gradient(180deg,#8a5a35,#5c3821)] p-3 shadow-[6px_6px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-2px_0_rgba(0,0,0,0.22)]">
         <div className="relative overflow-hidden rounded-[2px] border-[3px] border-[#2f2f2f] bg-[linear-gradient(180deg,#2a2c2f,#191a1d)] px-5 py-6 h-full flex items-center justify-center">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.10)_16%,rgba(255,255,255,0.03)_30%,transparent_44%)]" />

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,transparent_18%,transparent_72%,rgba(255,255,255,0.05)_100%)]" />

              <div className="pointer-events-none absolute left-[8%] top-[10%] h-[38%] w-[55%] rotate-[-8deg] rounded-full bg-white/10 blur-2xl" />

             <div className="pointer-events-none absolute right-[10%] top-[18%] h-[24%] w-[20%] rounded-full bg-white/6 blur-xl" />

             <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_26px_rgba(255,255,255,0.08)]" />

            <div className="relative w-full">
             
             <div className="grid grid-cols-2 gap-8 justify-items-center w-full">
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
  );
}