"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import CoverScreen from "@/components/cytodex/CoverScreen";
import HomeScreen from "@/components/cytodex/HomeScreen";
import {
  loginWithEmail,
  logoutUser,
  signupWithEmail,
  validateCredentials,
  validateProfile,
} from "@/lib/auth";
import { CytodexCard, loadCards, saveCard } from "@/lib/cards";
import {
  Lock,
  ChevronRight,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Camera,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Screen = "cover" | "home" | "categories" | "card_list" | "card_detail";

type CardUpdate = Partial<
  Pick<
    CytodexCard,
    "characteristics" | "pathologies" | "completed" | "found" | "images"
  >
>;

type CategoryScreenProps = {
  cards: CytodexCard[];
  categories: string[];
  onBack: () => void;
  onOpenCategory: (category: string) => void;
};

type DexCardProps = {
  card: CytodexCard;
  onAddPhotos: (id: number, files: FileList | null) => Promise<void>;
  onReplacePhoto: (
    id: number,
    index: number,
    files: FileList | null
  ) => Promise<void>;
  onRemovePhoto: (id: number, index: number) => void;
  onUpdate: (id: number, patch: CardUpdate) => void;
};

type CardListScreenProps = {
  cards: CytodexCard[];
  category: string;
  onBack: () => void;
  onOpenCard: (cardId: number) => void;
};

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

type BadgeLevel = "Bronze" | "Argent" | "Or" | null;

type UserProfile = {
  username: string;
  avatar_key: string;
};

function computeBadge(completed: number, total: number): BadgeLevel {
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  if (ratio >= 100) return "Or";
  if (ratio >= 70) return "Argent";
  if (ratio >= 50) return "Bronze";
  return null;
}

function getBadgeDisplay(level: BadgeLevel) {
  if (level === "Or") {
    return {
      label: "Or",
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#fff7bf,#e0b100_68%,#a66b00)] border-[#7a5200] shadow-[0_0_18px_rgba(255,215,0,0.35)]",
    };
  }

  if (level === "Argent") {
    return {
      label: "Argent",
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#ffffff,#cfd5dd_68%,#7a8794)] border-[#5f6872] shadow-[0_0_14px_rgba(220,220,230,0.28)]",
    };
  }

  if (level === "Bronze") {
    return {
      label: "Bronze",
      className:
        "bg-[radial-gradient(circle_at_30%_30%,#f6d2b1,#b87333_68%,#6c3d18)] border-[#5b3215] shadow-[0_0_14px_rgba(184,115,51,0.25)]",
    };
  }

  return {
    label: "Vide",
    className:
      "bg-[radial-gradient(circle_at_30%_30%,#cfcfcf,#a9a9a9_68%,#7d7d7d)] border-[#6b6b6b] opacity-75",
  };
}

const appShellClassName =
  "min-h-screen bg-[#faf8f1] px-4 py-4 sm:px-5 sm:py-5";
const outerPanelClassName =
  "mx-auto flex max-w-6xl flex-col gap-4 rounded-[6px] border-[4px] border-[#3a2414] bg-[linear-gradient(180deg,#8a5a35,#5c3821)] p-3 shadow-[8px_8px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-2px_0_rgba(0,0,0,0.24)]";
const innerPanelClassName =
  "relative overflow-hidden rounded-[2px] border-[3px] border-[#2f2f2f] bg-[linear-gradient(180deg,#2a2c2f,#191a1d)] p-4 text-[#f3ead8] shadow-[inset_0_0_26px_rgba(255,255,255,0.08)]";
const primaryButtonClassName =
  "rounded-none border-[3px] border-black bg-[#efe8d2] px-4 py-2 text-sm font-medium text-black shadow-[3px_3px_0_#000] hover:bg-[#e3dbc2]";
const largePrimaryButtonClassName =
  "min-h-[56px] rounded-none border-[4px] border-black bg-[#efe8d2] px-4 text-base font-medium text-black shadow-[4px_4px_0_#000] hover:bg-[#e3dbc2]";

function ScreenFrame({
  eyebrow,
  title,
  description,
  onBack,
  backLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onBack: () => void;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className={appShellClassName}>
      <div className={outerPanelClassName}>
        <div className="border-[4px] border-black bg-[#e9e2cf] p-4 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-black/70">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-black sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-black/70 sm:text-base">
                {description}
              </p>
            </div>

            <Button type="button" onClick={onBack} className={primaryButtonClassName}>
              {backLabel}
            </Button>
          </div>
        </div>

        <div className={innerPanelClassName}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_16%,rgba(255,255,255,0.03)_30%,transparent_44%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_18%,transparent_72%,rgba(255,255,255,0.05)_100%)]" />
          <div className="pointer-events-none absolute left-[-12%] top-[8%] h-[14%] w-[65%] rotate-[-14deg] bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute right-[8%] top-[12%] h-[20%] w-[20%] rounded-full bg-white/6 blur-xl" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

async function fileListToUrls(
  files: FileList | null,
  userId: string
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const uploadPromises = Array.from(files).map(async (file) => {
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `card-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;
    const path = `${userId}/${fileName}`;

    const { error } = await supabase.storage.from("card-images").upload(path, file);

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    return path;
  });

  const uploaded = await Promise.all(uploadPromises);
  return uploaded.filter((url): url is string => url !== null);
}

async function getSignedUrl(path: string): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data, error } = await supabase.storage
    .from("card-images")
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    console.error("Error creating signed URL for", path, error);
    return "";
  }

  return data.signedUrl;
}

function CategoryScreen({
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

function DexCard({
  card,
  onAddPhotos,
  onReplacePhoto,
  onRemovePhoto,
  onUpdate,
}: DexCardProps) {
  const [characteristics, setCharacteristics] = useState(card.characteristics);
  const [pathologies, setPathologies] = useState(card.pathologies);
  const [signedImageUrls, setSignedImageUrls] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageViewerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);

  useEffect(() => {
    setCharacteristics(card.characteristics);
    setPathologies(card.pathologies);
  }, [card]);

  useEffect(() => {
    let isCancelled = false;

    const loadUrls = async () => {
      const urls = await Promise.all(card.images.map((img) => getSignedUrl(img)));
      if (!isCancelled) {
        setSignedImageUrls(urls.filter(Boolean));
      }
    };

    loadUrls();

    return () => {
      isCancelled = true;
    };
  }, [card.images]);

  useEffect(() => {
    if (videoRef.current && isCapturing) {
      videoRef.current.play().catch((err) => console.error("Error playing video:", err));
    }
  }, [isCapturing]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      setIsCapturing(true);
      if (index !== undefined) setReplacingIndex(index);
    } catch (err) {
      alert("Erreur d'accès à la caméra : " + String(err));
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;

        if (replacingIndex !== null) {
          onReplacePhoto(card.id, replacingIndex, fileList);
        } else {
          onAddPhotos(card.id, fileList);
        }

        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
    setReplacingIndex(null);
  };

const openFullscreenImage = (imageUrl: string) => {
  console.log("open image", imageUrl);
  setFullscreenImage(imageUrl);
  setZoomLevel(1);
  setTranslateX(0);
  setTranslateY(0);
};

const closeFullscreenImage = () => {
  setFullscreenImage(null);
  setZoomLevel(1);
  setTranslateX(0);
  setTranslateY(0);
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getTouchDistance = (
  touches: React.TouchEvent<HTMLDivElement>["touches"]
) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const handleViewerTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
  if (e.touches.length === 1) {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      if (zoomLevel > 1) {
        setZoomLevel(1);
        setTranslateX(0);
        setTranslateY(0);
      } else {
        setZoomLevel(2);
      }
    }

    lastTapRef.current = now;

    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    panStartRef.current = {
      x: translateX,
      y: translateY,
    };

    setIsDraggingImage(true);
  }

  if (e.touches.length === 2) {
    pinchDistanceRef.current = getTouchDistance(e.touches);
    pinchStartZoomRef.current = zoomLevel;
    setIsDraggingImage(false);
  }
};

const handleViewerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
  if (e.touches.length === 2) {
    const currentDistance = getTouchDistance(e.touches);
    const startDistance = pinchDistanceRef.current;

    if (!startDistance) return;

    const scaleFactor = currentDistance / startDistance;
    const nextZoom = clamp(pinchStartZoomRef.current * scaleFactor, 1, 4);
    setZoomLevel(nextZoom);

    if (nextZoom <= 1) {
      setTranslateX(0);
      setTranslateY(0);
    }

    return;
  }

  if (e.touches.length === 1 && isDraggingImage && zoomLevel > 1) {
    e.preventDefault();

    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;

    const maxOffset = 220 * (zoomLevel - 1);

    setTranslateX(clamp(panStartRef.current.x + deltaX, -maxOffset, maxOffset));
    setTranslateY(clamp(panStartRef.current.y + deltaY, -maxOffset, maxOffset));
  }
};

const handleViewerTouchEnd = () => {
  setIsDraggingImage(false);
  pinchDistanceRef.current = null;

  if (zoomLevel <= 1) {
    setTranslateX(0);
    setTranslateY(0);
  }
};

  if (!card.found) {
    return (
      <>
        <Card className="overflow-hidden rounded-[2px] border-[4px] border-black bg-[#ddd3b8] text-black shadow-[4px_4px_0_#000]">
          <div className="flex aspect-[4/3] items-center justify-center border-b-[4px] border-black bg-[repeating-linear-gradient(-45deg,#d5cfbf,#d5cfbf_12px,#cbc4b1_12px,#cbc4b1_24px)]">
            <div className="text-center p-6">
              <Lock className="mx-auto h-10 w-10 mb-3" />
              <p className="font-semibold">Fiche non trouvée</p>
              <p className="text-sm mt-1">
                La fiche se débloque uniquement après une photo prise en direct.
              </p>

              <Button
                className={`mt-4 w-full sm:w-auto ${largePrimaryButtonClassName}`}
                onClick={() => startCamera()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Prendre une photo
              </Button>
            </div>
          </div>

          <CardContent className="space-y-3 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Anomalie</p>
              <h3 className="text-2xl font-bold mt-1">{card.title}</h3>
            </div>
            <div className="border-[3px] border-dashed border-black/35 bg-[#e6dcc2] p-4 text-sm">
              Champs verrouillés jusqu’à validation d’une image prise en direct.
            </div>
          </CardContent>
        </Card>

        {isCapturing && (
          <div className="fixed inset-0 bg-black z-[9999] flex flex-col h-screen">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="flex-1 object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 flex justify-between gap-2 z-[10000]">
              <Button
                onClick={stopCamera}
                variant="outline"
                className="bg-white text-black hover:bg-gray-200"
              >
                Annuler
              </Button>
              <Button
                onClick={capturePhoto}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Capturer
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden rounded-[2px] border-[4px] border-black bg-[#efe8d2] shadow-[4px_4px_0_#000]">
        <div className="aspect-[4/3] overflow-hidden border-b-[4px] border-black bg-[#d7d0bc]">
          {signedImageUrls[0] ? (
  <button
    type="button"
    onClick={() => openFullscreenImage(signedImageUrls[0])}
    className="h-full w-full"
  >
    <img
      src={signedImageUrls[0]}
      alt={card.title}
      className="h-full w-full object-cover"
    />
  </button>
) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-[#6f6758]">
              Aucune image
            </div>
          )}
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f6758]">
                Anomalie
              </p>
              <h3 className="text-2xl font-bold mt-1">{card.title}</h3>
              <p className="text-sm text-[#6f6758] mt-1">
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
                className={primaryButtonClassName}
                onClick={() => startCamera()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Ajouter des photos
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {signedImageUrls.map((imageUrl, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="overflow-hidden border-[3px] border-black bg-[#e6dcc2]"
                >
                  <div className="aspect-square overflow-hidden">
  <button
    type="button"
    onClick={() => openFullscreenImage(imageUrl)}
    className="h-full w-full"
  >
    <img
      src={imageUrl}
      alt={`${card.title} ${index + 1}`}
      className="h-full w-full object-cover"
    />
  </button>
</div>

                  <div className="p-2 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={primaryButtonClassName}
                      onClick={() => startCamera(index)}
                    >
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      Remplacer
                    </Button>

                    <Button
  type="button"
  variant="outline"
  className={primaryButtonClassName}
  onClick={() => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette photo ?"
    );

    if (confirmed) {
      onRemovePhoto(card.id, index);
    }
  }}
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
              className="min-h-[120px] w-full border-[3px] border-black bg-[#f7f1e3] p-3 text-base outline-none"
              value={characteristics}
              onChange={(e) => setCharacteristics(e.target.value)}
              placeholder="Décrire les caractéristiques morphologiques..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pathologies associées</label>
            <textarea
              className="min-h-[110px] w-full border-[3px] border-black bg-[#f7f1e3] p-3 text-base outline-none"
              value={pathologies}
              onChange={(e) => setPathologies(e.target.value)}
              placeholder="Renseigner les pathologies dans lesquelles cette anomalie est rencontrée..."
            />
          </div>

          <Button className={`w-full ${largePrimaryButtonClassName}`} onClick={saveForm}>
            Enregistrer la fiche
          </Button>
        </CardContent>
      </Card>

      {isCapturing && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col h-screen">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 object-cover w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 flex justify-between gap-2 z-[10000]">
            <Button
              onClick={stopCamera}
              variant="outline"
              className="bg-white text-black hover:bg-gray-200"
            >
              Annuler
            </Button>
            <Button
              onClick={capturePhoto}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Capturer
            </Button>
          </div>
        </div>
      )}

{fullscreenImage && (
  <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
    <div className="flex items-center justify-between gap-3 p-4 bg-black/80">
      <Button
        type="button"
        variant="outline"
        onClick={closeFullscreenImage}
        className="bg-white text-black hover:bg-gray-200"
      >
        Retour
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-white text-sm">
          {Math.round(zoomLevel * 100)}%
        </span>

        <Button
          type="button"
          variant="outline"
          onClick={closeFullscreenImage}
          className="bg-white text-black hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div
     ref={imageViewerRef}
      className="flex-1 overflow-hidden flex items-center justify-center bg-black"
      style={{ touchAction: "none" }}
      onTouchStart={handleViewerTouchStart}
      onTouchMove={handleViewerTouchMove}
      onTouchEnd={handleViewerTouchEnd}
    >
      <img
        src={fullscreenImage}
        alt="Image en plein écran"
        draggable={false}
        className="max-w-full max-h-full select-none transition-transform duration-75"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  </div>
)}
      
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}

function CardListScreen({
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

function CardDetailScreen({
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

export default function Page() {
  const [screen, setScreen] = useState<Screen>("cover");
  const [cards, setCards] = useState<CytodexCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarKey, setAvatarKey] = useState("avatar-1");
  const [coverMode, setCoverMode] = useState<"menu" | "login" | "signup">("menu");
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  

  const categories = useMemo(() => {
    return Array.from(new Set(cards.map((c) => c.category)));
  }, [cards]);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }

    if (
      selectedCategory &&
      categories.length > 0 &&
      !categories.includes(selectedCategory)
    ) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

const refreshUserData = async (currentUser: SupabaseUser) => {
  try {
    const userCards = await loadCards(currentUser.id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_key")
      .eq("id", currentUser.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    setCards(userCards);
    setProfile(profileData);
    setScreen("home");
  } catch (error: unknown) {
    console.error("Error refreshing user data:", error);
    alert("Erreur chargement cartes: " + JSON.stringify(error));
  }
};

  const selectedCard =
  cards.find((card) => card.id === selectedCardId) ?? null;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await refreshUserData(currentUser);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

          if (currentUser) {
      await refreshUserData(currentUser);
    } else {
      setCards([]);
      setProfile(null);
      setSelectedCategory("");
      setScreen("cover");
    }
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

    const { error } = await loginWithEmail(email, password);

    if (error) {
      alert(error.message);
    }

    setAuthLoading(false);
  };

  const handleSignup = async (): Promise<void> => {
  const credentialsError = validateCredentials(email, password);
  if (credentialsError) {
    alert(credentialsError);
    return;
  }

  const profileError = validateProfile(username, avatarKey);
  if (profileError) {
    alert(profileError);
    return;
  }

  setAuthLoading(true);

  const { error } = await signupWithEmail(
    email,
    password,
    username,
    avatarKey
  );

  if (error) {
    alert(error.message);
  } else {
    alert("Compte créé. Tu peux maintenant te connecter.");
    setUsername("");
    setAvatarKey("avatar-1");
  }

  setAuthLoading(false);
};

  const handleLogout = async (): Promise<void> => {
  setCoverMode("menu");
  setProfile(null);
  await logoutUser();
};

  const addPhotos = async (id: number, files: FileList | null): Promise<void> => {
    if (!user) {
      alert("Vous devez être connecté pour ajouter des photos.");
      return;
    }

    const newUrls = await fileListToUrls(files, user.id);
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

      const updatedCard = updatedCards.find((card) => card.id === id);
      if (updatedCard) {
        void saveCard(updatedCard).catch((error) => {
          console.error("Error saving card:", error);
          alert(
            "Erreur sauvegarde carte " +
              updatedCard.id +
              ": " +
              JSON.stringify(error)
          );
        });
      }

      return updatedCards;
    });
  };

  const replacePhoto = async (
    id: number,
    index: number,
    files: FileList | null
  ): Promise<void> => {
    if (!user) {
      alert("Vous devez être connecté pour remplacer une photo.");
      return;
    }

    const newUrls = await fileListToUrls(files, user.id);
    if (newUrls.length === 0) return;

    setCards((prev) => {
      const updatedCards = prev.map((card) => {
        if (card.id !== id) return card;

        const nextImages = [...card.images];
        nextImages[index] = newUrls[0];

        return { ...card, images: nextImages };
      });

      const updatedCard = updatedCards.find((card) => card.id === id);
      if (updatedCard) {
        void saveCard(updatedCard).catch((error) => {
          console.error("Error saving card:", error);
          alert(
            "Erreur sauvegarde carte " +
              updatedCard.id +
              ": " +
              JSON.stringify(error)
          );
        });
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

      const updatedCard = updatedCards.find((card) => card.id === id);
      if (updatedCard) {
        void saveCard(updatedCard).catch((error) => {
          console.error("Error saving card:", error);
          alert(
            "Erreur sauvegarde carte " +
              updatedCard.id +
              ": " +
              JSON.stringify(error)
          );
        });
      }

      return updatedCards;
    });
  };

  const updateCard = (id: number, patch: CardUpdate): void => {
    setCards((prev) => {
      const updatedCards = prev.map((card) =>
        card.id === id ? { ...card, ...patch } : card
      );

      const updatedCard = updatedCards.find((card) => card.id === id);
      if (updatedCard) {
        void saveCard(updatedCard).catch((error) => {
          console.error("Error saving card:", error);
          alert(
            "Erreur sauvegarde carte " +
              updatedCard.id +
              ": " +
              JSON.stringify(error)
          );
        });
      }

      return updatedCards;
    });
  };

  if (!user) {
    return (
      <CoverScreen
  email={email}
  password={password}
  username={username}
  avatarKey={avatarKey}
  loading={authLoading}
  mode={coverMode}
  onEmailChange={setEmail}
  onPasswordChange={setPassword}
  onUsernameChange={setUsername}
  onAvatarChange={setAvatarKey}
  onLogin={handleLogin}
  onSignup={handleSignup}
  onSetMode={setCoverMode}
/>
    );
  }

if (screen === "home") {
  return (
    <HomeScreen
      cards={cards}
      categories={categories}
      user={user}
      profile={profile}
      onOpenDex={() => setScreen("categories")}
      onLogout={handleLogout}
    />
  );
}

  if (screen === "categories") {
    return (
      <CategoryScreen
        cards={cards}
        categories={categories}
        onBack={() => setScreen("home")}
        onOpenCategory={(category) => {
  setSelectedCategory(category);
  setSelectedCardId(null);
  setScreen("card_list");
}}
      />
    );
  }

if (screen === "card_list") {
  return (
    <CardListScreen
      cards={cards}
      category={selectedCategory}
      onBack={() => setScreen("categories")}
      onOpenCard={(cardId) => {
        setSelectedCardId(cardId);
        setScreen("card_detail");
      }}
    />
  );
}

return (
  <CardDetailScreen
    card={selectedCard}
    onBack={() => setScreen("card_list")}
    onAddPhotos={addPhotos}
    onReplacePhoto={replacePhoto}
    onRemovePhoto={removePhoto}
    onUpdate={updateCard}
  />
);
}



