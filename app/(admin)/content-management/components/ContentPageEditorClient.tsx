"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";
import {
  createContentPage,
  defaultContentPageForm,
  fetchContentPage,
  normalizePageForm,
  slugifyPageTitle,
  updateContentPage,
  type ContentPageFormValue,
} from "../pages/api";

type ContentPageEditorProps = {
  mode: "add" | "edit";
  pageId?: string;
};

function blankForm() {
  return normalizePageForm(defaultContentPageForm);
}

export default function ContentPageEditorClient({ mode, pageId }: ContentPageEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ContentPageFormValue>(() => ({
    ...blankForm(),
    id: pageId,
  }));
  const [titleError, setTitleError] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const initialForm = useMemo(
    () => ({
      ...blankForm(),
      id: pageId,
    }),
    [pageId]
  );

  useEffect(() => {
    if (mode === "add") {
      setFormData(initialForm);
      setLoading(false);
      return;
    }

    if (!pageId) return;

    let cancelled = false;
    setLoading(true);

    fetchContentPage(pageId)
      .then((page) => {
        if (cancelled) return;
        setFormData(normalizePageForm(page ?? { id: pageId }));
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(error instanceof Error ? error.message : "Unable to load page");
        setFormData(normalizePageForm({ id: pageId }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialForm, mode, pageId]);

  function updateValue(key: keyof ContentPageFormValue, value: string) {
    setFormData((current) => ({
      ...current,
      [key]: value,
      slug: key === "title" ? slugifyPageTitle(value) : current.slug,
    }));
    if (key === "title") setTitleError("");
  }

  async function savePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.title.trim()) {
      setTitleError("Title is required");
      return;
    }

    setTitleError("");
    setSaving(true);

    try {
      const payload = {
        ...formData,
        slug: slugifyPageTitle(formData.title),
      };

      if (mode === "add") {
        await createContentPage(payload);
        toast.success("New page has been created successfully.");
        router.push("/content-management/pages");
      } else {
        await updateContentPage(payload);
        toast.success("Page has been updated successfully.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setFormData(mode === "add" ? blankForm() : initialForm);
    setTitleError("");
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New" : "Edit Page"}
        </h2>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading Please wait....</div>
      ) : (
        <form className="space-y-5 p-5" onSubmit={(event) => void savePage(event)}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span className="text-red-500">*</span>
            <input
              value={formData.title}
              onChange={(event) => updateValue("title", event.target.value)}
              placeholder="Enter page title"
              className={`mt-2 h-10 w-full rounded-md border px-3 text-sm text-gray-800 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
                titleError
                  ? "border-red-300 focus:ring-red-500/10 dark:border-red-500"
                  : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700"
              }`}
            />
            {titleError ? <span className="mt-1 block text-xs text-red-500">{titleError}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug
              <input
                value={formData.slug}
                onChange={(event) => updateValue("slug", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target
              <select
                value={formData.target}
                onChange={(event) => updateValue("target", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page Content
            <textarea
              value={formData.content}
              onChange={(event) => updateValue("content", event.target.value)}
              className="mt-2 min-h-56 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <input type="hidden" value={formData.id ?? ""} readOnly />
          <input type="hidden" value={formData.clientId} readOnly />
          <input type="hidden" value={formData.createdBy} readOnly />

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
              Reset
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
