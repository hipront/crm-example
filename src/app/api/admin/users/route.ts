import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLES, type Role } from "@/lib/profiles";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function POST(request: Request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    fullName?: string;
    role?: Role;
  } | null;

  const email = body?.email?.trim();
  const password = body?.password ?? "";
  const role = body?.role;

  if (!email || password.length < 6) {
    return NextResponse.json({ error: "Укажите email и пароль (минимум 6 символов)" }, { status: 400 });
  }
  if (!role || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: body?.fullName?.trim() || null },
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Не удалось создать пользователя" }, { status: 400 });
  }

  if (role !== "manager") {
    const { error: roleError } = await admin.from("profiles").update({ role }).eq("id", created.user.id);
    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 400 });
    }
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("id", created.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Пользователь создан, но не удалось загрузить профиль" }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

export async function DELETE(request: Request) {
  const { user, error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id;

  if (!id) {
    return NextResponse.json({ error: "Не указан id" }, { status: 400 });
  }
  if (id === user!.id) {
    return NextResponse.json({ error: "Нельзя удалить самого себя" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
