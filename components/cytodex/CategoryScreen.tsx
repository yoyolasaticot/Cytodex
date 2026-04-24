"use client";

import { ChevronRight } from "lucide-react";
import { CytodexCard } from "@/lib/cards";
import ScreenFrame from "@/components/cytodex/ScreenFrame";
import { computeBadge, getBadgeDisplay } from "@/components/cytodex/dexTypes";

type CategoryScreenProps = {
  cards: CytodexCard[];
  categories: string[];
  onBack: () => void;
  onOpenCategory: (category: string) => void;
};

export default function CategoryScreen({
  cards,
  categories,
  onBack,
  onOpenCategory,
}: CategoryScreenProps) {
  const categoryStats = categories.map((category) => {
    const categoryCards = cards.filter((card) => card.category === category);
    const completed = categoryCards.filter((card) => card.completed).length;
    const found = categoryCards.filter((card) => card.found).length;

    return {
      category,
      total: categoryCards.length,
      completed,
      found,
      badge: computeBadge(completed, categoryCards.length),
    };
  });

  return (
    <ScreenFrame
      eyebrow="CytoDex"
      title="Themes des fiches"
      description="Choisir un secteur d'analyse du labo avant d'ouvrir les fiches d'observation."
      onBack={onBack}
      backLabel="Retour a l'accueil"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categoryStats.map(({ category, total, completed, found, badge }) => {
          const badgeDisplay = getBadgeDisplay(badge);

          return (
            <button
              key={category}
              type="button"
              onClick={() => onOpenCategory(category)}
              className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#86e7ff]/16 bg-[linear-gradient(180deg,rgba(10,24,38,0.8),rgba(8,19,31,0.86))] p-4 text-left text-[#eafcff] shadow-[0_14px_32px_rgba(1,8,18,0.24)] transition hover:-translate-y-1 hover:border-[#86e7ff]/26 hover:shadow-[0_20px_42px_rgba(1,10,20,0.3)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,231,255,0.09),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(243,111,69,0.08),transparent_24%)]" />
              <div className="relative min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#9fe9ff]">
                    Secteur
                  </p>
                  <h2 className="mt-2 break-words text-2xl font-semibold leading-snug">
                    {category}
                  </h2>
                </div>

                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] text-xs font-semibold ${badgeDisplay.className}`}
                  title={`${category} - ${badgeDisplay.label}`}
                >
                  {badge ? badgeDisplay.label : ""}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[16px] bg-[#0c1f31]/80 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#89c9db]">
                    Trouvees
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {found} / {total}
                  </p>
                </div>
                <div className="rounded-[16px] bg-[#24170d]/75 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#ffdca0]">
                    Completees
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {completed} / {total}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-full bg-[#09131f]/44 px-4 py-3 text-sm font-semibold text-[#eafcff]">
                <span className="min-w-0 break-words">Ouvrir la categorie</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScreenFrame>
  );
}
