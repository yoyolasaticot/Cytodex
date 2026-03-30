"use client";

import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import { Lock, Medal, User, BookOpen, ChevronRight, ImagePlus, CheckCircle2, Trash2, RefreshCw, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BadgeLevel = "Bronze" | "Argent" | "Or" | null;
type Screen = "cover" | "home" | "dex";

type CytodexCard = {
  id: number;
  title: string;
  category: string;
  found: boolean;
  completed: boolean;
  images: string[];
  characteristics: string;
  pathologies: string;
};

type CardUpdate = Partial<Pick<CytodexCard, "characteristics" | "pathologies" | "completed" | "found" | "images">>;

type CoverScreenProps = {
  onLogin: () => void;
};

type HomeScreenProps = {
  cards: CytodexCard[];
  onOpenDex: () => void;
};

type DexCardProps = {
  card: CytodexCard;
  onAddPhotos: (id: number, files: FileList | null) => void;
  onReplacePhoto: (id: number, index: number, files: FileList | null) => void;
  onRemovePhoto: (id: number, index: number) => void;
  onUpdate: (id: number, patch: CardUpdate) => void;
};

type DexScreenProps = {
  cards: CytodexCard[];
  onBack: () => void;
  onAddPhotos: (id: number, files: FileList | null) => void;
  onReplacePhoto: (id: number, index: number, files: FileList | null) => void;
  onRemovePhoto: (id: number, index: number) => void;
  onUpdate: (id: number, patch: CardUpdate) => void;
};

const categories = [
  "Pathologies du globule rouge",
  "Pathologies du lymphocyte",
  "Pathologies du neutrophile",
  "Pathologies du monocyte",
  "Pathologies plaquettaires",
  "Leucémies",
];

const initialCards: CytodexCard[] = [
  {
    id: 1,
    title: "Schizocyte",
    category: "Pathologies du globule rouge",
    found: true,
    completed: true,
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop"],
    characteristics: "Fragments érythrocytaires irréguliers, anguleux, de petite taille.",
    pathologies: "Microangiopathie thrombotique, CIVD, hémolyse mécanique.",
  },
  {
    id: 2,
    title: "Drépanocyte",
    category: "Pathologies du globule rouge",
    found: true,
    completed: false,
    images: ["https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop"],
    characteristics: "",
    pathologies: "",
  },
  {
    id: 3,
    title: "Lymphocyte hyperbasophile",
    category: "Pathologies du lymphocyte",
    found: false,
    completed: false,
    images: [],
    characteristics: "",
    pathologies: "",
  },
  {
    id: 4,
    title: "Cellule chevelue",
    category: "Pathologies du lymphocyte",
    found: false,
    completed: false,
    images: [],
    characteristics: "",
    pathologies: "",
  },
  {
    id: 5,
    title: "Blaste myéloïde",
    category: "Leucémies",
    found: true,
    completed: true,
    images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop"],
    characteristics: "Grande cellule, chromatine fine, nucléoles visibles, rapport N/C élevé.",
    pathologies: "Leucémie aiguë myéloïde.",
  },
  {
    id: 6,
    title: "Auer rod",
    category: "Leucémies",
    found: false,
    completed: false,
    images: [],
    characteristics: "",
    pathologies: "",
  },
];

function computeBadge(completed: number, total: number): BadgeLevel {
  const ratio = total === 0 ? 0 : (completed / total) * 100;
  if (ratio >= 100) return "Or";
  if (ratio >= 70) return "Argent";
  if (ratio >= 50) return "Bronze";
  return null;
}

function badgeStyle(level: BadgeLevel): string {
  if (level === "Or") return "bg-yellow-100 text-yellow-900 border-yellow-300";
  if (level === "Argent") return "bg-slate-100 text-slate-800 border-slate-300";
  if (level === "Bronze") return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-muted text-muted-foreground border-dashed";
}

function fileListToUrls(files: FileList | null): Promise<string[]> {
  if (!files || files.length === 0) return Promise.resolve([]);

  const readers = Array.from(files).map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Impossible de lire l'image."));
        reader.readAsDataURL(file);
      })
  );

  return Promise.all(readers);
}

