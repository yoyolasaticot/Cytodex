"use client";

import { CytodexCard } from "@/lib/cards";
import DexCard from "@/components/cytodex/DexCard";
import ScreenFrame from "@/components/cytodex/ScreenFrame";
import { CardUpdate } from "@/components/cytodex/dexTypes";

type CardDetailScreenProps = {
  card: CytodexCard | null;
  onBack: () => void;
  onAddPhotos: (id: number, files: FileList | null) => Promise<void>;
  onReplacePhoto: (
    id: number,
    index: number,
    files: FileList | null
  ) => Promise<void>;
  onRemovePhoto: (id: number, index: number) => void;
  onUpdate: (id: number, patch: CardUpdate) => void;
};

export default function CardDetailScreen({
  card,
  onBack,
  onAddPhotos,
  onReplacePhoto,
  onRemovePhoto,
  onUpdate,
}: CardDetailScreenProps) {
  return (
    <ScreenFrame
      eyebrow="CytoDex"
      title={card?.title ?? "Fiche detail"}
      description={
        card
          ? `Categorie : ${card.category}`
          : "La fiche demandee n'a pas pu etre chargee."
      }
      onBack={onBack}
      backLabel="Retour a la liste"
    >
      {card ? (
        <DexCard
          key={card.id}
          card={card}
          onAddPhotos={onAddPhotos}
          onReplacePhoto={onReplacePhoto}
          onRemovePhoto={onRemovePhoto}
          onUpdate={onUpdate}
        />
      ) : (
        <div className="rounded-[28px] border border-[#86e7ff]/16 bg-[linear-gradient(180deg,rgba(10,24,38,0.94),rgba(8,19,31,0.94))] p-8 text-center text-[#eafcff] shadow-[0_18px_44px_rgba(1,8,18,0.3)]">
          Fiche introuvable.
        </div>
      )}
    </ScreenFrame>
  );
}
