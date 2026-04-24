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
        <div className="border-[4px] border-black bg-[#efe8d2] p-8 text-center text-black shadow-[4px_4px_0_#000]">
          Fiche introuvable.
        </div>
      )}
    </ScreenFrame>
  );
}
