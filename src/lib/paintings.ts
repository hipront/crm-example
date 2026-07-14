import { supabase } from "@/lib/supabase";

export type Painting = {
  id: string;
  title: string;
  price: number;
  image_url: string;
};

export async function getPaintings(): Promise<Painting[]> {
  const { data, error } = await supabase
    .from("paintings")
    .select("id, title, price, image_url")
    .eq("is_available", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load paintings: ${error.message}`);
  }

  return data;
}
