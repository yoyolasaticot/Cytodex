"use client";

import CardDetailScreen from "@/components/cytodex/CardDetailScreen";
import BootScreen from "@/components/cytodex/BootScreen";
import CardListScreen from "@/components/cytodex/CardListScreen";
import CategoryScreen from "@/components/cytodex/CategoryScreen";
import CoverScreen from "@/components/cytodex/CoverScreen";
import HomeScreen from "@/components/cytodex/HomeScreen";
import { useCytodexApp } from "@/components/cytodex/useCytodexApp";

export default function Page() {
  const {
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
  } = useCytodexApp();

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

  if (isBooting) {
    return (
      <BootScreen
        username={
          profile?.username ||
          (user.user_metadata?.display_name as string | undefined) ||
          user.email?.split("@")[0] ||
          null
        }
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
