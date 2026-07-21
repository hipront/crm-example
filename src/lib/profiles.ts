import type { SupabaseClient } from "@supabase/supabase-js";

export const ROLES = ["manager", "rop", "admin", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  manager: "Менеджер",
  rop: "РОП",
  admin: "Админ",
  viewer: "Ридонли",
};

// Назначить через UI можно только эти роли — "admin" исключён намеренно:
// новый admin может появиться только напрямую через БД (см. 0016-миграцию,
// триггер prevent_role_self_escalation блокирует это и на уровне сервера).
export const ASSIGNABLE_ROLES = ROLES.filter((r) => r !== "admin");

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export async function getManagers(client: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("role", "manager")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load managers: ${error.message}`);
  }

  return data as Profile[];
}

export async function getAllProfiles(client: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
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

export async function updateProfileActive(client: SupabaseClient, id: string, isActive: boolean) {
  const { error } = await client.from("profiles").update({ is_active: isActive }).eq("id", id);

  if (error) {
    throw new Error(`Failed to update access: ${error.message}`);
  }
}

export async function createEmployee(input: {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}): Promise<Profile> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as { profile?: Profile; error?: string };

  if (!response.ok || !body.profile) {
    throw new Error(body.error ?? "Не удалось создать сотрудника");
  }

  return body.profile;
}

export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch("/api/admin/users", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Не удалось удалить сотрудника");
  }
}
