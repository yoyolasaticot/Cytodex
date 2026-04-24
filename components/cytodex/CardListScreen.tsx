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
      description="Selectionner une fiche pour l'ouvrir."
      onBack={onBack}
      backLabel="Retour aux themes"
    >
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <div className="border-[4px] border-black bg-[#efe8d2] p-6 text-center text-black shadow-[4px_4px_0_#000]">
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
              ? "bg-[#d7e7c4] text-[#243616]"
              : card.found
                ? "bg-[#e8ddbc] text-[#4d3316]"
                : "bg-[#d9d9d9] text-[#3a3a3a]";

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onOpenCard(card.id)}
                className="group flex w-full items-center justify-between gap-4 rounded-[2px] border-[4px] border-black bg-[#efe8d2] p-4 text-left text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 hover:bg-[#f5efdd]"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-black/60">
                    Fiche
                  </p>
                  <p className="mt-2 text-xl font-semibold">{card.title}</p>
                  <span
                    className={`mt-3 inline-flex border-[2px] border-black px-2 py-1 text-xs font-semibold ${statusClassName}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })
        )}
      </div>
    </ScreenFrame>
  );
}
