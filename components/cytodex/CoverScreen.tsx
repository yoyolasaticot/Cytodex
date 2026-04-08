"use client";

import { Eye, EyeOff, Power } from "lucide-react";
import { Press_Start_2P } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";


const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
});



type CoverMode = "menu" | "login" | "signup";

type CoverScreenProps = {
  email: string;
  password: string;
  username: string;
  avatarKey: string;
  loading: boolean;
  mode: CoverMode;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onAvatarChange: (value: string) => void;
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
      className="w-full border-2 border-[#44503b] bg-[#dce6c4] px-3 py-3 text-left text-[10px] leading-relaxed text-[#263021] shadow-[0_6px_0_#2a3325,0_10px_15px_rgba(0,0,0,0.35)] transform transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_8px_0_#2a3325,0_12px_18px_rgba(0,0,0,0.45)] active:translate-y-[2px] active:shadow-[0_2px_0_#2a3325,0_4px_6px_rgba(0,0,0,0.35)] sm:text-xs"
      style={{ perspective: "600px" }}
    >
      <span className="block transform-gpu transition-transform duration-150 hover:rotate-x-1 hover:rotate-y-1 active:translate-y-0.5">
        {children}
      </span>
    </button>
  );
}

export default function CoverScreen({
  email,
  password,
  username,
  avatarKey,
  loading,
  mode,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onAvatarChange,
  onLogin,
  onSignup,
  onSetMode,
}: CoverScreenProps) {const musicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const playClick = () => {
    const audio = clickRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0.25;
    audio.play().catch(() => {});
  };

  const startMusic = () => {
    if (hasStartedRef.current) return;

    const music = musicRef.current;
    if (!music) return;

    music.volume = 0.5;
    music.loop = true;
    music.play().catch(() => {});
    hasStartedRef.current = true;
  };

  const handleSignupClick = async () => {
  playClick();

  if (!password.trim() || !confirmPassword.trim()) {
    setSignupError("Les deux champs mot de passe sont requis.");
    return;
  }

  if (password !== confirmPassword) {
    setSignupError("Les mots de passe ne correspondent pas.");
    return;
  }

  setSignupError("");
  await onSignup();
};

const avatars = [
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4",
];

const currentIndex = Math.max(
  0,
  avatars.findIndex((a) => a === avatarKey)
);

const goPrevAvatar = () => {
  const prev =
    currentIndex === 0 ? avatars.length - 1 : currentIndex - 1;
  onAvatarChange(avatars[prev]);
};

const goNextAvatar = () => {
  const next =
    currentIndex === avatars.length - 1 ? 0 : currentIndex + 1;
  onAvatarChange(avatars[next]);
};

const goToMenu = () => {
  playClick();
  setSignupError("");
  setConfirmPassword("");
  onSetMode("menu");
};

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
    };
  }, []);
  return (  
  <>
    <audio ref={musicRef} src="/sounds/menu-loop.wav" preload="auto" loop />
    <audio ref={clickRef} src="/sounds/menu-bouton.wav" preload="auto" />
    <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle_at_top,_#c42828,_#101925_55%)] flex items-center justify-center p-0 overflow-hidden">
      <div className="relative w-full flex items-center justify-center"> 
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <style jsx global>{`
          @keyframes pulseRed {
            0%,100% {
              opacity: 1;
              filter: brightness(1.2);
            }
            50% {
              opacity: 0.35;
              filter: brightness(0.6);
            }
          }
        `}</style>

        <div className="w-screen h-screen">
          <div className="relative w-full h-full bg-[radial-gradient(circle_at_top,_#faf5e7,_#d5e3c2_80%)] px-6 pt-6 pb-10">
            <div className="absolute right-6 top-4 text-[9px] uppercase tracking-[0.28em] text-[#6e665e] sm:right-8 sm:top-5 sm:text-[10px]">
              Portable Morphology System
            </div>

            <div
              className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#ff8f8f] sm:mb-5 sm:text-[11px]"
              style={{ animation: "pulseRed 2.5s ease-in-out infinite" }}
            >
              <div className="relative flex items-center justify-center">
                {/* HALO */}
                <span className="absolute w-4 h-4 rounded-full bg-red-500 blur-md opacity-70" />

                {/* LED */}
                <Power className="h-3.5 w-3.5 text-red-500 drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]" />
             </div>

            On
          </div>
            <div className="rounded-[1.9rem] border-[6px] border-[#979087] bg-[#8f9785] p-4 shadow-inner sm:p-5">
              <div className="relative rounded-[1.1rem] border border-[#5c6654] bg-[linear-gradient(180deg,#d6ef85,#8fb319)] px-4 py-5 min-h-[450px] shadow-[inset_0_0_0_2px_rgba(74,84,66,0.15)] sm:min-h-[380px] sm:px-5 sm:py-6">
                <div className="absolute inset-0 pointer-events-none rounded-[1.1rem] bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.22))]" />
                <div
                  className={`${pixelFont.className} h-full flex flex-col justify-center text-[#263021]`}
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
                        <div className="mb-3 animate-pulse">PRESS TO START</div>
                      </div>

                      <PixelButton
  onClick={() => {
    startMusic();
    playClick();
    onSetMode("login");
  }}
>
                        {">"} IDENTIFICATION
                      </PixelButton>

                      <PixelButton onClick={() => {
  playClick();
  onSetMode("signup");
}}>
                        {">"} INITIALISATION
                        <br />
                        DU CYTODEX
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
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            placeholder="MOT DE PASSE"
                            className="pr-12 h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
                          />
                        <button
                          type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44503b]"
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => {
  playClick();
  onLogin();
}}
                          disabled={loading}
                          className="rounded-none border-2 border-[#2b3526] bg-[#384331] text-[10px] uppercase text-[#edf5df] shadow-[2px_2px_0_#20281c] hover:bg-[#303a2a] sm:text-xs"
                        >
                          {loading ? "..." : "VALIDER"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
  playClick();
  onSetMode("menu");
}}
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
        className="h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
      />

      <Input
        type="text"
        placeholder="NOM DE MICROSCOPEUR"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        className="h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
      />

  <div className="relative">
    <Input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => onPasswordChange(e.target.value)}
      placeholder="MOT DE PASSE"
      className="pr-12 h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
    />
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44503b]"
      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>

  <div className="relative">
    <Input
      type={showConfirmPassword ? "text" : "password"}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="CONFIRMER LE MDP"
      className="pr-12 h-11 rounded-none border-2 border-[#44503b] bg-[#dde6c8] px-3 text-[10px] text-[#263021] placeholder:text-[#5f6c57] shadow-[2px_2px_0_#55614b] sm:text-xs"
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44503b]"
      aria-label={
        showConfirmPassword
          ? "Masquer la confirmation du mot de passe"
          : "Afficher la confirmation du mot de passe"
      }
    >
      {showConfirmPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  </div>

  {signupError && (
    <p className="text-[9px] leading-relaxed text-red-700 sm:text-[10px]">
      {signupError}
    </p>
  )}
</div>

<div className="space-y-2">
  <p className="text-[8px] sm:text-[9px] text-[#263021]">
    CHOISIR UN AVATAR
  </p>

  <div className="flex items-center justify-center gap-3">
    <Button
      type="button"
      variant="outline"
      onClick={goPrevAvatar}
      className="h-12 w-12 rounded-xl"
    >
      ◀
    </Button>

    <div className="rounded-2xl border-2 border-[#44503b] bg-[#dce6c4] p-3">
      <img
        src={`/Avatars/${avatarKey}.png`}
        alt="avatar"
        className="h-28 w-28 object-contain"
      />
    </div>

    <Button
      type="button"
      variant="outline"
      onClick={goNextAvatar}
      className="h-12 w-12 rounded-xl"
    >
      ▶
    </Button>
  </div>
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
    <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-[#b43746] via-[#8f2632] to-[#5e1620] border border-black/20 shadow-[0_8px_14px_rgba(0,0,0,0.35),inset_2px_2px_5px_rgba(255,255,255,0.2),inset_-6px_-8px_10px_rgba(0,0,0,0.28)]">
      <div className="absolute left-[18%] top-[16%] h-3.5 w-3.5 rounded-full bg-white/20 blur-[1px]" />
    </div>
    <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-[#8a42a0] via-[#6a257a] to-[#43164f] border border-black/20 shadow-[0_8px_14px_rgba(0,0,0,0.35),inset_2px_2px_5px_rgba(255,255,255,0.2),inset_-6px_-8px_10px_rgba(0,0,0,0.28)]">
      <div className="absolute left-[18%] top-[16%] h-3.5 w-3.5 rounded-full bg-white/20 blur-[1px]" />
    </div>
  </div>
</div>

<div className="mt-6 flex items-center justify-between">
  <div className="relative h-20 w-20">
    <div className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 rounded-md bg-gradient-to-b from-[#7a746d] via-[#59544d] to-[#3d3934] border border-black/25 shadow-[0_8px_10px_rgba(0,0,0,0.28),inset_1px_1px_2px_rgba(255,255,255,0.18),inset_-2px_-3px_4px_rgba(0,0,0,0.25)]" />
    <div className="absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 rounded-md bg-gradient-to-r from-[#7a746d] via-[#59544d] to-[#3d3934] border border-black/25 shadow-[0_8px_10px_rgba(0,0,0,0.28),inset_1px_1px_2px_rgba(255,255,255,0.18),inset_-2px_-3px_4px_rgba(0,0,0,0.25)]" />
    <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#47433d] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.12),inset_-2px_-2px_3px_rgba(0,0,0,0.25)]" />
  </div>

  <div className="flex gap-5 pr-2">
    <div className="h-3.5 w-16 rounded-full -rotate-12 bg-gradient-to-b from-[#9b948d] via-[#7b7570] to-[#57524d] border border-black/20 shadow-[0_5px_8px_rgba(0,0,0,0.25),inset_1px_1px_2px_rgba(255,255,255,0.18),inset_-2px_-2px_3px_rgba(0,0,0,0.2)]" />
    <div className="h-3.5 w-16 rounded-full -rotate-12 bg-gradient-to-b from-[#9b948d] via-[#7b7570] to-[#57524d] border border-black/20 shadow-[0_5px_8px_rgba(0,0,0,0.25),inset_1px_1px_2px_rgba(255,255,255,0.18),inset_-2px_-2px_3px_rgba(0,0,0,0.2)]" />
  </div>
</div>
          </div>
        </div>
      </div>
        </div>
  </>
  );
}
