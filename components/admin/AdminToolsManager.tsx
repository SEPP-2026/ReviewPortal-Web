"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/lib/backend-api";
import { adminToolSchema, type AdminToolValues } from "@/lib/form-schemas";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; tool: BackendTool };

const EMPTY_FORM: AdminToolValues = {
  categoryId: 0 as unknown as AdminToolValues["categoryId"],
  name: "",
  description: "",
  hourlyRate: 0,
  dailyRate: 0,
  weeklyRate: 0,
  specialNotes: "",
  depositRequired: false,
  depositAmount: "",
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const validateImage = (file: File | null): string | null => {
  if (!file) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
};

export function AdminToolsManager() {
  const [tools, setTools] = useState<BackendAdminToolSummary[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const [imagePanelTool, setImagePanelTool] = useState<BackendTool | null>(null);
  const [imagePanelError, setImagePanelError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminToolValues>({
    resolver: zodResolver(adminToolSchema),
    defaultValues: EMPTY_FORM,
  });

  const depositRequired = watch("depositRequired");

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await getCategories());
    } catch {
      // non-fatal; the dropdown stays empty
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
        error instanceof Error ? error.message : "Failed to load tools.",
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
    reset(EMPTY_FORM);
    setImageFile(null);
    setImageError(null);
    setFormMode({ kind: "create" });
  };

  const openEdit = async (id: number) => {
    setBusyId(id);
    setErrorMessage(null);
    try {
      const tool = await getAdminToolById(id);
      reset({
        categoryId: tool.categoryId,
        name: tool.name,
        description: tool.description,
        hourlyRate: tool.hourlyRate,
        dailyRate: tool.dailyRate,
        weeklyRate: tool.weeklyRate,
        specialNotes: tool.specialNotes ?? "",
        depositRequired: tool.depositRequired,
        depositAmount: tool.depositAmount ?? "",
      });
      setImageFile(null);
      setImageError(null);
      setFormMode({ kind: "edit", tool });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to open tool for edit.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const closeForm = () => setFormMode({ kind: "closed" });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const message = validateImage(file);
    setImageError(message);
    setImageFile(message ? null : file);
  };

  const onSubmit = async (values: AdminToolValues) => {
    // Create mode requires an image; edit mode allows updating without one.
    if (formMode.kind === "create" && !imageFile) {
      setImageError("Upload at least one image to create a tool.");
      return;
    }
    if (imageError) return;

    try {
      const sharedPayload = {
        categoryId: Number(values.categoryId),
        name: values.name.trim(),
        description: values.description.trim(),
        hourlyRate: Number(values.hourlyRate),
        dailyRate: Number(values.dailyRate),
        weeklyRate: Number(values.weeklyRate),
        specialNotes: values.specialNotes?.trim() || undefined,
        depositRequired: values.depositRequired,
        depositAmount: values.depositRequired
          ? Number(values.depositAmount || 0)
          : undefined,
      };

      if (formMode.kind === "create" && imageFile) {
        await createTool(sharedPayload, imageFile);
        toast.success("Tool created");
      } else if (formMode.kind === "edit") {
        await updateTool(formMode.tool.id, sharedPayload);
        toast.success("Tool updated");
      }
      closeForm();
      await loadTools();
    } catch (error) {
      setError("name", {
        message:
          error instanceof Error ? error.message : "Failed to save tool.",
      });
    }
  };

  const handleToggleStatus = async (tool: BackendAdminToolSummary) => {
    setBusyId(tool.id);
    setErrorMessage(null);
    try {
      await setToolStatus(tool.id, !tool.isActive);
      toast.success(tool.isActive ? "Tool deactivated" : "Tool activated");
      await loadTools();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update tool status.",
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
        error instanceof Error ? error.message : "Failed to load images.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!imagePanelTool) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const message = validateImage(file);
    if (message) {
      setImagePanelError(message);
      event.target.value = "";
      return;
    }

    setImagePanelError(null);
    try {
      await uploadToolImage(imagePanelTool.id, file);
      const refreshed = await getAdminToolById(imagePanelTool.id);
      setImagePanelTool(refreshed);
      toast.success("Image uploaded");
      await loadTools();
    } catch (error) {
      setImagePanelError(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!imagePanelTool) return;
    if (imagePanelTool.images.length <= 1) {
      setImagePanelError("A tool must keep at least one image.");
      return;
    }
    if (!window.confirm("Delete this image?")) return;
    setImagePanelError(null);
    try {
      await deleteToolImage(imagePanelTool.id, imageId);
      const refreshed = await getAdminToolById(imagePanelTool.id);
      setImagePanelTool(refreshed);
      toast.success("Image deleted");
    } catch (error) {
      setImagePanelError(
        error instanceof Error ? error.message : "Failed to delete image.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name..."
              className="pl-9 rounded-md"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value === "" ? "" : Number(event.target.value),
              )
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent"
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
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={openCreate}
            className="rounded-md"
          >
            <Plus className="h-4 w-4" />
            New tool
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {errorMessage}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tool.thumbnailUrl}
                            alt={tool.name}
                            className="h-9 w-9 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-slate-100" />
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
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          tool.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {tool.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openImagePanel(tool.id)}
                          disabled={busyId === tool.id}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
                          title="Manage images"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(tool.id)}
                          disabled={busyId === tool.id}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tool)}
                          disabled={busyId === tool.id}
                          className={`rounded-md border p-1.5 disabled:opacity-50 ${
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="mt-12 w-full max-w-3xl rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {formMode.kind === "create"
                  ? "Create tool"
                  : `Edit: ${formMode.tool.name}`}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 px-6 py-5"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="tool-category">Category</Label>
                  <select
                    id="tool-category"
                    aria-invalid={errors.categoryId ? "true" : undefined}
                    {...register("categoryId", { valueAsNumber: true })}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value={0}>Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-xs text-red-600">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tool-name">Name</Label>
                  <Input
                    id="tool-name"
                    aria-invalid={errors.name ? "true" : undefined}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tool-description">Description</Label>
                <Textarea
                  id="tool-description"
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

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tool-hourly">Hourly rate ($)</Label>
                  <Input
                    id="tool-hourly"
                    type="number"
                    step="0.01"
                    aria-invalid={errors.hourlyRate ? "true" : undefined}
                    {...register("hourlyRate", { valueAsNumber: true })}
                  />
                  {errors.hourlyRate && (
                    <p className="text-xs text-red-600">
                      {errors.hourlyRate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tool-daily">Daily rate ($)</Label>
                  <Input
                    id="tool-daily"
                    type="number"
                    step="0.01"
                    aria-invalid={errors.dailyRate ? "true" : undefined}
                    {...register("dailyRate", { valueAsNumber: true })}
                  />
                  {errors.dailyRate && (
                    <p className="text-xs text-red-600">
                      {errors.dailyRate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tool-weekly">Weekly rate ($)</Label>
                  <Input
                    id="tool-weekly"
                    type="number"
                    step="0.01"
                    aria-invalid={errors.weeklyRate ? "true" : undefined}
                    {...register("weeklyRate", { valueAsNumber: true })}
                  />
                  {errors.weeklyRate && (
                    <p className="text-xs text-red-600">
                      {errors.weeklyRate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tool-notes">Special notes (optional)</Label>
                <Textarea
                  id="tool-notes"
                  rows={2}
                  aria-invalid={errors.specialNotes ? "true" : undefined}
                  {...register("specialNotes")}
                />
                {errors.specialNotes && (
                  <p className="text-xs text-red-600">
                    {errors.specialNotes.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    {...register("depositRequired", {
                      onChange: (event) => {
                        if (!event.target.checked) {
                          setValue("depositAmount", "");
                        }
                      },
                    })}
                  />
                  Deposit required
                </label>
                {depositRequired && (
                  <div className="space-y-1.5">
                    <Label htmlFor="tool-deposit" className="text-xs">
                      Deposit amount ($)
                    </Label>
                    <Input
                      id="tool-deposit"
                      type="number"
                      step="0.01"
                      className="w-40"
                      aria-invalid={errors.depositAmount ? "true" : undefined}
                      {...register("depositAmount")}
                    />
                    {errors.depositAmount && (
                      <p className="text-xs text-red-600">
                        {errors.depositAmount.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {formMode.kind === "create" && (
                <div className="space-y-1.5">
                  <Label htmlFor="tool-image">Cover image</Label>
                  {imagePreview ? (
                    <div className="flex items-start gap-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="h-24 w-24 rounded-md object-cover"
                      />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 break-all">
                            {imageFile?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {imageFile
                              ? `${(imageFile.size / 1024).toFixed(0)} KB`
                              : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900">
                            <ImagePlus className="h-3.5 w-3.5" />
                            Replace
                            <input
                              id="tool-image"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImageError(null);
                            }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="tool-image"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span>Click to upload a cover image</span>
                      <span className="text-xs font-normal text-slate-500">
                        JPG, PNG, or WebP · Maximum 5 MB
                      </span>
                      <input
                        id="tool-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-xs text-slate-500">
                    Use the image panel after creation to add more photos.
                  </p>
                  {imageError && (
                    <p className="text-xs text-red-600">{imageError}</p>
                  )}
                </div>
              )}

              <div className="-mx-6 mt-2 flex items-center justify-end gap-2 border-t border-slate-200 px-6 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                  className="rounded-md"
                >
                  {isSubmitting
                    ? "Saving..."
                    : formMode.kind === "create"
                      ? "Create tool"
                      : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imagePanelTool && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="mt-12 w-full max-w-3xl rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Manage images</h2>
                <p className="text-xs text-slate-500">{imagePanelTool.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setImagePanelTool(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {imagePanelError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {imagePanelError}
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900">
                <ImagePlus className="h-4 w-4" />
                Upload new image (JPG / PNG / WebP, max 5 MB)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {imagePanelTool.images.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-600">
                    No images yet.
                  </p>
                ) : (
                  imagePanelTool.images
                    .slice()
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((image) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-md border border-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.imageUrl}
                          alt=""
                          className="aspect-square w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={imagePanelTool.images.length <= 1}
                          className="absolute right-2 top-2 rounded-md bg-white p-1.5 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title={
                            imagePanelTool.images.length <= 1
                              ? "A tool must keep at least one image"
                              : "Delete image"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
