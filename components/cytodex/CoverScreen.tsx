"use client";

import { useEffect, useRef } from "react";
import { Power } from "lucide-react";
import { Press_Start_2P } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
});

type CoverMode = "menu" | "login" | "signup";

type CoverScreenProps = {
  email: string;
  password: string;
  loading: boolean;
  mode: CoverMode;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => Promise<void>;
  onSignup: () => Promise<void>;
  onSetMode: (mode: CoverMode) => void;
};

function PixelButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border-2 border-[#44503b] bg-[#dce6c4] px-3 py-3 text-left text-[10px] leading-relaxed text-[#263021] shadow-[2px_2px_0_#55614b] transition hover:translate-y-[1px] hover:shadow-[1px_1px_0_#55614b] active:translate-y-[2px] active:shadow-none sm:text-xs"
    >
      {children}
    </button>
  );
}

export default function CoverScreen({
  email,
  password,
  loading,
  mode,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onSignup,
  onSetMode,
}: CoverScreenProps) {

  /* =======================
     AUDIO REFS
  ======================= */

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);

  const playClick = () => {
    const audio = clickRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0.25;
    audio.play().catch(() => {});
  };

  /* =======================
     BACKGROUND MUSIC
  ======================= */

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    music.volume = 0.12;
    music.loop = true;

    const start = () => {
      music.play().catch(() => {});
      window.removeEventListener("pointerdown", start);
    };

    window.addEventListener("pointerdown", start);

    return () => {
      music.pause();
      window.removeEventListener("pointerdown", start);
    };
  }, []);

  /* =======================
     JSX
  ======================= */

  return (
    <>
      {/* AUDIO */}
      <audio ref={musicRef} src="/sounds/menu-loop.wav" preload="auto" loop />
      <audio ref={clickRef} src="/sounds/menu-bouton.wav" preload="auto" />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#5a1318,_#151722_68%)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="w-full max-w-[560px]">

          <div className="relative rounded-[2.8rem] border-[8px] border-[#c9c2b6] bg-[#ddd5c8] px-5 pt-5 pb-10 shadow-[0_32px_80px_rgba(0,0,0,0.45)] sm:px-8 sm:pt-7 sm:pb-12">

            {/* POWER LED */}
            <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#ff8f8f]">
              <Power className="h-3.5 w-3.5 text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.9)]" />
              ON
            </div>

            {/* SCREEN */}
            <div className="rounded-[1.9rem] border-[6px] border-[#979087] bg-[#8f9785] p-4">
              <div className="relative rounded-[1.1rem] border border-[#5c6654] bg-[linear-gradient(180deg,#d6ef85,#bcd365)] px-4 py-5 min-h-[330px]">

                {/* vignettage écran */}
                <div className="absolute inset-0 pointer-events-none rounded-[1.1rem] bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.22))]" />

                <div className={`${pixelFont.className} h-full flex flex-col justify-between text-[#263021]`}>

                  {mode === "menu" && (
                    <div className="space-y-3">
                      <PixelButton
                        onClick={() => {
                          playClick();
                          onSetMode("login");
                        }}
                      >
                        {">"} M'IDENTIFIER
                      </PixelButton>

                      <PixelButton
                        onClick={() => {
                          playClick();
                          onSetMode("signup");
                        }}
                      >
                        {">"} INITIALISER MON CYTODEX
                      </PixelButton>
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="space-y-3">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="EMAIL"
                      />

                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        placeholder="PASSWORD"
                      />

                      <Button
                        onClick={() => {
                          playClick();
                          onLogin();
                        }}
                      >
                        VALIDER
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          playClick();
                          onSetMode("menu");
                        }}
                      >
                        RETOUR
                      </Button>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="space-y-3">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="EMAIL"
                      />

                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        placeholder="PASSWORD"
                      />

                      <Button
                        onClick={() => {
                          playClick();
                          onSignup();
                        }}
                      >
                        VALIDER
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          playClick();
                          onSetMode("menu");
                        }}
                      >
                        RETOUR
                      </Button>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}