"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ImagePlus,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  createTool,
  deleteToolImage,
  getAdminToolById,
  getAdminTools,
  getCategories,
  setToolStatus,
  updateTool,
  uploadToolImage,
  type BackendAdminToolSummary,
  type BackendCategory,
  type BackendTool,
  type CreateToolPayload,
  type UpdateToolPayload,
} from "@/lib/backend-api";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; tool: BackendTool };

interface ToolFormState {
  categoryId: number | "";
  name: string;
  description: string;
  hourlyRate: string;
  dailyRate: string;
  weeklyRate: string;
  specialNotes: string;
  depositRequired: boolean;
  depositAmount: string;
  imageFile: File | null;
}

const emptyForm: ToolFormState = {
  categoryId: "",
  name: "",
  description: "",
  hourlyRate: "",
  dailyRate: "",
  weeklyRate: "",
  specialNotes: "",
  depositRequired: false,
  depositAmount: "",
  imageFile: null,
};

const parseNumber = (value: string) => Number.parseFloat(value);

export function AdminToolsManager() {
  const [tools, setTools] = useState<BackendAdminToolSummary[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [formState, setFormState] = useState<ToolFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [busyId, setBusyId] = useState<number | null>(null);

  const [imagePanelTool, setImagePanelTool] = useState<BackendTool | null>(null);
  const [imagePanelError, setImagePanelError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await getCategories());
    } catch {
      // ignore - non-fatal
    }
  }, []);

  const loadTools = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAdminTools({
        page: 1,
        pageSize: 50,
        searchTerm: search || undefined,
        categoryId: categoryFilter === "" ? undefined : categoryFilter,
        status: statusFilter || undefined,
      });
      setTools(data.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load tools."
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const openCreate = () => {
    setFormState(emptyForm);
    setFormError(null);
    setFormMode({ kind: "create" });
  };

  const openEdit = async (id: number) => {
    setFormError(null);
    setBusyId(id);
    try {
      const tool = await getAdminToolById(id);
      setFormState({
        categoryId: tool.categoryId,
        name: tool.name,
        description: tool.description,
        hourlyRate: String(tool.hourlyRate),
        dailyRate: String(tool.dailyRate),
        weeklyRate: String(tool.weeklyRate),
        specialNotes: tool.specialNotes ?? "",
        depositRequired: tool.depositRequired,
        depositAmount: tool.depositAmount != null ? String(tool.depositAmount) : "",
        imageFile: null,
      });
      setFormMode({ kind: "edit", tool });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to open tool for edit."
      );
    } finally {
      setBusyId(null);
    }
  };

  const closeForm = () => setFormMode({ kind: "closed" });

  const validateForm = (mode: FormMode): string | null => {
    if (formState.categoryId === "") return "Choose a category.";
    if (!formState.name.trim()) return "Name is required.";
    if (!formState.description.trim()) return "Description is required.";
    if (!formState.hourlyRate || Number.isNaN(parseNumber(formState.hourlyRate)))
      return "Hourly rate must be a number.";
    if (!formState.dailyRate || Number.isNaN(parseNumber(formState.dailyRate)))
      return "Daily rate must be a number.";
    if (!formState.weeklyRate || Number.isNaN(parseNumber(formState.weeklyRate)))
      return "Weekly rate must be a number.";
    if (
      formState.depositRequired &&
      (!formState.depositAmount || Number.isNaN(parseNumber(formState.depositAmount)))
    )
      return "Deposit amount is required when deposit is on.";
    if (mode.kind === "create" && !formState.imageFile)
      return "Upload at least one image to create a tool.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validation = validateForm(formMode);
    if (validation) {
      setFormError(validation);
      return;
    }

    setIsSaving(true);
    try {
      const sharedPayload = {
        categoryId: Number(formState.categoryId),
        name: formState.name.trim(),
        description: formState.description.trim(),
        hourlyRate: parseNumber(formState.hourlyRate),
        dailyRate: parseNumber(formState.dailyRate),
        weeklyRate: parseNumber(formState.weeklyRate),
        specialNotes: formState.specialNotes.trim() || undefined,
        depositRequired: formState.depositRequired,
        depositAmount: formState.depositRequired
          ? parseNumber(formState.depositAmount)
          : undefined,
      };

      if (formMode.kind === "create") {
        const payload: CreateToolPayload = sharedPayload;
        await createTool(payload, formState.imageFile!);
      } else if (formMode.kind === "edit") {
        const payload: UpdateToolPayload = sharedPayload;
        await updateTool(formMode.tool.id, payload);
      }
      closeForm();
      await loadTools();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save tool."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (tool: BackendAdminToolSummary) => {
    setBusyId(tool.id);
    setErrorMessage(null);
    try {
      await setToolStatus(tool.id, !tool.isActive);
      await loadTools();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update tool status."
      );
    } finally {
      setBusyId(null);
    }
  };

  const openImagePanel = async (id: number) => {
    setImagePanelError(null);
    setBusyId(id);
    try {
      const tool = await getAdminToolById(id);
      setImagePanelTool(tool);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load images."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!imagePanelTool) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePanelError(null);
    try {
      await uploadToolImage(imagePanelTool.id, file);
      const refreshed = await getAdminToolById(imagePanelTool.id);
      setImagePanelTool(refreshed);
      await loadTools();
    } catch (error) {
      setImagePanelError(
        error instanceof Error ? error.message : "Failed to upload image."
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!imagePanelTool) return;
    if (!confirm("Delete this image?")) return;
    setImagePanelError(null);
    try {
      await deleteToolImage(imagePanelTool.id, imageId);
      const refreshed = await getAdminToolById(imagePanelTool.id);
      setImagePanelTool(refreshed);
    } catch (error) {
      setImagePanelError(
        error instanceof Error ? error.message : "Failed to delete image."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value === "" ? "" : Number(event.target.value)
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | "active" | "inactive")
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            New tool
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {errorMessage}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        {isLoading ? (
          <div className="p-10">
            <Spinner size="md" text="Loading tools..." />
          </div>
        ) : tools.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            No tools match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tools.map((tool) => (
                  <tr key={tool.id} className="bg-white">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {tool.thumbnailUrl ? (
                          <img
                            src={tool.thumbnailUrl}
                            alt={tool.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{tool.name}</p>
                          <p className="text-xs text-slate-500">ID: {tool.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{tool.categoryName}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900">
                          ${tool.dailyRate.toFixed(2)}
                        </span>{" "}
                        / day
                      </div>
                      <div className="text-xs text-slate-500">
                        ${tool.hourlyRate.toFixed(2)}/hr · ${tool.weeklyRate.toFixed(2)}/wk
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {tool.hasEnoughReviewsToRate
                        ? `${tool.overallRating?.toFixed(1) ?? "—"} (${tool.reviewCount})`
                        : tool.ratingMessage || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          tool.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tool.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openImagePanel(tool.id)}
                          disabled={busyId === tool.id}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-accent hover:text-accent disabled:opacity-50"
                          title="Manage images"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(tool.id)}
                          disabled={busyId === tool.id}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-accent hover:text-accent disabled:opacity-50"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tool)}
                          disabled={busyId === tool.id}
                          className={`rounded-lg border p-2 disabled:opacity-50 ${
                            tool.isActive
                              ? "border-amber-200 text-amber-700 hover:border-amber-400"
                              : "border-emerald-200 text-emerald-700 hover:border-emerald-400"
                          }`}
                          title={tool.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formMode.kind !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="mt-12 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">
                {formMode.kind === "create" ? "Create tool" : `Edit: ${formMode.tool.name}`}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    value={formState.categoryId}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        categoryId:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
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

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Hourly rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.hourlyRate}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        hourlyRate: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Daily rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.dailyRate}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        dailyRate: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Weekly rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.weeklyRate}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        weeklyRate: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Special notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={formState.specialNotes}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      specialNotes: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.depositRequired}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        depositRequired: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Deposit required
                </label>
                {formState.depositRequired && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Deposit amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.depositAmount}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          depositAmount: event.target.value,
                        }))
                      }
                      className="mt-1 w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}
              </div>

              {formMode.kind === "create" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Cover image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        imageFile: event.target.files?.[0] ?? null,
                      }))
                    }
                    className="mt-1 w-full text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Use the image panel after creation to add more photos.
                  </p>
                </div>
              )}

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
                    ? "Create tool"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imagePanelTool && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="mt-12 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Manage images</h2>
                <p className="text-sm text-slate-600">{imagePanelTool.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setImagePanelTool(null)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {imagePanelError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {imagePanelError}
              </div>
            )}

            <label className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-sm font-medium text-slate-700 hover:border-accent hover:text-accent">
              <ImagePlus className="h-4 w-4" />
              Upload new image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
              />
            </label>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {imagePanelTool.images.length === 0 ? (
                <p className="col-span-full text-sm text-slate-600">No images yet.</p>
              ) : (
                imagePanelTool.images
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200"
                    >
                      <img
                        src={image.imageUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-600 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
