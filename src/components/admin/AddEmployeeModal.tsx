"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { ASSIGNABLE_ROLES, ROLE_LABELS, createEmployee, type Profile, type Role } from "@/lib/profiles";

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

function generatePassword(length = 14) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join("");
}

export default function AddEmployeeModal({
  onCreated,
  onClose,
}: {
  onCreated: (profile: Profile) => void;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("manager");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setPassword(generatePassword());
    setCopied(false);
  }

  async function handleCopy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      setError("Укажите email и пароль (минимум 6 символов)");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const profile = await createEmployee({ email: email.trim(), password, fullName: fullName.trim(), role });
      onCreated(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать сотрудника");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e0c12] p-5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold">Новый сотрудник</h3>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-white/40">Имя</label>
            <input
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иванов Иван"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Пароль</label>
            <div className="mt-1 flex gap-1.5">
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
              />
              <button
                type="button"
                onClick={handleGenerate}
                title="Сгенерировать сложный пароль"
                className="shrink-0 rounded-lg border border-white/15 p-2 text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!password}
                title="Скопировать"
                className="shrink-0 rounded-lg border border-white/15 p-2 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40">Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Создать
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
