"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Loader2, Palette, Pin, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createStage, deleteStage, updateStage, type LeadStage } from "@/lib/stages";
import ConfirmModal from "@/components/admin/ConfirmModal";

const PRESET_COLORS = [
  "#94a3b8", "#22d3ee", "#a855f7", "#4ade80",
  "#e879f9", "#f5f3f7", "#f87171", "#ef4444", "#facc15",
];

function ColorPicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute left-0 top-7 z-10 w-52 rounded-xl border border-white/10 bg-[#141018] p-3 shadow-2xl">
      <div className="grid grid-cols-4 gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              onChange(c);
              onClose();
            }}
            className="h-6 w-6 rounded-full ring-1 ring-white/10 transition-transform hover:scale-110"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <Palette className="h-3.5 w-3.5 shrink-0" />
          Свой цвет
          <input
            type="color"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-5 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          onChange(draft);
          onClose();
        }}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-fuchsia-500/90 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-fuchsia-500"
      >
        <Check className="h-3 w-3" />
        Применить
      </button>
    </div>
  );
}

function StageRow({
  stage,
  leadCount,
  onUpdated,
  onDeleted,
}: {
  stage: LeadStage;
  leadCount: number;
  onUpdated: (stage: LeadStage) => void;
  onDeleted: (key: string) => void;
}) {
  const [title, setTitle] = useState(stage.title);
  const [savingTitle, setSavingTitle] = useState(false);
  const [pickingColor, setPickingColor] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveTitle() {
    if (title.trim() === stage.title || !title.trim()) {
      setTitle(stage.title);
      return;
    }
    setSavingTitle(true);
    const supabase = createClient();
    try {
      await updateStage(supabase, stage.key, { title: title.trim() });
      onUpdated({ ...stage, title: title.trim() });
    } catch {
      setTitle(stage.title);
    } finally {
      setSavingTitle(false);
    }
  }

  async function changeColor(color: string) {
    const supabase = createClient();
    try {
      await updateStage(supabase, stage.key, { color });
      onUpdated({ ...stage, color });
    } catch {
      /* revert not needed — swatch just won't update */
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    try {
      await deleteStage(supabase, stage.key);
      onDeleted(stage.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить этап");
      setDeleting(false);
    }
  }

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setPickingColor((v) => !v)}
          className="h-5 w-5 rounded-full ring-2 ring-white/10 transition-transform hover:scale-110"
          style={{ backgroundColor: stage.color }}
          aria-label="Изменить цвет"
        />
        {pickingColor && (
          <ColorPicker value={stage.color} onChange={changeColor} onClose={() => setPickingColor(false)} />
        )}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        disabled={savingTitle}
        className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-white outline-none transition-colors hover:border-white/15 focus:border-fuchsia-400 focus:bg-black/30"
      />

      {leadCount > 0 && (
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
          <Pin className="h-3 w-3" />
          {leadCount}
        </span>
      )}

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        disabled={deleting}
        className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Удалить этап"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>

      {error && <p className="absolute -bottom-5 left-0 text-xs text-red-400">{error}</p>}

      {confirmDelete && (
        <ConfirmModal
          title="Удалить этап?"
          message={
            <>
              {leadCount > 0 ? (
                <>
                  Нельзя удалить: на этапе «{stage.title}» сейчас {leadCount} лид
                  {leadCount === 1 ? "" : "ов"}. Сначала перенесите {leadCount === 1 ? "его" : "их"} на другой
                  этап на доске CRM.
                </>
              ) : (
                <>Этап «{stage.title}» будет удалён с доски CRM безвозвратно.</>
              )}
            </>
          }
          confirmLabel="Удалить"
          confirmDisabled={leadCount > 0}
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default function SettingsClient({
  initialStages,
  leadCounts,
}: {
  initialStages: LeadStage[];
  leadCounts: Record<string, number>;
}) {
  const [stages, setStages] = useState(initialStages);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [pickingNewColor, setPickingNewColor] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function addStage() {
    if (!newTitle.trim()) return;
    setAdding(true);
    setAddError(null);
    const supabase = createClient();
    try {
      const stage = await createStage(supabase, { title: newTitle.trim(), color: newColor });
      setStages((prev) => [...prev, stage]);
      setNewTitle("");
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Не удалось добавить этап");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-semibold">Настройки</h1>
      <p className="mt-1 text-sm text-white/50">Этапы воронки на доске CRM.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/90">Этапы CRM</h2>
        <p className="mt-1 text-xs text-white/40">
          Название, цвет и набор этапов можно менять свободно — под свои процессы.
        </p>

        <div className="mt-4 space-y-2">
          {stages.map((stage) => (
            <StageRow
              key={stage.key}
              stage={stage}
              leadCount={leadCounts[stage.key] ?? 0}
              onUpdated={(updated) => setStages((prev) => prev.map((s) => (s.key === updated.key ? updated : s)))}
              onDeleted={(key) => setStages((prev) => prev.filter((s) => s.key !== key))}
            />
          ))}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs font-medium text-white/50">Добавить этап</p>
          <div className="relative mt-2 flex items-center gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="h-6 w-6 shrink-0 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  boxShadow: newColor === c ? "0 0 0 2px #000, 0 0 0 4px #fff" : undefined,
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => setPickingNewColor((v) => !v)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-dashed border-white/30 text-white/50 transition-colors hover:border-white/60 hover:text-white"
              title="Свой цвет"
            >
              <Palette className="h-3 w-3" />
            </button>
            {pickingNewColor && (
              <ColorPicker
                value={newColor}
                onChange={setNewColor}
                onClose={() => setPickingNewColor(false)}
              />
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void addStage();
              }}
              placeholder="Название этапа"
              className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            />
            <button
              type="button"
              onClick={addStage}
              disabled={adding || !newTitle.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Добавить
            </button>
          </div>
          {addError && <p className="mt-2 text-xs text-red-400">{addError}</p>}
        </div>
      </div>
    </div>
  );
}
