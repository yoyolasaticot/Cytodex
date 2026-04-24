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
          <div className="rounded-[28px] border border-[#1f1f24]/10 bg-white/90 p-8 text-center text-[#1f1f24] shadow-[0_18px_44px_rgba(31,31,36,0.08)]">
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
              ? "bg-[#dff1d7] text-[#23431b]"
              : card.found
                ? "bg-[#fff2cb] text-[#6f5612]"
                : "bg-[#eef1f6] text-[#4c5563]";

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onOpenCard(card.id)}
                className="group flex w-full items-center justify-between gap-4 rounded-[28px] border border-[#1f1f24]/10 bg-white/92 p-5 text-left text-[#1f1f24] shadow-[0_18px_44px_rgba(31,31,36,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(31,31,36,0.12)]"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#5f6472]">
                    Fiche
                  </p>
                  <p className="mt-2 text-xl font-semibold">{card.title}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full border border-[#1f1f24]/10 px-3 py-1.5 text-xs font-semibold shadow-[0_8px_20px_rgba(31,31,36,0.06)] ${statusClassName}`}
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
