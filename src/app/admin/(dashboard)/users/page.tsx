import { createClient } from "@/lib/supabase/server";
import { getAllProfiles } from "@/lib/profiles";
import UsersManager from "@/components/admin/UsersManager";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profiles = await getAllProfiles(supabase);

  return <UsersManager initialProfiles={profiles} currentUserId={user!.id} />;
}
