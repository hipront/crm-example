import { createClient } from "@/lib/supabase/server";
import { getAllPaintings } from "@/lib/paintings";
import CatalogManager from "@/components/admin/CatalogManager";

export default async function CatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const paintings = await getAllPaintings(supabase);

  return <CatalogManager initialPaintings={paintings} canEdit={profile?.role === "admin"} role={profile?.role ?? null} />;
}
