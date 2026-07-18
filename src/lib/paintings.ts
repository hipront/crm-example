import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Painting = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  is_available: boolean;
};

export type AdminPainting = Painting & {
  created_at: string;
};

export async function getPaintings(): Promise<Painting[]> {
  const { data, error } = await supabase
    .from("paintings")
    .select("id, title, description, price, image_url, is_available")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load paintings: ${error.message}`);
  }

  return data;
}

export async function getAllPaintings(client: SupabaseClient): Promise<AdminPainting[]> {
  const { data, error } = await client
    .from("paintings")
    .select("id, title, description, price, image_url, is_available, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load paintings: ${error.message}`);
  }

  return data;
}

export type PaintingInput = {
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  is_available: boolean;
};

export async function createPainting(client: SupabaseClient, input: PaintingInput) {
  const { data, error } = await client.from("paintings").insert(input).select().single();

  if (error) {
    throw new Error(`Failed to create painting: ${error.message}`);
  }

  return data as AdminPainting;
}

export async function updatePainting(client: SupabaseClient, id: string, input: Partial<PaintingInput>) {
  const { data, error } = await client
    .from("paintings")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update painting: ${error.message}`);
  }

  return data as AdminPainting;
}

export async function deletePainting(client: SupabaseClient, id: string) {
  const { error } = await client.from("paintings").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete painting: ${error.message}`);
  }
}

export async function uploadPaintingImage(client: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage.from("paintings").upload(path, file);

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = client.storage.from("paintings").getPublicUrl(path);
  return data.publicUrl;
}
