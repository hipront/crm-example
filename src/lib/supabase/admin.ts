import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role клиент — обходит RLS полностью. Только для серверных
// Route Handler'ов, которые САМИ сначала проверяют, что вызывающий — admin.
// Никогда не импортировать в клиентский код ("server-only" не даст собрать
// бандл, если такое случайно произойдёт).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
