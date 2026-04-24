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
      description="Choisir un grand cadre nosologique avant de feuilleter les fiches."
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
              className="group flex h-full flex-col rounded-[2px] border-[4px] border-black bg-[#efe8d2] p-4 text-left text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 hover:bg-[#f5efdd]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-black/60">
                    Categorie
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight">
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

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="border-[3px] border-[#3a2414] bg-[#e6dcc2] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-black/60">
                    Trouvees
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {found} / {total}
                  </p>
                </div>
                <div className="border-[3px] border-[#3a2414] bg-[#e6dcc2] p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-black/60">
                    Completees
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {completed} / {total}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-[3px] border-black bg-[#d9ceb0] px-4 py-3 text-sm font-medium shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]">
                <span>Ouvrir la categorie</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </ScreenFrame>
  );
}
