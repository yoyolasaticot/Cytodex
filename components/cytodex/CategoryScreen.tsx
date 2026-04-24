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
              className="group flex h-full flex-col rounded-[28px] border border-[#1f1f24]/10 bg-white/90 p-5 text-left text-[#1f1f24] shadow-[0_18px_44px_rgba(31,31,36,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(31,31,36,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#5f6472]">
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
                <div className="rounded-[22px] border border-[#1f1f24]/10 bg-[linear-gradient(180deg,#fff7ea,#fffdf8)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#5f6472]">
                    Trouvees
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[#1f1f24]">
                    {found} / {total}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#1f1f24]/10 bg-[linear-gradient(180deg,#eef5ff,#fffdf8)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#5f6472]">
                    Completees
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[#1f1f24]">
                    {completed} / {total}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-full border border-[#1f1f24]/10 bg-[#fff6dd] px-4 py-3 text-sm font-semibold text-[#1f1f24]">
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
