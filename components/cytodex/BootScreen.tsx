"use client";

type BootScreenProps = {
  username?: string | null;
  avatarKey?: string | null;
};

export default function BootScreen({ username, avatarKey }: BootScreenProps) {
  const welcomeLabel = username?.trim() ? `Bienvenue ${username}` : "Bienvenue";
  const avatarSrc = `/Avatars/${avatarKey || "avatar-1"}.png`;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#18456a_0%,#09131f_42%,#040912_100%)] px-4 py-6 text-[#eafcff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,231,255,0.22),transparent_32%),radial-gradient(circle_at_80%_24%,rgba(255,209,102,0.12),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(134,231,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(134,231,255,0.18)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#86e7ff]/18 bg-[linear-gradient(180deg,rgba(8,19,31,0.9),rgba(9,25,40,0.96))] px-6 py-8 shadow-[0_0_0_1px_rgba(134,231,255,0.08),0_24px_64px_rgba(1,7,15,0.42)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_80%,rgba(134,231,255,0.05)_100%)]" />
        <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-[linear-gradient(90deg,transparent,rgba(134,231,255,0.42),transparent)]" />
        <div className="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-[linear-gradient(90deg,transparent,rgba(255,209,102,0.28),transparent)]" />

        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fe9ff]">
            Initialisation du systeme
          </p>
          <div className="mt-4 grid items-center gap-6 sm:grid-cols-[1fr_auto] sm:gap-8">
            <div>
              <h1 className="font-heading text-3xl leading-snug text-white sm:text-4xl">
                {welcomeLabel}
                <br />
                <span className="text-[#9fe9ff]">sur votre CytoDex</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b6d6e1] sm:text-base">
                Synchronisation des fiches, preparation des modules d&apos;observation
                et activation de l&apos;interface technologique.
              </p>
            </div>

            <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
              <div className="absolute inset-x-5 bottom-1 h-4 rounded-full bg-black/36 blur-md" />
              <div className="boot-dance relative flex h-full w-full items-center justify-center rounded-[28px] border border-[#86e7ff]/18 bg-[linear-gradient(180deg,rgba(13,37,58,0.9),rgba(7,19,31,0.96))] shadow-[0_18px_34px_rgba(1,7,15,0.32),0_0_28px_rgba(134,231,255,0.14)]">
                <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-[#ffd166]/14" />
                <img
                  src={avatarSrc}
                  alt="Avatar en chargement"
                  className="boot-dance-avatar h-24 w-24 object-contain sm:h-32 sm:w-32"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.22em] text-[#9fe9ff]">
              <span>Chargement en cours</span>
              <span className="animate-pulse text-[#ffd166]">stand-by actif</span>
            </div>

            <div className="overflow-hidden rounded-full border border-[#86e7ff]/18 bg-[#07131f]/80 p-1">
              <div className="h-3 rounded-full bg-[linear-gradient(90deg,#86e7ff_0%,#9fe9ff_38%,#ffd166_72%,#86e7ff_100%)] shadow-[0_0_18px_rgba(134,231,255,0.28)] boot-progress" />
            </div>

            <div className="grid gap-3 text-sm text-[#c6e6f1] sm:grid-cols-3">
              <div className="rounded-[18px] border border-[#86e7ff]/12 bg-[#0a1927]/70 px-4 py-3">
                Modules visuels
              </div>
              <div className="rounded-[18px] border border-[#86e7ff]/12 bg-[#0a1927]/70 px-4 py-3">
                Atlas personnel
              </div>
              <div className="rounded-[18px] border border-[#ffd166]/12 bg-[#1b160d]/60 px-4 py-3">
                Console du labo
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .boot-progress {
          width: 32%;
          animation: cytodex-boot-progress 1.8s ease-in-out infinite;
        }

        .boot-dance {
          transform-origin: center bottom;
          animation: cytodex-avatar-dance 0.86s ease-in-out infinite;
        }

        .boot-dance-avatar {
          transform-origin: center bottom;
          animation: cytodex-avatar-bounce 0.43s ease-in-out infinite;
        }

        @keyframes cytodex-avatar-dance {
          0%,
          100% {
            transform: translateY(0) rotate(-5deg);
          }
          25% {
            transform: translateY(-8px) rotate(4deg);
          }
          50% {
            transform: translateY(0) rotate(6deg);
          }
          75% {
            transform: translateY(-7px) rotate(-4deg);
          }
        }

        @keyframes cytodex-avatar-bounce {
          0%,
          100% {
            transform: scaleX(1.03) scaleY(0.98);
          }
          50% {
            transform: scaleX(0.96) scaleY(1.06);
          }
        }

        @keyframes cytodex-boot-progress {
          0% {
            width: 18%;
            transform: translateX(-8%);
          }
          55% {
            width: 76%;
            transform: translateX(18%);
          }
          100% {
            width: 28%;
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  );
}
