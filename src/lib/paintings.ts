import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Painting = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  is_available: boolean;
};

export type AdminPainting = Painting & {
  description: string | null;
  created_at: string;
};

export async function getPaintings(): Promise<Painting[]> {
  const { data, error } = await supabase
    .from("paintings")
    .select("id, title, price, image_url, is_available")
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
