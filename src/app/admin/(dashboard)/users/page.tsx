import { createClient } from "@/lib/supabase/server";
import { getAllProfiles } from "@/lib/profiles";
import UsersManager from "@/components/admin/UsersManager";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const profiles = await getAllProfiles(supabase);

  return (
    <UsersManager initialProfiles={profiles} currentUserId={user!.id} canEdit={profile?.role === "admin"} />
  );
}
