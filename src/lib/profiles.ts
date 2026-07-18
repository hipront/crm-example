import type { SupabaseClient } from "@supabase/supabase-js";

export const ROLES = ["manager", "rop", "admin", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  manager: "Менеджер",
  rop: "РОП",
  admin: "Админ",
  viewer: "Ридонли",
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  created_at: string;
};

export async function getManagers(client: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("role", "manager")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load managers: ${error.message}`);
  }

  return data as Profile[];
}

export async function getAllProfiles(client: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load profiles: ${error.message}`);
  }

  return data as Profile[];
}

export async function updateProfileRole(client: SupabaseClient, id: string, role: Role) {
  const { error } = await client.from("profiles").update({ role }).eq("id", id);

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`);
  }
}

export async function updateProfileName(client: SupabaseClient, id: string, fullName: string) {
  const { error } = await client.from("profiles").update({ full_name: fullName || null }).eq("id", id);

  if (error) {
    throw new Error(`Failed to update name: ${error.message}`);
  }
}