function CoverScreen({ onLogin }: CoverScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#7f1d1d,_#1f2937_65%)] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur">
        <div className="relative min-h-[320px] md:min-h-[560px] bg-gradient-to-br from-red-950 via-red-900 to-red-800 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm tracking-wide">
              <BookOpen className="h-4 w-4" />
              Couverture du CytoDex
            </div>
            <h1 className="mt-6 md:mt-8 text-4xl sm:text-5xl font-bold tracking-tight">CytoDex</h1>
            <p className="mt-4 max-w-md text-red-100 text-lg leading-relaxed">
              Atlas pédagogique personnel des anomalies cytologiques en hématologie.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-red-100">Édition étudiant</p>
            <p className="mt-3 text-2xl font-semibold">Ouvre ton CytoDex et poursuis ta collection.</p>
          </div>
        </div>

        <div className="min-h-[420px] md:min-h-[560px] bg-background p-5 sm:p-8 md:p-10 flex items-center">
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-3xl">Connexion</CardTitle>
              <p className="text-muted-foreground">
                L’écran de connexion correspond à la couverture du CytoDex. Une fois authentifié, le livre s’ouvre sur l’accueil.
              </p>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="etudiant@chu.fr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button className="w-full rounded-2xl h-12 sm:h-14 text-base" onClick={onLogin}>
                Ouvrir le CytoDex
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ cards, onOpenDex }: HomeScreenProps) {
  const badgeData = useMemo(() => {
    return categories.map((category) => {
      const inCategory = cards.filter((c) => c.category === category);
      const completed = inCategory.filter((c) => c.completed).length;
      return {
        category,
        badge: computeBadge(completed, inCategory.length),
      };
    });
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 md:p-8 pb-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">CytoDex</p>
              <h2 className="text-3xl font-bold mt-2">Accueil utilisateur</h2>
              <p className="text-muted-foreground mt-2">Vue synthétique avec progression globale et emplacements de badges.</p>
            </div>
            <Button onClick={onOpenDex} className="rounded-2xl h-11 px-5">
              Accéder aux fiches <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Progression globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{Math.round((cards.filter((c) => c.completed).length / cards.length) * 100)}%</div>
              <p className="mt-2 text-muted-foreground">
                {cards.filter((c) => c.completed).length} fiches complétées sur {cards.length}
              </p>
              <Progress value={(cards.filter((c) => c.completed).length / cards.length) * 100} className="mt-5 h-3" />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Badges obtenus
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badgeData.map(({ category, badge }) => (
                <div key={category} className={`rounded-2xl border p-4 ${badgeStyle(badge)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium leading-tight">{category}</p>
                    <Medal className="h-5 w-5 shrink-0" />
                  </div>
                  <p className="mt-3 text-sm">{badge ?? "Emplacement vide"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DexCard({ card, onAddPhotos, onReplacePhoto, onRemovePhoto, onUpdate }: DexCardProps) {
  const [characteristics, setCharacteristics] = useState(card.characteristics);
  const [pathologies, setPathologies] = useState(card.pathologies);
  const addPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const replacePhotoRefs = useRef<Array<HTMLInputElement | null>>([]);

  const saveForm = () => {
    onUpdate(card.id, {
      characteristics,
      pathologies,
      completed: Boolean(card.images.length > 0 && characteristics.trim() && pathologies.trim()),
    });
  };

  const hiddenCaptureInput = (refCallback: (node: HTMLInputElement | null) => void, onChange: (e: ChangeEvent<HTMLInputElement>) => void, multiple = false) => (
    <input
      ref={refCallback}
      type="file"
      accept="image/*"
      capture="environment"
      multiple={multiple}
      className="hidden"
      onChange={onChange}
    />
  );

  if (!card.found) {
    return (
      <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-slate-300 bg-slate-200 text-slate-600">
        <div className="aspect-[4/3] flex items-center justify-center border-b border-dashed border-slate-400 bg-slate-300">
          <div className="text-center p-6">
            <Lock className="mx-auto h-10 w-10 mb-3" />
            <p className="font-semibold">Fiche non trouvée</p>
            <p className="text-sm mt-1">La fiche se débloque uniquement après une photo prise en direct.</p>
            {hiddenCaptureInput(
              (node) => {
                addPhotoInputRef.current = node;
              },
              (e) => onAddPhotos(card.id, e.target.files),
              true
            )}
            <Button className="mt-4 rounded-2xl min-h-11 w-full sm:w-auto" variant="secondary" onClick={() => addPhotoInputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Prendre une photo
            </Button>
          </div>
        </div>
        <CardContent className="p-5 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]">Anomalie</p>
            <h3 className="text-2xl font-bold mt-1">{card.title}</h3>
          </div>
          <div className="rounded-xl border border-dashed border-slate-400 p-4 text-sm">
            Champs verrouillés jusqu’à validation d’une image prise en direct.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {card.images[0] ? <img src={card.images[0]} alt={card.title} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">Aucune image</div>}
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Anomalie</p>
            <h3 className="text-2xl font-bold mt-1">{card.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{card.category}</p>
          </div>
          {card.completed ? (
            <Badge className="rounded-full px-3 py-1.5 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complétée
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-sm">
              À compléter
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="text-sm font-medium">Photographies prises en direct</label>
            {hiddenCaptureInput(
              (node) => {
                addPhotoInputRef.current = node;
              },
              (e) => onAddPhotos(card.id, e.target.files),
              true
            )}
            <Button type="button" variant="outline" className="rounded-2xl min-h-11" onClick={() => addPhotoInputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Ajouter des photos
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {card.images.map((image, index) => (
              <div key={`${card.id}-${index}`} className="rounded-2xl overflow-hidden border bg-slate-50">
                <div className="aspect-square overflow-hidden">
                  <img src={image} alt={`${card.title} ${index + 1}`} className="h-full w-full object-cover" />
                </div>
                <div className="p-2 space-y-2">
                  {hiddenCaptureInput(
                    (node) => {
                      replacePhotoRefs.current[index] = node;
                    },
                    (e) => onReplacePhoto(card.id, index, e.target.files),
                    false
                  )}
                  <Button type="button" variant="outline" className="w-full rounded-xl min-h-10 text-xs" onClick={() => replacePhotoRefs.current[index]?.click()}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Remplacer
                  </Button>
                  <Button type="button" variant="outline" className="w-full rounded-xl min-h-10 text-xs" onClick={() => onRemovePhoto(card.id, index)}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Caractéristiques de l’anomalie</label>
          <textarea
            className="min-h-[120px] w-full rounded-2xl border bg-background p-3 text-base sm:text-sm outline-none"
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            placeholder="Décrire les caractéristiques morphologiques..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pathologies associées</label>
          <textarea
            className="min-h-[110px] w-full rounded-2xl border bg-background p-3 text-base sm:text-sm outline-none"
            value={pathologies}
            onChange={(e) => setPathologies(e.target.value)}
            placeholder="Renseigner les pathologies dans lesquelles cette anomalie est rencontrée..."
          />
        </div>

        <Button className="w-full rounded-2xl min-h-11" onClick={saveForm}>
          Enregistrer la fiche
        </Button>
      </CardContent>
    </Card>
  );
}

function DexScreen({ cards, onBack, onAddPhotos, onReplacePhoto, onRemovePhoto, onUpdate }: DexScreenProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const filteredCards = cards.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">CytoDex</p>
            <h2 className="text-3xl font-bold mt-2">Fiches des anomalies</h2>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={onBack}>
            Retour à l’accueil
          </Button>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full h-auto flex md:flex-wrap justify-start rounded-2xl p-2 bg-white border overflow-x-auto whitespace-nowrap gap-2">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="rounded-xl px-4 py-3 text-left whitespace-normal md:whitespace-normal h-auto min-h-11 shrink-0">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCards.map((card) => (
            <DexCard
              key={card.id}
              card={card}
              onAddPhotos={onAddPhotos}
              onReplacePhoto={onReplacePhoto}
              onRemovePhoto={onRemovePhoto}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CytodexPrototypeApp() {
  const [screen, setScreen] = useState<Screen>("cover");
  const [cards, setCards] = useState<CytodexCard[]>(initialCards);

  const addPhotos = async (id: number, files: FileList | null): Promise<void> => {
    const newUrls = await fileListToUrls(files);
    if (newUrls.length === 0) return;

    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              found: true,
              images: [...card.images, ...newUrls],
            }
          : card
      )
    );
  };

  const replacePhoto = async (id: number, index: number, files: FileList | null): Promise<void> => {
    const newUrls = await fileListToUrls(files);
    if (newUrls.length === 0) return;

    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const nextImages = [...card.images];
        nextImages[index] = newUrls[0];
        return { ...card, images: nextImages };
      })
    );
  };

  const removePhoto = (id: number, index: number): void => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const nextImages = card.images.filter((_, currentIndex) => currentIndex !== index);
        return {
          ...card,
          images: nextImages,
          found: nextImages.length > 0,
          completed: nextImages.length > 0 && Boolean(card.characteristics.trim() && card.pathologies.trim()),
        };
      })
    );
  };

  const updateCard = (id: number, patch: CardUpdate): void => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...patch } : card)));
  };

  if (screen === "cover") {
    return <CoverScreen onLogin={() => setScreen("home")} />;
  }

  if (screen === "home") {
    return <HomeScreen cards={cards} onOpenDex={() => setScreen("dex")} />;
  }

  return (
    <DexScreen
      cards={cards}
      onBack={() => setScreen("home")}
      onAddPhotos={addPhotos}
      onReplacePhoto={replacePhoto}
      onRemovePhoto={removePhoto}
      onUpdate={updateCard}
    />
  );
}
