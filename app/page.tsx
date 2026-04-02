"use client";

import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  Lock,
  Medal,
  User,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type BadgeLevel = "Bronze" | "Argent" | "Or" | null;
type Screen = "cover" | "home" | "categories" | "dex";

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

type CardUpdate = Partial<
  Pick<
    CytodexCard,
    "characteristics" | "pathologies" | "completed" | "found" | "images"
  >
>;

type CoverScreenProps = {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => Promise<void>;
  onSignup: () => Promise<void>;
};

type HomeScreenProps = {
  cards: CytodexCard[];
  user: SupabaseUser;
  onOpenDex: () => void;
  onLogout: () => Promise<void>;
};

type CategoryScreenProps = {
  cards: CytodexCard[];
  onBack: () => void;
  onOpenCategory: (category: string) => void;
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
  category: string;
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
    found: false,
    completed: false,
    images: [],
    characteristics: "",
    pathologies: "",
  },
  {
    id: 2,
    title: "Drépanocyte",
    category: "Pathologies du globule rouge",
    found: false,
    completed: false,
    images: [],
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
    found: false,
    completed: false,
    images: [],
    characteristics: "",
    pathologies: "",
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return "L'adresse email est obligatoire.";
  if (!isValidEmail(email.trim())) return "L'adresse email n'est pas valide.";
  if (!password.trim()) return "Le mot de passe est obligatoire.";
  if (password.trim().length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  return null;
}

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

function fileListToUrls(files: FileList | null): string[] {
  if (!files || files.length === 0) return [];
  return Array.from(files).map((file) => URL.createObjectURL(file));
}

function CoverScreen({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onSignup,
}: CoverScreenProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#7f1d1d,_#1f2937_65%)] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur">
        <div className="relative min-h-[320px] md:min-h-[560px] bg-gradient-to-br from-red-950 via-red-900 to-red-800 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm tracking-wide">
              <BookOpen className="h-4 w-4" />
              Couverture du CytoDex
            </div>
            <h1 className="mt-6 md:mt-8 text-4xl sm:text-5xl font-bold tracking-tight">
              CytoDex
            </h1>
            <p className="mt-4 max-w-md text-red-100 text-lg leading-relaxed">
              Atlas pédagogique personnel des anomalies cytologiques en
              hématologie.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-red-100">
              Édition étudiant
            </p>
            <p className="mt-3 text-2xl font-semibold">
              Ouvre ton CytoDex et poursuis ta collection.
            </p>
          </div>
        </div>

        <div className="min-h-[420px] md:min-h-[560px] bg-background p-5 sm:p-8 md:p-10 flex items-center">
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-3xl">Connexion</CardTitle>
              <p className="text-muted-foreground">
                Chaque utilisateur possède son propre compte et sa propre
                progression.
              </p>
            </CardHeader>

            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
  type="email"
  placeholder="etudiant@chu.fr"
  value={email}
  onChange={(e) => onEmailChange(e.target.value)}
/>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe</label>
                <Input
  type="password"
  value={password}
  onChange={(e) => onPasswordChange(e.target.value)}
  placeholder="••••••••"
/>
              </div>

              <Button
                className="w-full rounded-2xl h-12 sm:h-14 text-base"
                onClick={onLogin}
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-2xl h-12 sm:h-14 text-base"
                onClick={onSignup}
                disabled={loading}
              >
                {loading ? "Création..." : "Créer un compte"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({
  cards,
  user,
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
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 md:p-8 pb-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                CytoDex
              </p>
              <h2 className="text-3xl font-bold mt-2">Accueil utilisateur</h2>
              <p className="text-muted-foreground mt-2">
                Connecté en tant que {user.email}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={onOpenDex} className="rounded-2xl h-11 px-5">
                Accéder aux thèmes <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="rounded-2xl h-11 px-5"
              >
                Déconnexion
              </Button>
            </div>
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
              <div className="text-5xl font-bold">
                {Math.round(
                  (cards.filter((c) => c.completed).length / cards.length) * 100
                )}
                %
              </div>
              <p className="mt-2 text-muted-foreground">
                {cards.filter((c) => c.completed).length} fiches complétées sur{" "}
                {cards.length}
              </p>
              <Progress
                value={
                  (cards.filter((c) => c.completed).length / cards.length) * 100
                }
                className="mt-5 h-3"
              />
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
                <div
                  key={category}
                  className={`rounded-2xl border p-4 ${badgeStyle(badge)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium leading-tight">
                      {category}
                    </p>
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

function CategoryScreen({
  cards,
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
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 pb-24">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              CytoDex
            </p>
            <h2 className="text-3xl font-bold mt-2">Thèmes des fiches</h2>
            <p className="text-muted-foreground mt-2">
              Choisir un grand cadre nosologique avant de feuilleter les fiches.
            </p>
          </div>

          <Button variant="outline" className="rounded-2xl" onClick={onBack}>
            Retour à l’accueil
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {categoryStats.map(({ category, total, completed, found, badge }) => (
            <Card
              key={category}
              className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onOpenCategory(category)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Catégorie
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{category}</h3>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`rounded-full px-3 py-1.5 text-sm ${badgeStyle(
                      badge
                    )}`}
                  >
                    {badge ?? "Aucun badge"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4 border">
                    <p className="text-muted-foreground">Fiches trouvées</p>
                    <p className="text-xl font-semibold mt-1">
                      {found} / {total}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border">
                    <p className="text-muted-foreground">Fiches complétées</p>
                    <p className="text-xl font-semibold mt-1">
                      {completed} / {total}
                    </p>
                  </div>
                </div>

                <Button className="w-full rounded-2xl min-h-11">
                  Ouvrir la catégorie <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function DexCard({
  card,
  onAddPhotos,
  onReplacePhoto,
  onRemovePhoto,
  onUpdate,
}: DexCardProps) {
  const [characteristics, setCharacteristics] = useState(card.characteristics);
  const [pathologies, setPathologies] = useState(card.pathologies);
  const [isCapturing, setIsCapturing] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCharacteristics(card.characteristics);
    setPathologies(card.pathologies);
  }, [card]);

  useEffect(() => {
    if (videoRef.current && isCapturing) {
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [isCapturing]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      alert('Stream assigned to video');
    }
  }, [cameraStream]);

  const saveForm = () => {
    onUpdate(card.id, {
      characteristics,
      pathologies,
      completed: Boolean(
        card.images.length > 0 &&
          characteristics.trim() &&
          pathologies.trim()
      ),
    });
  };

  const startCamera = async (index?: number) => {
    alert('Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      alert('Camera access granted');
      setCameraStream(stream);
      setIsCapturing(true);
      if (index !== undefined) setReplacingIndex(index);
      alert('Camera started, overlay should appear');
    } catch (err) {
      alert('Error accessing camera: ' + err);
    }
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const fileList = dataTransfer.files;
            if (replacingIndex !== null) {
              onReplacePhoto(card.id, replacingIndex, fileList);
            } else {
              onAddPhotos(card.id, fileList);
            }
            stopCamera();
            setReplacingIndex(null);
            console.log('Photo captured and saved');
          }
        }, 'image/jpeg');
      } else {
        console.error('Could not get canvas context');
      }
    } else {
      console.error('videoRef or canvasRef is null');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setReplacingIndex(null);
  };

  if (!card.found) {
    return (
      <>
        <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-slate-300 bg-slate-200 text-slate-600">
          <div className="aspect-[4/3] flex items-center justify-center border-b border-dashed border-slate-400 bg-slate-300">
            <div className="text-center p-6">
              <Lock className="mx-auto h-10 w-10 mb-3" />
              <p className="font-semibold">Fiche non trouvée</p>
              <p className="text-sm mt-1">
                La fiche se débloque uniquement après une photo prise en direct.
              </p>

              <Button
                className="mt-4 rounded-2xl min-h-11 w-full sm:w-auto"
                variant="secondary"
                onClick={() => { alert('Button clicked'); startCamera(); }}
              >
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

        {isCapturing && (
          <div className="fixed inset-0 bg-black z-[9999] flex flex-col h-screen">
            <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover w-full h-full"></video>
            <div className="p-4 flex justify-between">
              <Button onClick={stopCamera} variant="outline">Annuler</Button>
              <Button onClick={capturePhoto}>Capturer</Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden"></canvas>
      </>
    );
  }

  return (
    <>
      <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {card.images[0] ? (
          <img src={card.images[0]} alt={card.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
            Aucune image
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Anomalie
            </p>
            <h3 className="text-2xl font-bold mt-1">{card.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {card.category}
            </p>
          </div>

          {card.completed ? (
            <Badge className="rounded-full px-3 py-1.5 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complétée
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1.5 text-sm"
            >
              À compléter
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="text-sm font-medium">
              Photographies prises en direct
            </label>

            <Button
              type="button"
              variant="outline"
              className="rounded-2xl min-h-11"
              onClick={() => { alert('Button clicked'); startCamera(); }}
            >
              <Camera className="mr-2 h-4 w-4" />
              Ajouter des photos
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {card.images.map((image, index) => (
              <div
                key={`${card.id}-${index}`}
                className="rounded-2xl overflow-hidden border bg-slate-50"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image}
                    alt={`${card.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-2 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl min-h-10 text-xs"
                    onClick={() => startCamera(index)}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Remplacer
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl min-h-10 text-xs"
                    onClick={() => onRemovePhoto(card.id, index)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Caractéristiques de l’anomalie
          </label>
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

    {isCapturing && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
        <div className="p-4 flex justify-between">
          <Button onClick={stopCamera} variant="outline">Annuler</Button>
          <Button onClick={capturePhoto}>Capturer</Button>
        </div>
      </div>
    )}

    <canvas ref={canvasRef} className="hidden"></canvas>
    </>
  );
}

function DexScreen({
  cards,
  category,
  onBack,
  onAddPhotos,
  onReplacePhoto,
  onRemovePhoto,
  onUpdate,
}: DexScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const filteredCards = cards.filter((c) => c.category === category);
  const activeCard = filteredCards[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [category]);

  const goPrev = () =>
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const goNext = () =>
    setActiveIndex((prev) =>
      prev < filteredCards.length - 1 ? prev + 1 : prev
    );

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-8 pb-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              CytoDex
            </p>
            <h2 className="text-3xl font-bold mt-2">{category}</h2>
            <p className="text-muted-foreground mt-2">
              Défilement fiche par fiche à l’intérieur de la catégorie.
            </p>
          </div>

          <Button variant="outline" className="rounded-2xl" onClick={onBack}>
            Retour aux thèmes
          </Button>
        </div>

        <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border p-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="rounded-2xl min-h-11"
            onClick={goPrev}
            disabled={activeIndex === 0}
          >
            Précédente
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Fiche</p>
            <p className="font-semibold">
              {filteredCards.length === 0 ? 0 : activeIndex + 1} /{" "}
              {filteredCards.length}
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-2xl min-h-11"
            onClick={goNext}
            disabled={activeIndex >= filteredCards.length - 1}
          >
            Suivante
          </Button>
        </div>

        {activeCard ? (
          <DexCard
            key={activeCard.id}
            card={activeCard}
            onAddPhotos={onAddPhotos}
            onReplacePhoto={onReplacePhoto}
            onRemovePhoto={onRemovePhoto}
            onUpdate={onUpdate}
          />
        ) : (
          <Card className="rounded-[1.5rem] sm:rounded-[2rem]">
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucune fiche dans cette catégorie.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>("cover");
  const [cards, setCards] = useState<CytodexCard[]>(initialCards);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]
  );
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const userCards = await loadCards(currentUser.id);
        setCards(userCards);
        setScreen("home");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const userCards = await loadCards(currentUser.id);
        setCards(userCards);
      }
      setScreen(currentUser ? "home" : "cover");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (): Promise<void> => {
    const validationError = validateCredentials(email, password);
    if (validationError) {
      alert(validationError);
      return;
    }
  
    setAuthLoading(true);
  
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
  
    if (error) {
      alert(error.message);
    }
  
    setAuthLoading(false);
  };

  const handleSignup = async (): Promise<void> => {
    const validationError = validateCredentials(email, password);
    if (validationError) {
      alert(validationError);
      return;
    }
  
    setAuthLoading(true);
  
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          display_name: email.trim().split("@")[0] ?? "",
        },
      },
    });
  
    if (error) {
      alert(error.message);
    } else {
      alert("Compte créé. Tu peux maintenant te connecter.");
    }
  
    setAuthLoading(false);
  };

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const loadCards = async (userId: string): Promise<CytodexCard[]> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading cards:', error);
      return initialCards; // Fallback to initial cards
    }

    if (data && data.length > 0) {
      return data.map(card => ({
        id: card.id,
        title: card.title,
        category: card.category,
        found: card.found,
        completed: card.completed,
        images: card.images || [],
        characteristics: card.characteristics || '',
        pathologies: card.pathologies || '',
      }));
    }

    // If no cards in DB, initialize with default cards
    const defaultCards = initialCards.map(card => ({ ...card, user_id: userId }));
    const { error: insertError } = await supabase
      .from('cards')
      .insert(defaultCards);

    if (insertError) {
      console.error('Error initializing cards:', insertError);
    }

    return initialCards;
  };

  const saveCard = async (card: CytodexCard, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('cards')
      .upsert({
        id: card.id,
        user_id: userId,
        title: card.title,
        category: card.category,
        found: card.found,
        completed: card.completed,
        images: card.images,
        characteristics: card.characteristics,
        pathologies: card.pathologies,
      });

    if (error) {
      console.error('Error saving card:', error);
    }
  };

  const addPhotos = (id: number, files: FileList | null): void => {
    const newUrls = fileListToUrls(files);
    if (newUrls.length === 0) return;

    setCards((prev) => {
      const updatedCards = prev.map((card) =>
        card.id === id
          ? {
              ...card,
              found: true,
              images: [...card.images, ...newUrls],
            }
          : card
      );
      const updatedCard = updatedCards.find(card => card.id === id);
      if (updatedCard && user) {
        saveCard(updatedCard, user.id);
      }
      return updatedCards;
    });
  };

  const replacePhoto = (
    id: number,
    index: number,
    files: FileList | null
  ): void => {
    const newUrls = fileListToUrls(files);
    if (newUrls.length === 0) return;

    setCards((prev) => {
      const updatedCards = prev.map((card) => {
        if (card.id !== id) return card;
        const nextImages = [...card.images];
        nextImages[index] = newUrls[0];
        return { ...card, images: nextImages };
      });
      const updatedCard = updatedCards.find(card => card.id === id);
      if (updatedCard && user) {
        saveCard(updatedCard, user.id);
      }
      return updatedCards;
    });
  };

  const removePhoto = (id: number, index: number): void => {
    setCards((prev) => {
      const updatedCards = prev.map((card) => {
        if (card.id !== id) return card;
        const nextImages = card.images.filter(
          (_, currentIndex) => currentIndex !== index
        );

        return {
          ...card,
          images: nextImages,
          found: nextImages.length > 0,
          completed:
            nextImages.length > 0 &&
            Boolean(card.characteristics.trim() && card.pathologies.trim()),
        };
      });
      const updatedCard = updatedCards.find(card => card.id === id);
      if (updatedCard && user) {
        saveCard(updatedCard, user.id);
      }
      return updatedCards;
    });
  };

  const updateCard = (id: number, patch: CardUpdate): void => {
    setCards((prev) => {
      const updatedCards = prev.map((card) => (card.id === id ? { ...card, ...patch } : card));
      const updatedCard = updatedCards.find(card => card.id === id);
      if (updatedCard && user) {
        saveCard(updatedCard, user.id);
      }
      return updatedCards;
    });
  };

  if (!user || screen === "cover") {
    return (
      <CoverScreen
        email={email}
        password={password}
        loading={authLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  if (screen === "home") {
    return (
      <HomeScreen
        cards={cards}
        user={user}
        onOpenDex={() => setScreen("categories")}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === "categories") {
    return (
      <CategoryScreen
        cards={cards}
        onBack={() => setScreen("home")}
        onOpenCategory={(category) => {
          setSelectedCategory(category);
          setScreen("dex");
        }}
      />
    );
  }

  return (
    <DexScreen
      cards={cards}
      category={selectedCategory}
      onBack={() => setScreen("categories")}
      onAddPhotos={addPhotos}
      onReplacePhoto={replacePhoto}
      onRemovePhoto={removePhoto}
      onUpdate={updateCard}
    />
  );
}