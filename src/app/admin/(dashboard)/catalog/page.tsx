import { createClient } from "@/lib/supabase/server";
import { getAllPaintings } from "@/lib/paintings";
import CatalogManager from "@/components/admin/CatalogManager";

export default async function CatalogPage() {
  const supabase = await createClient();
  const paintings = await getAllPaintings(supabase);

  return <CatalogManager initialPaintings={paintings} />;
}
