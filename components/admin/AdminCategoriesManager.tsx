"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type BackendCategory,
} from "@/lib/backend-api";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; category: BackendCategory };

interface CategoryFormState {
  name: string;
  description: string;
  imageUrl: string;
}

const emptyForm: CategoryFormState = {
  name: "",
  description: "",
  imageUrl: "",
};

export function AdminCategoriesManager() {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [formState, setFormState] = useState<CategoryFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setCategories(await getCategories());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load categories."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setFormState(emptyForm);
    setFormError(null);
    setFormMode({ kind: "create" });
  };

  const openEdit = (category: BackendCategory) => {
    setFormState({
      name: category.name,
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
    });
    setFormError(null);
    setFormMode({ kind: "edit", category });
  };

  const closeForm = () => setFormMode({ kind: "closed" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!formState.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim() || undefined,
        imageUrl: formState.imageUrl.trim() || undefined,
      };

      if (formMode.kind === "create") {
        await createCategory(payload);
      } else if (formMode.kind === "edit") {
        await updateCategory(formMode.category.id, payload);
      }
      closeForm();
      await load();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save category."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: BackendCategory) => {
    if (
      !confirm(
        `Delete category "${category.name}"? This cannot be done while it still has tools.`
      )
    )
      return;

    setBusyId(category.id);
    setErrorMessage(null);
    try {
      await deleteCategory(category.id);
      await load();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete category."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} configured
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          New category
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {errorMessage}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10">
          <Spinner size="md" text="Loading categories..." />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
          No categories yet. Create your first one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
            >
              <div className="relative h-32 bg-slate-100">
                {category.imageUrl && (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow">
                  {category.toolCount} tools
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-950">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-3">
                    {category.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-accent hover:text-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    disabled={busyId === category.id || category.toolCount > 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:border-red-400 disabled:opacity-50"
                    title={
                      category.toolCount > 0
                        ? "Cannot delete a category that still contains tools."
                        : "Delete category"
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formMode.kind !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="mt-12 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">
                {formMode.kind === "create"
                  ? "Create category"
                  : `Edit: ${formMode.category.name}`}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formState.imageUrl}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      imageUrl: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : formMode.kind === "create"
                    ? "Create category"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
