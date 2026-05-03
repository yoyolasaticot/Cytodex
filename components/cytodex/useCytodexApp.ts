"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  loginWithEmail,
  logoutUser,
  signupWithEmail,
  validateCredentials,
  validateProfile,
} from "@/lib/auth";
import { CytodexCard, loadCards, saveCard } from "@/lib/cards";
import { uploadCardImages } from "@/lib/card-images";
import { supabase } from "@/lib/supabase";
import { CardUpdate } from "@/components/cytodex/dexTypes";

export type Screen = "cover" | "home" | "categories" | "card_list" | "card_detail";

export type UserProfile = {
  username: string;
  avatar_key: string;
};

function persistUpdatedCard(updatedCard: CytodexCard) {
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

export function useCytodexApp() {
  const [screen, setScreen] = useState<Screen>("cover");
  const [isBooting, setIsBooting] = useState(false);
  const [cards, setCards] = useState<CytodexCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarKey, setAvatarKey] = useState("avatar-1");
  const [authLoading, setAuthLoading] = useState(false);
  const [coverMode, setCoverMode] = useState<"menu" | "login" | "signup">("menu");
  const activeRefreshIdRef = useRef(0);
  const hasLoadedUserDataRef = useRef(false);

  const categories = useMemo(() => {
    return Array.from(new Set(cards.map((card) => card.category)));
  }, [cards]);

  const selectedCard = useMemo(() => {
    return cards.find((card) => card.id === selectedCardId) ?? null;
  }, [cards, selectedCardId]);

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

  const refreshUserData = async (
    currentUser: SupabaseUser,
    options: { showBoot?: boolean } = {}
  ) => {
    const refreshId = activeRefreshIdRef.current + 1;
    activeRefreshIdRef.current = refreshId;
    const bootStart = Date.now();
    const showBoot = options.showBoot ?? !hasLoadedUserDataRef.current;

    if (showBoot) {
      setIsBooting(true);
    }

    try {
      const [userCards, profileResult] = await Promise.all([
        loadCards(currentUser.id),
        supabase
          .from("profiles")
          .select("username, avatar_key")
          .eq("id", currentUser.id)
          .single(),
      ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      if (refreshId !== activeRefreshIdRef.current) return;

      setCards(userCards);
      setProfile(profileResult.data);
      hasLoadedUserDataRef.current = true;

      if (showBoot) {
        const elapsed = Date.now() - bootStart;
        const remaining = Math.max(0, 1600 - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remaining));
        }
      }

      if (refreshId !== activeRefreshIdRef.current) return;

      setScreen((currentScreen) =>
        currentScreen === "cover" ? "home" : currentScreen
      );
    } catch (error: unknown) {
      if (refreshId !== activeRefreshIdRef.current) return;

      console.error("Error refreshing user data:", error);
      if (!hasLoadedUserDataRef.current) {
        alert("Erreur chargement cartes: " + JSON.stringify(error));
      }
    } finally {
      if (refreshId === activeRefreshIdRef.current && showBoot) {
        setIsBooting(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        void refreshUserData(currentUser, { showBoot: !hasLoadedUserDataRef.current });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        window.setTimeout(() => {
          void refreshUserData(currentUser, {
            showBoot: !hasLoadedUserDataRef.current,
          });
        }, 0);
      } else {
        activeRefreshIdRef.current += 1;
        hasLoadedUserDataRef.current = false;
        setCards([]);
        setProfile(null);
        setSelectedCategory("");
        setSelectedCardId(null);
        setIsBooting(false);
        setScreen("cover");
      }
    });

    return () => {
      isMounted = false;
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

    const newUrls = await uploadCardImages(files, user.id);
    if (newUrls.length === 0) return;

    setCards((prev) => {
      const updatedCards = prev.map((card) =>
        card.id === id
          ? { ...card, found: true, images: [...card.images, ...newUrls] }
          : card
      );

      const updatedCard = updatedCards.find((card) => card.id === id);
      if (updatedCard) {
        persistUpdatedCard(updatedCard);
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

    const newUrls = await uploadCardImages(files, user.id);
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
        persistUpdatedCard(updatedCard);
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
        persistUpdatedCard(updatedCard);
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
        persistUpdatedCard(updatedCard);
      }

      return updatedCards;
    });
  };

  return {
    screen,
    isBooting,
    user,
    profile,
    cards,
    categories,
    selectedCategory,
    selectedCard,
    email,
    password,
    username,
    avatarKey,
    authLoading,
    coverMode,
    setEmail,
    setPassword,
    setUsername,
    setAvatarKey,
    setCoverMode,
    setScreen,
    setSelectedCategory,
    setSelectedCardId,
    handleLogin,
    handleSignup,
    handleLogout,
    addPhotos,
    replacePhoto,
    removePhoto,
    updateCard,
  };
}
