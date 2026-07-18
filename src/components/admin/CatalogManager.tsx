"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createPainting,
  deletePainting,
  updatePainting,
  uploadPaintingImage,
  type AdminPainting,
} from "@/lib/paintings";
import PaintingFormModal, { EMPTY_FORM, type FormState } from "@/components/admin/catalog/PaintingFormModal";
import PaintingCards from "@/components/admin/catalog/PaintingCards";
import ConfirmModal from "@/components/admin/ConfirmModal";

type SortMode = "date_desc" | "date_asc" | "price_asc" | "price_desc";

export default function CatalogManager({
  initialPaintings,
  canEdit,
}: {
  initialPaintings: AdminPainting[];
  canEdit: boolean;
}) {
  const [paintings, setPaintings] = useState(initialPaintings);
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("date_desc");
  const [deleteTarget, setDeleteTarget] = useState<AdminPainting | null>(null);

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
            onChange={(e) => setSort(e.target.value as SortMode)}
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
        {canEdit && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            + Добавить картину
          </button>
        )}
      </div>

      {form && (
        <PaintingFormModal
          form={form}
          setForm={setForm}
          uploading={uploading}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onClose={closeForm}
          onFileChange={handleFileChange}
        />
      )}

      {visible.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
          Ничего не найдено по запросу «{search}»
        </p>
      )}

      <PaintingCards
        paintings={visible}
        view={view}
        canEdit={canEdit}
        onToggleAvailable={handleToggleAvailable}
        onEdit={openEdit}
        onDeleteRequest={setDeleteTarget}
      />

      {deleteTarget && (
        <ConfirmModal
          title="Удалить картину?"
          message={<>Вы точно хотите удалить «{deleteTarget.title}»? Это действие необратимо.</>}
          confirmLabel="Удалить"
          confirmVariant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
