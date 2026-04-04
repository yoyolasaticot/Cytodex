import { supabase } from "@/lib/supabase";

export function validateCredentials(email: string, password: string): string | null {
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

export async function loginWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
}

export async function signupWithEmail(email: string, password: string) {
  return supabase.auth.signUp({
    email: email.trim(),
    password: password.trim(),
    options: {
      data: {
        display_name: email.trim().split("@")[0] ?? "",
      },
    },
  });
}

export async function logoutUser() {
  return supabase.auth.signOut();
}
