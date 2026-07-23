"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";
import {
  bannerPosition,
  createBanner,
  defaultBannerForm,
  fetchBanner,
  fetchBanners,
  normalizeBannerForm,
  updateBanner,
  type BannerFormValue,
} from "../banners/api";

type BannerEditorProps = {
  mode: "add" | "edit";
  bannerId?: string;
};

function blankForm() {
  return normalizeBannerForm(defaultBannerForm);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

export default function BannerEditorClient({ mode, bannerId }: BannerEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<BannerFormValue>(() => ({
    ...blankForm(),
    id: bannerId,
  }));
  const [selectedFileName, setSelectedFileName] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [popupLimitReached, setPopupLimitReached] = useState(false);

  const initialForm = useMemo(
    () => ({
      ...blankForm(),
      id: bannerId,
    }),
    [bannerId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      setLoading(mode === "edit");
      try {
        const banners = await fetchBanners();
        if (!cancelled) {
          setPopupLimitReached(banners.filter((banner) => bannerPosition(banner) === "popup").length >= 2);
        }

        if (mode === "edit" && bannerId) {
          const banner = await fetchBanner(bannerId);
          if (!cancelled) setFormData(normalizeBannerForm(banner ?? { id: bannerId }));
        } else if (!cancelled) {
          setFormData(initialForm);
        }
      } catch (loadError) {
        if (!cancelled) {
          toast.error(loadError instanceof Error ? loadError.message : "Unable to load banner");
          if (mode === "edit" && bannerId) setFormData(normalizeBannerForm({ id: bannerId }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitialState();

    return () => {
      cancelled = true;
    };
  }, [bannerId, initialForm, mode]);

  function updateValue(key: keyof BannerFormValue, value: string) {
    setFormData((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSelectedFileName(file.name);
      updateValue("image", await fileToDataUrl(file));
    } catch {
      setError("Unable to preview selected image");
    }
  }

  async function saveBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (mode === "add" && formData.position === "popup" && popupLimitReached) {
      setError("You can only create one popup banner at a time!");
      return;
    }

    if (mode === "add" && !formData.image) {
      setError("Please select an image first");
      return;
    }

    setError("");
    setSaving(true);

    try {
      if (mode === "add") {
        await createBanner(formData);
      } else {
        await updateBanner(formData);
      }

      toast.success("Banner has been saved!");
      router.push("/content-management/banners");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Failed to save banner");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New Banner" : "Edit Banner"}
        </h2>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading Please wait....</div>
      ) : (
        <form className="space-y-5 p-5" onSubmit={(event) => void saveBanner(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Title" value={formData.title} onChange={(value) => updateValue("title", value)} />
            <SelectField
              label="Banner Type"
              value={formData.bannerType}
              options={[["sport", "Sport"], ["registration", "Registration"]]}
              onChange={(value) => updateValue("bannerType", value)}
            />
            <SelectField
              label="Target"
              value={formData.target}
              options={[["web", "Web"], ["mobile", "Mobile"]]}
              onChange={(value) => updateValue("target", value)}
            />
            <SelectField
              label="Position"
              value={formData.position}
              options={[["popup", "Pop Up"], ["slider", "Slider"]]}
              onChange={(value) => updateValue("position", value)}
            />
            <TextField label="Link" value={formData.link} onChange={(value) => updateValue("link", value)} />
          </div>

          <input type="hidden" value={formData.content} readOnly />
          <input type="hidden" value={formData.clientId} readOnly />
          <input type="hidden" value={formData.id ?? ""} readOnly />

          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              {formData.image ? (
                <img src={formData.image} alt="Banner preview" className="h-28 w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  Choose File
                </Button>
                <input
                  value={formData.image}
                  onChange={(event) => updateValue("image", event.target.value)}
                  placeholder="Existing image URL or uploaded preview"
                  className="h-11 min-w-72 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
              {selectedFileName ? <p className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedFileName}</p> : null}
            </div>
          </div>

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{error}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Link
              href="/content-management/banners"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}
