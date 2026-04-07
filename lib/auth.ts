import { supabase } from "@/lib/supabase";

export function validateCredentials(
  email: string,
  password: string
): string | null {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail) return "L'adresse email est obligatoire.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return "L'adresse email n'est pas valide.";
  }

  if (!trimmedPassword) return "Le mot de passe est obligatoire.";

  if (trimmedPassword.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  return null;
}

export function validateProfile(
  username: string,
  avatarKey: string
): string | null {
  const trimmedUsername = username.trim();

  if (!trimmedUsername) return "Le nom de microscopeur est obligatoire.";
  if (trimmedUsername.length < 2) {
    return "Le nom de microscopeur doit contenir au moins 2 caractères.";
  }
  if (trimmedUsername.length > 24) {
    return "Le nom de microscopeur ne doit pas dépasser 24 caractères.";
  }
  if (!avatarKey) return "Veuillez choisir un avatar.";

  return null;
}

export async function loginWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
}

export async function signupWithEmail(
  email: string,
  password: string,
  username: string,
  avatarKey: string
) {
  const signUpResult = await supabase.auth.signUp({
    email: email.trim(),
    password: password.trim(),
    options: {
      data: {
        display_name: username.trim(),
      },
    },
  });

  if (signUpResult.error || !signUpResult.data.user) {
    return signUpResult;
  }

  const userId = signUpResult.data.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    username: username.trim(),
    avatar_key: avatarKey,
  });

  if (profileError) {
    return {
      data: signUpResult.data,
      error: profileError,
    };
  }

  return signUpResult;
}

export async function logoutUser() {
  return supabase.auth.signOut();
}