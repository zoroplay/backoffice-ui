"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import type { SureOdd } from "./contentManagementData";

const blankSureOdd: SureOdd = {
  id: "",
  title: "",
  amount: 0,
  description: "",
  imagePath: "",
};

export default function SureOddsEditorClient({
  initialValue,
  mode,
}: {
  initialValue?: Partial<SureOdd>;
  mode: "add" | "edit";
}) {
  const [formData, setFormData] = useState<SureOdd>({ ...blankSureOdd, ...initialValue });
  const fileRef = useRef<HTMLInputElement | null>(null);

  function updateValue(key: keyof SureOdd, value: string | number) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateValue("imagePath", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New" : "Edit Sure Odds"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Preserves title, amount, content, image preview/upload, save, and cancel behavior from Nuxt.
        </p>
      </div>
      <form className="space-y-5 p-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
          <input value={formData.title} onChange={(event) => updateValue("title", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
          <input value={formData.amount} onChange={(event) => updateValue("amount", Number(event.target.value))} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" inputMode="decimal" />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
          <textarea value={formData.description} onChange={(event) => updateValue("description", event.target.value)} className="mt-2 min-h-44 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
        </label>

        <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
            {formData.imagePath ? (
              <img src={formData.imagePath} alt="Sure odds preview" className="h-28 w-full rounded-md object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">No image</div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Choose File</button>
              <input value={formData.imagePath} onChange={(event) => updateValue("imagePath", event.target.value)} className="h-10 min-w-72 flex-1 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">Save</button>
          <Link href="/content-management/sure-odds" className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium dark:border-gray-700">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
