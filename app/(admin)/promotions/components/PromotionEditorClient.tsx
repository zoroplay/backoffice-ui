"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";

import {
  createPromotion,
  defaultPromotionForm,
  fetchPromotion,
  normalizePromotionForm,
  updatePromotion,
  type PromotionFormValue,
} from "../api";

const addTypeOptions = [
  ["web", "Web"],
  ["mobile", "Mobile"],
] as const;

const editTypeOptions = [
  ["sport_web", "Sport (Web)"],
  ["casino_mobile", "Casino (Mobile)"],
  ["sport_mobile", "Sport (Mobile)"],
  ["casino_web", "Casino (Web)"],
] as const;

type PromotionEditorProps = {
  mode: "add" | "edit";
  promotionId?: string;
};

function blankForm(mode: "add" | "edit") {
  return normalizePromotionForm(defaultPromotionForm, mode);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

function PromotionEditorClient({ mode, promotionId }: PromotionEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<PromotionFormValue>(() => ({
    ...blankForm(mode),
    id: promotionId,
  }));
  const [initialForm, setInitialForm] = useState<PromotionFormValue>(() => ({
    ...blankForm(mode),
    id: promotionId,
  }));
  const [selectedFileName, setSelectedFileName] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [targetUrlError, setTargetUrlError] = useState("");

  const typeOptions = useMemo(
    () => (mode === "add" ? addTypeOptions : editTypeOptions),
    [mode]
  );

  useEffect(() => {
    let cancelled = false;

    if (mode === "add") {
      const nextForm = {
        ...blankForm(mode),
        id: promotionId,
      };
      setFormData(nextForm);
      setInitialForm(nextForm);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (!promotionId) return () => undefined;

    setLoading(true);

    fetchPromotion(promotionId)
      .then((promotion) => {
        if (cancelled) return;
        const nextForm = normalizePromotionForm(promotion ?? { id: promotionId }, mode);
        setFormData(nextForm);
        setInitialForm(nextForm);
        setSelectedFileName("");
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(error instanceof Error ? error.message : "Unable to load promotion");
        const nextForm = normalizePromotionForm({ id: promotionId }, mode);
        setFormData(nextForm);
        setInitialForm(nextForm);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, promotionId]);

  function updateValue(key: keyof PromotionFormValue, value: string) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
    if (key === "title") setTitleError("");
    if (key === "targetUrl") setTargetUrlError("");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedFileName(file.name);
      setFormData((current) => ({
        ...current,
        file: dataUrl,
        imageUrl: dataUrl,
      }));
    } catch {
      toast.error("Unable to preview selected image");
    }
  }

  async function savePromotion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.title.trim()) {
      setTitleError("Title is required");
      return;
    }

    if (!formData.targetUrl.includes("http")) {
      setTargetUrlError("Invalid Target URL");
      return;
    }

    setTitleError("");
    setTargetUrlError("");
    setSaving(true);

    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        targetUrl: formData.targetUrl.trim(),
      };

      if (mode === "add") {
        await createPromotion(payload);
        toast.success("Promotion has been created successfully.");
        router.push("/promotions");
      } else {
        await updatePromotion(payload);
        toast.success("Promotion has been updated successfully.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setFormData(initialForm);
    setSelectedFileName("");
    setTitleError("");
    setTargetUrlError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New Promotion" : "Update Promotion"}
        </h2>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading Please wait....</div>
      ) : (
        <form className="space-y-5 p-5" onSubmit={(event) => void savePromotion(event)}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span className="text-red-500">*</span>
            <input
              value={formData.title}
              onChange={(event) => updateValue("title", event.target.value)}
              placeholder="Enter promotion title"
              className={`mt-2 h-10 w-full rounded-md border px-3 text-sm text-gray-800 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
                titleError
                  ? "border-red-300 focus:ring-red-500/10 dark:border-red-500"
                  : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700"
              }`}
            />
            {titleError ? <span className="mt-1 block text-xs text-red-500">{titleError}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Promotion preview"
                  className="h-28 w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  Choose File
                </Button>
                <input
                  value={formData.imageUrl}
                  onChange={(event) => {
                    setSelectedFileName("");
                    updateValue("file", event.target.value);
                    updateValue("imageUrl", event.target.value);
                  }}
                  placeholder="Image URL or uploaded preview"
                  className="h-11 min-w-72 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
              {selectedFileName ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedFileName}</p>
              ) : null}
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page Content
            <textarea
              value={formData.content}
              onChange={(event) => updateValue("content", event.target.value)}
              placeholder="Promotion content"
              className="mt-2 min-h-56 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "add" ? "Platform" : "Type"}
              <select
                value={formData.type}
                onChange={(event) => updateValue("type", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {typeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
              <input
                type="date"
                value={formData.startDate}
                onChange={(event) => updateValue("startDate", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) => updateValue("endDate", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target URL <span className="text-red-500">*</span>
            <input
              value={formData.targetUrl}
              onChange={(event) => updateValue("targetUrl", event.target.value)}
              placeholder="https://example.com"
              className={`mt-2 h-10 w-full rounded-md border px-3 text-sm text-gray-800 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
                targetUrlError
                  ? "border-red-300 focus:ring-red-500/10 dark:border-red-500"
                  : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700"
              }`}
            />
            {targetUrlError ? (
              <span className="mt-1 block text-xs text-red-500">{targetUrlError}</span>
            ) : null}
          </label>

          <input type="hidden" value={formData.id ?? ""} readOnly />
          <input type="hidden" value={formData.clientId} readOnly />

          <div className="grid gap-3 sm:grid-cols-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Reset
            </Button>
            <Link
              href="/promotions"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Back to list
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}

export default withAuth(PromotionEditorClient);
