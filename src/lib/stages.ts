import type { SupabaseClient } from "@supabase/supabase-js";

export type LeadStage = {
  key: string;
  title: string;
  color: string;
  position: number;
  is_system: boolean;
};

export async function getStages(client: SupabaseClient): Promise<LeadStage[]> {
  const { data, error } = await client
    .from("lead_stages")
    .select("key, title, color, position, is_system")
    .order("position", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stages: ${error.message}`);
  }

  return data as LeadStage[];
}

// Сколько лидов сейчас стоит на каждом этапе — чтобы в /admin/settings
// пометить занятые этапы и предупредить перед удалением.
export async function getStageLeadCounts(client: SupabaseClient): Promise<Record<string, number>> {
  const { data, error } = await client.from("leads").select("status");

  if (error) {
    throw new Error(`Failed to load lead counts: ${error.message}`);
  }

  const counts: Record<string, number> = {};
  for (const row of data as { status: string }[]) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "stage"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createStage(
  client: SupabaseClient,
  input: { title: string; color: string },
): Promise<LeadStage> {
  const { data: existing, error: posError } = await client
    .from("lead_stages")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (posError) {
    throw new Error(`Failed to load stages: ${posError.message}`);
  }

  const position = (existing?.position ?? 0) + 1;
  const key = slugify(input.title);

  const { data, error } = await client
    .from("lead_stages")
    .insert({ key, title: input.title, color: input.color, position, is_system: false })
    .select("key, title, color, position, is_system")
    .single();

  if (error) {
    throw new Error(`Failed to create stage: ${error.message}`);
  }

  return data as LeadStage;
}

export async function updateStage(
  client: SupabaseClient,
  key: string,
  input: Partial<{ title: string; color: string }>,
): Promise<void> {
  const { error } = await client.from("lead_stages").update(input).eq("key", key);

  if (error) {
    throw new Error(`Failed to update stage: ${error.message}`);
  }
}

export async function deleteStage(client: SupabaseClient, key: string): Promise<void> {
  const { error } = await client.from("lead_stages").delete().eq("key", key);

  if (error) {
    throw new Error(
      error.code === "23503"
        ? "Нельзя удалить этап, пока в нём есть лиды"
        : `Failed to delete stage: ${error.message}`,
    );
  }
}
