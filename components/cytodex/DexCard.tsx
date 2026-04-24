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
        <Card className="overflow-hidden rounded-[30px] border border-[#86e7ff]/16 bg-[linear-gradient(180deg,rgba(10,24,38,0.94),rgba(8,19,31,0.94))] text-[#eafcff] shadow-[0_22px_54px_rgba(1,7,15,0.34)]">
          <div className="relative flex aspect-[4/3] items-center justify-center border-b border-[#86e7ff]/12 bg-[linear-gradient(135deg,#09131f_0%,#143049_58%,#1e4a69_100%)]">
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(134,231,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="pointer-events-none absolute left-8 top-8 h-16 w-16 rounded-full bg-[#ffd166]/18 blur-xl" />
            <div className="pointer-events-none absolute right-8 bottom-8 h-20 w-20 rounded-full bg-[#86e7ff]/18 blur-2xl" />

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#86e7ff]/24 bg-[#09131f]/58 shadow-[0_12px_30px_rgba(1,8,18,0.26)]">
                <Lock className="h-8 w-8" />
              </div>
              <p className="font-semibold">Fiche non detectee</p>
              <p className="mt-2 text-sm text-[#a6c8d5]">
                La console s&apos;ouvre apres acquisition d&apos;une photo prise en direct.
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
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9fe9ff]">
                Echantillon
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{card.title}</h3>
            </div>
            <div className="rounded-[22px] border border-dashed border-[#86e7ff]/22 bg-[linear-gradient(180deg,rgba(11,24,38,0.9),rgba(8,19,31,0.9))] p-4 text-sm text-[#a6c8d5]">
              Champs verrouilles jusqu&apos;a validation d&apos;une image acquise en direct.
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
      <Card className="overflow-hidden rounded-[30px] border border-[#86e7ff]/16 bg-[linear-gradient(180deg,rgba(10,24,38,0.94),rgba(8,19,31,0.94))] shadow-[0_22px_54px_rgba(1,7,15,0.34)]">
        <div className="relative aspect-[4/3] overflow-hidden border-b border-[#86e7ff]/12 bg-[linear-gradient(135deg,#09131f_0%,#143049_58%,#1e4a69_100%)]">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(134,231,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
          {signedImageUrls[0] ? (
            <button
              type="button"
              onClick={() => openFullscreenImage(signedImageUrls[0])}
              className="relative h-full w-full"
            >
              <img
                src={signedImageUrls[0]}
                alt={card.title}
                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(3,8,16,0.7))]" />
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#a6c8d5]">
              Aucune image
            </div>
          )}
        </div>

        <CardContent className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9fe9ff]">
                Echantillon
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{card.title}</h3>
              <p className="mt-1 text-sm text-[#a6c8d5]">{card.category}</p>
            </div>

            {card.completed ? (
              <Badge className="rounded-full border border-[#86e7ff]/24 bg-[linear-gradient(180deg,rgba(14,62,74,0.96),rgba(8,28,37,0.96))] px-3 py-1.5 text-sm text-[#b5f5ff]">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Completee
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full border border-[#ffd166]/24 bg-[linear-gradient(180deg,rgba(63,45,18,0.96),rgba(27,20,10,0.96))] px-3 py-1.5 text-sm text-[#ffe7ad]"
              >
                A completer
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium text-[#eafcff]">
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
                  className="overflow-hidden rounded-[24px] border border-[#86e7ff]/16 bg-[linear-gradient(180deg,rgba(11,24,38,0.94),rgba(8,19,31,0.94))] shadow-[0_14px_30px_rgba(1,8,18,0.22)]"
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
            <label className="text-sm font-medium text-[#eafcff]">
              Caracteristiques de l&apos;anomalie
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-[22px] border border-[#86e7ff]/18 bg-[linear-gradient(180deg,rgba(10,24,38,0.96),rgba(8,19,31,0.96))] p-4 text-base text-[#eafcff] outline-none ring-0 transition placeholder:text-[#7594a1] focus:border-[#ffd166]/40 focus:shadow-[0_0_0_4px_rgba(255,209,102,0.12)]"
              value={characteristics}
              onChange={(e) => setCharacteristics(e.target.value)}
              placeholder="Decrire les caracteristiques morphologiques..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#eafcff]">
              Pathologies associees
            </label>
            <textarea
              className="min-h-[110px] w-full rounded-[22px] border border-[#86e7ff]/18 bg-[linear-gradient(180deg,rgba(10,24,38,0.96),rgba(8,19,31,0.96))] p-4 text-base text-[#eafcff] outline-none ring-0 transition placeholder:text-[#7594a1] focus:border-[#86e7ff]/42 focus:shadow-[0_0_0_4px_rgba(134,231,255,0.12)]"
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
