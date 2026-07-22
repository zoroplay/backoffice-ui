"use client";

import { useMemo, useState } from "react";

type ContentPageEditorValue = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  target: "web" | "mobile";
  createdBy: string;
};

const blankPage: ContentPageEditorValue = {
  title: "",
  slug: "",
  content: "",
  target: "web",
  createdBy: "Current Admin",
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function ContentPageEditorClient({
  mode,
  initialValue,
}: {
  mode: "add" | "edit";
  initialValue?: Partial<ContentPageEditorValue>;
}) {
  const initial = useMemo(() => ({ ...blankPage, ...initialValue }), [initialValue]);
  const [formData, setFormData] = useState<ContentPageEditorValue>(initial);
  const [titleError, setTitleError] = useState("");

  function updateValue(key: keyof ContentPageEditorValue, value: string) {
    setFormData((current) => ({
      ...current,
      [key]: value,
      slug: key === "title" ? slugify(value) : current.slug,
    }));
    if (key === "title") setTitleError("");
  }

  function savePage() {
    if (!formData.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError("");
  }

  function resetForm() {
    setFormData(initial);
    setTitleError("");
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New" : "Edit Page"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "add"
            ? "POST /admin/content-management/create-page"
            : "PUT /admin/content-management/page"}
        </p>
      </div>
      <form className="space-y-5 p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title <span className="text-red-500">*</span>
          <input
            value={formData.title}
            onChange={(event) => updateValue("title", event.target.value)}
            placeholder="Enter page title"
            className={`mt-2 h-10 w-full rounded-md border px-3 text-sm dark:bg-gray-900 ${
              titleError ? "border-red-300 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
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
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target
            <select
              value={formData.target}
              onChange={(event) => updateValue("target", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
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
            className="mt-2 min-h-56 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          <div>createdBy: <span className="font-mono">{formData.createdBy}</span></div>
          <div className="mt-1">clientId: <span className="font-mono">process.env.clientId</span></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={savePage} className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
            Save
          </button>
          <button type="button" onClick={resetForm} className="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
