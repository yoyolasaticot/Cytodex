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

type DexScreenProps = {
  cards: CytodexCard[];
  category: string;
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

function computeBadge(completed: number, total: number): BadgeLevel {
  const ratio = total === 0 ? 0 : (completed / total) * 100;

  if (ratio >= 100) return "Or";
  if (ratio >= 70) return "Argent";
  if (ratio >= 50) return "Bronze";
  return null;
}

function badgeStyle(level: BadgeLevel): string {
  if (level === "Or") return "bg-yellow-100 text-yellow-900 border-yellow-300";
  if (level === "Argent") {
    return "bg-slate-100 text-slate-800 border-slate-300";
  }
  if (level === "Bronze") return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-muted text-[#6f6758] border-dashed";
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
<div className="min-h-screen bg-[#8f9785] p-3 sm:p-6 md:p-8 pb-24">
  <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#c9bfa8] bg-[#f4ecd8] p-4 sm:p-6 md:p-8 space-y-6 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#6f6758]">
              CytoDex
            </p>
            <h2 className="text-3xl font-bold mt-2">Thèmes des fiches</h2>
            <p className="text-[#6f6758] mt-2">
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
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6f6758]">
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
                    <p className="text-[#6f6758]">Fiches trouvées</p>
                    <p className="text-xl font-semibold mt-1">
                      {found} / {total}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border">
                    <p className="text-[#6f6758]">Fiches complétées</p>
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
                onClick={() => startCamera()}
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
      <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
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

        <CardContent className="p-5 space-y-4">
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
                className="rounded-2xl min-h-11"
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
                  className="rounded-2xl overflow-hidden border bg-slate-50"
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
<div className="min-h-screen bg-[#8f9785] p-3 sm:p-6 md:p-8 pb-24">
  <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#c9bfa8] bg-[#f4ecd8] p-4 sm:p-6 md:p-8 space-y-6 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#6f6758]">
              CytoDex
            </p>
            <h2 className="text-3xl font-bold mt-2">{category}</h2>
            <p className="text-[#6f6758] mt-2">
              Sélectionner une fiche pour l’ouvrir.
            </p>
          </div>

          <Button variant="outline" className="rounded-2xl" onClick={onBack}>
            Retour aux thèmes
          </Button>
        </div>

        <Card className="rounded-[1.5rem] sm:rounded-[2rem]">
          <CardContent className="p-6 space-y-3">
            {filteredCards.length === 0 ? (
              <p className="text-[#6f6758]">Aucune fiche dans cette catégorie.</p>
            ) : (
              filteredCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onOpenCard(card.id)}
                  className="w-full text-left rounded-2xl border bg-white p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{card.title}</p>
                      <p className="text-sm text-[#6f6758] mt-1">
                        {card.completed
                          ? "✅ Complétée"
                          : card.found
                          ? "📷 Trouvée"
                          : "🔒 Non trouvée"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#6f6758]" />
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
<div className="min-h-screen bg-[#8f9785] p-3 sm:p-6 md:p-8 pb-24">
  <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#c9bfa8] bg-[#f4ecd8] p-4 sm:p-6 md:p-8 space-y-6 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <Button variant="outline" className="rounded-2xl" onClick={onBack}>
          Retour à la liste des fiches
        </Button>

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
          <Card className="rounded-[1.5rem] sm:rounded-[2rem]">
            <CardContent className="p-8 text-center text-[#6f6758]">
              Fiche introuvable.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
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
      setCards(userCards);
      setScreen("home");
    } catch (error: any) {
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
