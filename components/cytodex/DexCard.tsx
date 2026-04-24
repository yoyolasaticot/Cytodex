"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Camera, Lock, RefreshCw, Trash2, X } from "lucide-react";
import { CytodexCard } from "@/lib/cards";
import { getCardImageUrl } from "@/lib/card-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  largePrimaryButtonClassName,
  primaryButtonClassName,
} from "@/components/cytodex/ScreenFrame";
import { CardUpdate } from "@/components/cytodex/dexTypes";

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

export default function DexCard({
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
      const urls = await Promise.all(card.images.map((img) => getCardImageUrl(img)));
      if (!isCancelled) {
        setSignedImageUrls(urls.filter(Boolean));
      }
    };

    void loadUrls();

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
        card.images.length > 0 && characteristics.trim() && pathologies.trim()
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
      alert("Erreur d'acces a la camera : " + String(err));
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
          void onReplacePhoto(card.id, replacingIndex, fileList);
        } else {
          void onAddPhotos(card.id, fileList);
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
        <Card className="overflow-hidden rounded-[30px] border border-[#1f1f24]/10 bg-white/92 text-[#1f1f24] shadow-[0_22px_54px_rgba(31,31,36,0.1)]">
          <div className="relative flex aspect-[4/3] items-center justify-center border-b border-[#1f1f24]/8 bg-[linear-gradient(135deg,#fff7ea_0%,#eef5ff_65%,#ffe1d7_100%)]">
            <div className="pointer-events-none absolute left-8 top-8 h-16 w-16 rounded-full bg-[#ffd66b]/40 blur-xl" />
            <div className="pointer-events-none absolute right-8 bottom-8 h-20 w-20 rounded-full bg-[#7aa2ff]/25 blur-2xl" />

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#1f1f24]/10 bg-white/70 shadow-[0_12px_30px_rgba(31,31,36,0.08)]">
                <Lock className="h-8 w-8" />
              </div>
              <p className="font-semibold">Fiche non trouvee</p>
              <p className="mt-2 text-sm text-[#5f6472]">
                La fiche se debloque uniquement apres une photo prise en direct.
              </p>

              <Button
                className={`mt-4 w-full sm:w-auto ${largePrimaryButtonClassName}`}
                onClick={() => void startCamera()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Prendre une photo
              </Button>
            </div>
          </div>

          <CardContent className="space-y-3 p-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#5f6472]">
                Anomalie
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{card.title}</h3>
            </div>
            <div className="rounded-[22px] border border-dashed border-[#1f1f24]/15 bg-[linear-gradient(180deg,#fff7ea,#fffdf8)] p-4 text-sm text-[#5f6472]">
              Champs verrouilles jusqu&apos;a validation d&apos;une image prise en direct.
            </div>
          </CardContent>
        </Card>

        {isCapturing && (
          <div className="fixed inset-0 z-[9999] flex h-screen flex-col bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full flex-1 object-cover"
            />
            <div className="absolute right-0 bottom-0 left-0 z-[10000] flex justify-between gap-2 bg-black/70 p-4">
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
      <Card className="overflow-hidden rounded-[30px] border border-[#1f1f24]/10 bg-white/92 shadow-[0_22px_54px_rgba(31,31,36,0.1)]">
        <div className="aspect-[4/3] overflow-hidden border-b border-[#1f1f24]/8 bg-[linear-gradient(135deg,#fff7ea_0%,#eef5ff_65%,#ffe1d7_100%)]">
          {signedImageUrls[0] ? (
            <button
              type="button"
              onClick={() => openFullscreenImage(signedImageUrls[0])}
              className="h-full w-full"
            >
              <img
                src={signedImageUrls[0]}
                alt={card.title}
                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
              />
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#5f6472]">
              Aucune image
            </div>
          )}
        </div>

        <CardContent className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#5f6472]">
                Anomalie
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-[#5f6472]">{card.category}</p>
            </div>

            {card.completed ? (
              <Badge className="rounded-full border border-[#1f1f24]/10 bg-[#dff1d7] px-3 py-1.5 text-sm text-[#23431b]">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Completee
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full border border-[#1f1f24]/10 bg-[#fff6dd] px-3 py-1.5 text-sm text-[#6f5612]"
              >
                A completer
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium">
                Photographies prises en direct
              </label>

              <Button
                type="button"
                variant="outline"
                className={primaryButtonClassName}
                onClick={() => void startCamera()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Ajouter des photos
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {signedImageUrls.map((imageUrl, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="overflow-hidden rounded-[24px] border border-[#1f1f24]/10 bg-[linear-gradient(180deg,#fff9ee,#ffffff)] shadow-[0_14px_30px_rgba(31,31,36,0.06)]"
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
                        className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                      />
                    </button>
                  </div>

                  <div className="space-y-2 p-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={primaryButtonClassName}
                      onClick={() => void startCamera(index)}
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
              Caracteristiques de l&apos;anomalie
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-[22px] border border-[#1f1f24]/12 bg-white/90 p-4 text-base outline-none ring-0 transition focus:border-[#ff7a59] focus:shadow-[0_0_0_4px_rgba(255,122,89,0.12)]"
              value={characteristics}
              onChange={(e) => setCharacteristics(e.target.value)}
              placeholder="Decrire les caracteristiques morphologiques..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pathologies associees</label>
            <textarea
              className="min-h-[110px] w-full rounded-[22px] border border-[#1f1f24]/12 bg-white/90 p-4 text-base outline-none ring-0 transition focus:border-[#7aa2ff] focus:shadow-[0_0_0_4px_rgba(122,162,255,0.14)]"
              value={pathologies}
              onChange={(e) => setPathologies(e.target.value)}
              placeholder="Renseigner les pathologies dans lesquelles cette anomalie est rencontree..."
            />
          </div>

          <Button className={`w-full ${largePrimaryButtonClassName}`} onClick={saveForm}>
            Enregistrer la fiche
          </Button>
        </CardContent>
      </Card>

      {isCapturing && (
        <div className="fixed inset-0 z-[9999] flex h-screen flex-col bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full flex-1 object-cover"
          />
          <div className="absolute right-0 bottom-0 left-0 z-[10000] flex justify-between gap-2 bg-black/70 p-4">
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
        <div className="fixed inset-0 z-[10000] flex flex-col bg-black">
          <div className="flex items-center justify-between gap-3 bg-black/80 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeFullscreenImage}
              className="bg-white text-black hover:bg-gray-200"
            >
              Retour
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{Math.round(zoomLevel * 100)}%</span>

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
            className="flex flex-1 items-center justify-center overflow-hidden bg-black"
            style={{ touchAction: "none" }}
            onTouchStart={handleViewerTouchStart}
            onTouchMove={handleViewerTouchMove}
            onTouchEnd={handleViewerTouchEnd}
          >
            <img
              src={fullscreenImage}
              alt="Image en plein ecran"
              draggable={false}
              className="max-h-full max-w-full select-none transition-transform duration-75"
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
