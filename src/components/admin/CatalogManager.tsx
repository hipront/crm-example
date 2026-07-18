"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createPainting,
  deletePainting,
  updatePainting,
  uploadPaintingImage,
  type AdminPainting,
} from "@/lib/paintings";

type FormState = {
  id: string | null;
  title: string;
  description: string;
  price: string;
  image_url: string;
  is_available: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  description: "",
  price: "",
  image_url: "",
  is_available: true,
};

export default function CatalogManager({ initialPaintings }: { initialPaintings: AdminPainting[] }) {
  const [paintings, setPaintings] = useState(initialPaintings);
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc" | "price_asc" | "price_desc">("date_desc");
  const [deleteTarget, setDeleteTarget] = useState<AdminPainting | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = paintings
    .filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "date_desc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  function openCreate() {
    setError(null);
    setForm(EMPTY_FORM);
  }

  function openEdit(p: AdminPainting) {
    setError(null);
    setForm({
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      price: String(p.price),
      image_url: p.image_url,
      is_available: p.is_available,
    });
  }

  function closeForm() {
    setForm(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;

    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const url = await uploadPaintingImage(supabase, file);
      setForm({ ...form, image_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const price = Number(form.price);
    if (!form.title.trim() || !form.image_url || !Number.isFinite(price) || price <= 0) {
      setError("Заполните название, загрузите фото и укажите корректную цену");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const input = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price,
        image_url: form.image_url,
        is_available: form.is_available,
      };

      if (form.id) {
        const updated = await updatePainting(supabase, form.id, input);
        setPaintings((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createPainting(supabase, input);
        setPaintings((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить картину");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    const previous = paintings;
    setPaintings((prev) => prev.filter((x) => x.id !== target.id));

    try {
      const supabase = createClient();
      await deletePainting(supabase, target.id);
    } catch (err) {
      setPaintings(previous);
      alert(err instanceof Error ? err.message : "Не удалось удалить картину");
    }
  }

  async function handleToggleAvailable(p: AdminPainting) {
    const previous = paintings;
    setPaintings((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_available: !x.is_available } : x)),
    );

    try {
      const supabase = createClient();
      await updatePainting(supabase, p.id, { is_available: !p.is_available });
    } catch (err) {
      setPaintings(previous);
      alert(err instanceof Error ? err.message : "Не удалось изменить статус");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-56 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-fuchsia-400"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors hover:border-white/30 focus:border-fuchsia-400"
          >
            <option value="date_desc">Сначала новые</option>
            <option value="date_asc">Сначала старые</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
          </select>
          <div className="flex rounded-lg border border-white/15 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                view === "grid" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Сетка
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                view === "list" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Список
            </button>
          </div>
          <p className="text-sm text-white/50">
            {visible.length} из {paintings.length}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
        >
          + Добавить картину
        </button>
      </div>

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
        <form
          onSubmit={handleSubmit}
          className="grid w-full max-w-2xl gap-4 rounded-2xl border border-white/10 bg-[#141018] p-6 shadow-2xl sm:grid-cols-2"
        >
          <div className="sm:col-span-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{form.id ? "Редактировать картину" : "Новая картина"}</h3>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Название
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-400"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Цена, ₽
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none [appearance:textfield] focus:border-fuchsia-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm text-white/70">
            Описание
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-400"
            />
          </label>

          <div className="sm:col-span-2 flex flex-col gap-1.5 text-sm text-white/70">
            Фото
            <div>
              <label
                htmlFor="painting-image-input"
                className="inline-block cursor-pointer rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                Выбрать файл
              </label>
              <input
                ref={fileInputRef}
                id="painting-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>
            {uploading && <span className="text-xs text-white/40">Загружаем…</span>}
            {form.image_url && !uploading && (
              <div className="mt-1">
                <p className="mb-1.5 text-xs text-white/40">
                  Превью — именно так картина будет обрезана на сайте (пропорция 4:5)
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt=""
                  className="aspect-[4/5] w-40 rounded-lg border border-white/10 object-cover"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              className="h-4 w-4 rounded border-white/30 bg-black/30"
            />
            В наличии
          </label>

          {error && <p className="sm:col-span-2 text-sm text-red-400">{error}</p>}

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
            >
              {saving ? "Сохраняем…" : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Отмена
            </button>
          </div>
        </form>
        </div>
      )}

      {visible.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
          Ничего не найдено по запросу «{search}»
        </p>
      )}

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={p.title} className="aspect-[4/5] w-full rounded-lg object-cover" />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-white/50">{p.price.toLocaleString("ru-RU")} ₽</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(p)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors ${
                    p.is_available
                      ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/60"
                  }`}
                >
                  {p.is_available ? "В наличии" : "Продано"}
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="flex-1 rounded-lg border border-white/15 py-1.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/40 transition-colors hover:border-red-400/50 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
          {visible.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={p.title} className="h-14 w-11 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-sm text-white/50">{p.price.toLocaleString("ru-RU")} ₽</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAvailable(p)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors ${
                  p.is_available
                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/60"
                }`}
              >
                {p.is_available ? "В наличии" : "Продано"}
              </button>
              <button
                type="button"
                onClick={() => openEdit(p)}
                className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(p)}
                className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/40 transition-colors hover:border-red-400/50 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141018] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Удалить картину?</h3>
            <p className="mt-2 text-sm text-white/60">
              Вы точно хотите удалить «{deleteTarget.title}»? Это действие необратимо.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-full bg-red-500/90 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
