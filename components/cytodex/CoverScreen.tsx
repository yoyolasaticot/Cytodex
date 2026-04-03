"use client";

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
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#5a1318,_#151722_68%)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-6xl flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />

        <div className="w-full max-w-[560px]">
          <div className="relative rounded-[2.8rem] border-[8px] border-[#c9c2b6] bg-[#ddd5c8] px-5 pt-5 pb-10 shadow-[0_32px_80px_rgba(0,0,0,0.45)] sm:px-8 sm:pt-7 sm:pb-12">
            <div className="absolute right-6 top-4 text-[9px] uppercase tracking-[0.28em] text-[#6e665e] sm:right-8 sm:top-5 sm:text-[10px]">
              Portable Morphology System
            </div>

            <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#5a524b] sm:mb-5 sm:text-[11px]">
              <Power className="h-3.5 w-3.5 text-red-700" />
              On
            </div>

            <div className="rounded-[1.9rem] border-[6px] border-[#979087] bg-[#8f9785] p-4 shadow-inner sm:p-5">
              <div className="rounded-[1.1rem] border border-[#5c6654] bg-[#b7c39d] px-4 py-5 min-h-[330px] shadow-[inset_0_0_0_2px_rgba(74,84,66,0.15)] sm:min-h-[380px] sm:px-5 sm:py-6">
                <div
                  className={`${pixelFont.className} h-full flex flex-col justify-between text-[#263021]`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[8px] leading-relaxed sm:text-[9px]">
                      <span>CYTODEX OS</span>
                      <span>v1.0</span>
                    </div>

                    <div className="mt-6 border-b-2 border-dashed border-[#6d775f] pb-4">
                      <p className="text-[14px] leading-relaxed sm:text-[16px]">
                        CYTODEX
                      </p>
                      <p className="mt-3 text-[8px] leading-[1.8] sm:text-[9px]">
                        ATLAS PERSONNEL
                        <br />
                        DES ANOMALIES
                        <br />
                        CYTOLOGIQUES
                      </p>
                    </div>
                  </div>

                  {mode === "menu" && (
                    <div className="space-y-3">
                      <div className="text-[8px] leading-[1.9] sm:text-[9px]">
                        <div className="mb-3 animate-pulse">PRESS START</div>
                      </div>

                      <PixelButton onClick={() => onSetMode("login")}>
                        {">"} M&apos;IDENTIFIER
                      </PixelButton>

                      <PixelButton onClick={() => onSetMode("signup")}>
                        {">"} INITIALISER
                        <br />
                        MON CYTODEX
                      </PixelButton>

                      <div className="pt-2 text-[8px] leading-[1.8] text-[#33402c]/90 sm:text-[9px]">
                        <span className="inline-block animate-pulse">▸</span>{" "}
                        READY
                      </div>
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="space-y-4">
                      <div className="text-[8px] leading-[1.9] sm:text-[9px]">
                        <div>{">"} IDENTIFICATION</div>
                        <div className="mt-2 text-[#33402c]/85">
                          REPRENDRE
                          <br />
                          UNE PARTIE
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="EMAIL"
                          value={email}
                          onChange={(e) => onEmailChange(e.target.value)}
                          className="h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] uppercase text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
                        />
                        <Input
                          type="password"
                          placeholder="PASSWORD"
                          value={password}
                          onChange={(e) => onPasswordChange(e.target.value)}
                          className="h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] uppercase text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={onLogin}
                          disabled={loading}
                          className="rounded-none border-2 border-[#2b3526] bg-[#384331] text-[10px] uppercase text-[#edf5df] shadow-[2px_2px_0_#20281c] hover:bg-[#303a2a] sm:text-xs"
                        >
                          {loading ? "..." : "VALIDER"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onSetMode("menu")}
                          className="rounded-none border-2 border-[#44503b] bg-[#dce6c4] text-[10px] uppercase text-[#263021] shadow-[2px_2px_0_#55614b] hover:bg-[#e3ebd1] sm:text-xs"
                        >
                          RETOUR
                        </Button>
                      </div>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="space-y-4">
                      <div className="text-[8px] leading-[1.9] sm:text-[9px]">
                        <div>{">"} INITIALISATION</div>
                        <div className="mt-2 text-[#33402c]/85">
                          CREER
                          <br />
                          UN CYTODEX
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="EMAIL"
                          value={email}
                          onChange={(e) => onEmailChange(e.target.value)}
                          className="h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] uppercase text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
                        />
                        <Input
                          type="password"
                          placeholder="PASSWORD"
                          value={password}
                          onChange={(e) => onPasswordChange(e.target.value)}
                          className="h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] uppercase text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={onSignup}
                          disabled={loading}
                          className="rounded-none border-2 border-[#2b3526] bg-[#384331] text-[10px] uppercase text-[#edf5df] shadow-[2px_2px_0_#20281c] hover:bg-[#303a2a] sm:text-xs"
                        >
                          {loading ? "..." : "VALIDER"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onSetMode("menu")}
                          className="rounded-none border-2 border-[#44503b] bg-[#dce6c4] text-[10px] uppercase text-[#263021] shadow-[2px_2px_0_#55614b] hover:bg-[#e3ebd1] sm:text-xs"
                        >
                          RETOUR
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[28px] font-black italic tracking-[0.18em] text-[#4d4750] sm:text-[34px]">
                  CYTODEX
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#6a645d] sm:text-[11px]">
                  Hematology Collection System
                </p>
              </div>

              <div className="mb-1 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full border border-black/10 bg-[#8f2632] shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.2),inset_4px_4px_10px_rgba(255,255,255,0.15)]" />
                <div className="h-14 w-14 rounded-full border border-black/10 bg-[#6a257a] shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.2),inset_4px_4px_10px_rgba(255,255,255,0.15)]" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="relative h-20 w-20">
                <div className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 rounded-md bg-[#59544d]" />
                <div className="absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 rounded-md bg-[#59544d]" />
              </div>

              <div className="flex gap-5 pr-2">
                <div className="h-3 w-16 rounded-full bg-[#7b7570] -rotate-12" />
                <div className="h-3 w-16 rounded-full bg-[#7b7570] -rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}