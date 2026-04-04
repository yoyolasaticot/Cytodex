import { supabase } from "@/lib/supabase";

export type CytodexCard = {
  id: number;
  cardTemplateId: number;
  title: string;
  category: string;
  found: boolean;
  completed: boolean;
  images: string[];
  characteristics: string;
  pathologies: string;
};

type TemplateRow = {
  id: number;
  title: string;
  category: string;
  is_active: boolean;
};

type UserCardRow = {
  id: number;
  user_id: string;
  card_template_id: number;
  found: boolean;
  completed: boolean;
  images: string[] | null;
  characteristics: string | null;
  pathologies: string | null;
  card_templates:
    | {
        id: number;
        title: string;
        category: string;
        is_active: boolean;
      }
    | {
        id: number;
        title: string;
        category: string;
        is_active: boolean;
      }[]
    | null;
};

function normalizeTemplate(
  value: UserCardRow["card_templates"]
): TemplateRow | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function syncUserCards(userId: string): Promise<void> {
  const { data: templates, error: templatesError } = await supabase
    .from("card_templates")
    .select("id, is_active")
    .eq("is_active", true);

  if (templatesError) {
    throw templatesError;
  }

  const activeTemplates = (templates || []) as Pick<TemplateRow, "id" | "is_active">[];

  if (activeTemplates.length === 0) return;

  const { data: existingRows, error: existingError } = await supabase
    .from("user_cards")
    .select("card_template_id")
    .eq("user_id", userId);

  if (existingError) {
    throw existingError;
  }

  const existingTemplateIds = new Set(
    (existingRows || []).map((row: { card_template_id: number }) => row.card_template_id)
  );

  const missingRows = activeTemplates
    .filter((template) => !existingTemplateIds.has(template.id))
    .map((template) => ({
      user_id: userId,
      card_template_id: template.id,
      found: false,
      completed: false,
      images: [],
      characteristics: "",
      pathologies: "",
    }));

  if (missingRows.length === 0) return;

  const { error: insertError } = await supabase
    .from("user_cards")
    .insert(missingRows);

  if (insertError) {
    throw insertError;
  }
}

export async function loadCards(userId: string): Promise<CytodexCard[]> {
  await syncUserCards(userId);

  const { data, error } = await supabase
    .from("user_cards")
    .select(`
      id,
      user_id,
      card_template_id,
      found,
      completed,
      images,
      characteristics,
      pathologies,
      card_templates (
        id,
        title,
        category,
        is_active
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data || []) as UserCardRow[])
    .map((row) => {
      const template = normalizeTemplate(row.card_templates);
      if (!template || !template.is_active) return null;

      return {
        id: row.id,
        cardTemplateId: row.card_template_id,
        title: template.title,
        category: template.category,
        found: row.found,
        completed: row.completed,
        images: row.images || [],
        characteristics: row.characteristics || "",
        pathologies: row.pathologies || "",
      } satisfies CytodexCard;
    })
    .filter((row): row is CytodexCard => row !== null);
}

export async function saveCard(card: CytodexCard): Promise<void> {
  const { error } = await supabase
    .from("user_cards")
    .update({
      found: card.found,
      completed: card.completed,
      images: card.images,
      characteristics: card.characteristics,
      pathologies: card.pathologies,
    })
    .eq("id", card.id);

  if (error) {
    throw error;
  }
}
