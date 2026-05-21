"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, Pencil, Plus, Trash2, X } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type BackendCategory,
} from "@/lib/backend-api";
import {
  adminCategorySchema,
  type AdminCategoryValues,
} from "@/lib/form-schemas";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; category: BackendCategory };

const EMPTY_FORM: AdminCategoryValues = {
  name: "",
  description: "",
  imageUrl: "",
};

export function AdminCategoriesManager() {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [busyId, setBusyId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminCategoryValues>({
    resolver: zodResolver(adminCategorySchema),
    defaultValues: EMPTY_FORM,
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setCategories(await getCategories());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    reset(EMPTY_FORM);
    setFormMode({ kind: "create" });
  };

  const openEdit = (category: BackendCategory) => {
    reset({
      name: category.name,
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
    });
    setFormMode({ kind: "edit", category });
  };

  const closeForm = () => setFormMode({ kind: "closed" });

  const onSubmit = async (values: AdminCategoryValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
      };

      if (formMode.kind === "create") {
        await createCategory(payload);
        toast.success("Category created");
      } else if (formMode.kind === "edit") {
        await updateCategory(formMode.category.id, payload);
        toast.success("Category updated");
      }
      closeForm();
      await load();
    } catch (error) {
      setError("name", {
        message:
          error instanceof Error ? error.message : "Failed to save category.",
      });
    }
  };

  const handleDelete = async (category: BackendCategory) => {
    if (
      !window.confirm(
        `Delete category "${category.name}"? This cannot be done while it still has tools.`,
      )
    )
      return;

    setBusyId(category.id);
    setErrorMessage(null);
    try {
      await deleteCategory(category.id);
      toast.success("Category deleted");
      await load();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete category.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}{" "}
          configured
        </p>
        <Button type="button" variant="default" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
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
                  // eslint-disable-next-line @next/next/no-img-element
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    disabled={busyId === category.id || category.toolCount > 0}
                    title={
                      category.toolCount > 0
                        ? "Cannot delete a category that still contains tools."
                        : "Delete category"
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
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
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  aria-invalid={errors.name ? "true" : undefined}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="category-description"
                  rows={3}
                  aria-invalid={errors.description ? "true" : undefined}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-imageUrl">Image URL (optional)</Label>
                <Input
                  id="category-imageUrl"
                  type="url"
                  placeholder="https://..."
                  aria-invalid={errors.imageUrl ? "true" : undefined}
                  {...register("imageUrl")}
                />
                {errors.imageUrl && (
                  <p className="text-xs text-red-600">
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : formMode.kind === "create"
                      ? "Create category"
                      : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
