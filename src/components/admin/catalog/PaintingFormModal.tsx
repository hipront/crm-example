"use client";

import { useRef } from "react";

export type FormState = {
  id: string | null;
  title: string;
  description: string;
  price: string;
  image_url: string;
  is_available: boolean;
};

export const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  description: "",
  price: "",
  image_url: "",
  is_available: true,
};

export default function PaintingFormModal({
  form,
  setForm,
  uploading,
  saving,
  error,
  onSubmit,
  onClose,
  onFileChange,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  uploading: boolean;
  saving: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className="grid w-full max-w-2xl gap-4 rounded-2xl border border-white/10 bg-[#141018] p-6 shadow-2xl sm:grid-cols-2"
      >
        <div className="sm:col-span-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{form.id ? "Редактировать картину" : "Новая картина"}</h3>
          <button
            type="button"
            onClick={onClose}
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
              onChange={onFileChange}
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
