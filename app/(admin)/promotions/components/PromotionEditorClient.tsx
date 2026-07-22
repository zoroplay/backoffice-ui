"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { withAuth } from "@/utils/withAuth";

import type { PromotionFormValues } from "../types";

const addTypeOptions = [
  ["web", "Web"],
  ["mobile", "Mobile"],
];

const editTypeOptions = [
  ["sport_web", "Sport (Web)"],
  ["casino_mobile", "Casino (Mobile)"],
  ["sport_mobile", "Sport (Mobile)"],
  ["casino_web", "Casino (Web)"],
];

const defaultValues: PromotionFormValues = {
  title: "",
  type: "web",
  platform: "web",
  targetUrl: "",
  startDate: "",
  endDate: "",
  status: "draft",
  image: "",
  description: "",
};

function PromotionEditorClient({
  mode,
  initialValues,
  promotionId,
}: {
  mode: "add" | "edit";
  initialValues?: Partial<PromotionFormValues>;
  promotionId?: string;
}) {
  const [values, setValues] = useState<PromotionFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [targetUrlError, setTargetUrlError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function updateValue(key: keyof PromotionFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [key]: value,
      platform: key === "type" && (value === "web" || value === "mobile") ? value : current.platform,
    }));
    if (key === "targetUrl") setTargetUrlError("");
  }

  function resetForm() {
    setValues({
      ...defaultValues,
      ...initialValues,
    });
    setTargetUrlError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setValues((current) => ({
        ...current,
        image: String(reader.result ?? ""),
      }));
    };
    reader.readAsDataURL(file);
  }

  function savePromotion() {
    if (!values.targetUrl.includes("http")) {
      setTargetUrlError("Invalid Target URL");
      return;
    }
    setTargetUrlError("");
  }

  const typeOptions = mode === "add" ? addTypeOptions : editTypeOptions;

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New Promotion" : `Update Promotion${promotionId ? ` #${promotionId}` : ""}`}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          CMS contract: <span className="font-mono">{mode === "add" ? "createPromotion(FormData)" : "updatePromotion(FormData)"}</span>
        </p>
      </div>

      <form className="space-y-6 p-5">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span className="text-red-500">*</span>
            <input
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              placeholder="Enter promotion title"
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
            {values.image ? (
              <img src={values.image} alt="Promotion preview" className="h-28 w-full rounded-md object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
              >
                Choose File
              </button>
              <input
                value={values.image}
                onChange={(event) => updateValue("image", event.target.value)}
                placeholder="Image URL or uploaded preview"
                className="h-10 min-w-72 flex-1 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Page Content
          <textarea
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            placeholder="Promotion content"
            className="mt-2 min-h-44 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === "add" ? "Platform" : "Type"}
            <select
              value={values.type}
              onChange={(event) => updateValue("type", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {typeOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
            <input
              type="date"
              value={values.startDate}
              onChange={(event) => updateValue("startDate", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
            <input
              type="date"
              value={values.endDate}
              onChange={(event) => updateValue("endDate", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Target URL <span className="text-red-500">*</span>
          <input
            value={values.targetUrl}
            onChange={(event) => updateValue("targetUrl", event.target.value)}
            placeholder={mode === "add" ? "https://example.com" : "Enter promotion target URL"}
            className={`mt-2 h-10 w-full rounded-md border px-3 text-sm dark:bg-gray-900 ${
              targetUrlError
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
          />
          {targetUrlError ? <span className="mt-1 block text-xs text-red-500">{targetUrlError}</span> : null}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={savePromotion}
            className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default withAuth(PromotionEditorClient);
