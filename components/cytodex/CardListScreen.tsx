"use client";

import { ChevronRight } from "lucide-react";
import { CytodexCard } from "@/lib/cards";
import ScreenFrame from "@/components/cytodex/ScreenFrame";

type CardListScreenProps = {
  cards: CytodexCard[];
  category: string;
  onBack: () => void;
  onOpenCard: (cardId: number) => void;
};

export default function CardListScreen({
  cards,
  category,
  onBack,
  onOpenCard,
}: CardListScreenProps) {
  const filteredCards = cards.filter((c) => c.category === category);

  return (
    <ScreenFrame
      eyebrow="CytoDex"
      title={category}
      description="Selectionner une fiche dans ce secteur d'analyse."
      onBack={onBack}
      backLabel="Retour aux themes"
    >
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(10,24,38,0.8),rgba(8,19,31,0.86))] p-8 text-center text-[#eafcff] shadow-[0_14px_34px_rgba(1,8,18,0.24)]">
            Aucune fiche dans cette categorie.
          </div>
        ) : (
          filteredCards.map((card) => {
            const statusLabel = card.completed
              ? "Completee"
              : card.found
                ? "Trouvee"
                : "Non trouvee";
            const statusClassName = card.completed
              ? "border-[#86e7ff]/30 bg-[linear-gradient(180deg,rgba(14,62,74,0.96),rgba(8,28,37,0.96))] text-[#b5f5ff]"
              : card.found
                ? "border-[#ffd166]/30 bg-[linear-gradient(180deg,rgba(63,45,18,0.96),rgba(27,20,10,0.96))] text-[#ffe7ad]"
                : "border-[#86e7ff]/18 bg-[linear-gradient(180deg,rgba(21,33,46,0.96),rgba(11,17,24,0.96))] text-[#8ea8b6]";

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onOpenCard(card.id)}
                className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[22px] border border-[#86e7ff]/16 bg-[linear-gradient(180deg,rgba(10,24,38,0.8),rgba(8,19,31,0.86))] p-4 text-left text-[#eafcff] shadow-[0_14px_32px_rgba(1,8,18,0.24)] transition hover:-translate-y-1 hover:border-[#86e7ff]/26 hover:shadow-[0_20px_42px_rgba(1,10,20,0.3)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,231,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(243,111,69,0.08),transparent_24%)]" />
                <div className="relative">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9fe9ff]">
                    Fiche
                  </p>
                  <p className="mt-2 text-xl font-semibold">{card.title}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[0_8px_20px_rgba(1,8,18,0.16)] ${statusClassName}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                </div>

                <ChevronRight className="relative h-5 w-5 shrink-0 text-[#ffd166] transition-transform group-hover:translate-x-1" />
              </button>
            );
          })
        )}
      </div>
    </ScreenFrame>
  );
}
