"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

type BannerEditorValue = {
  id?: string;
  title: string;
  bannerType: "sport" | "registration";
  target: "web" | "mobile";
  position: "popup" | "slider";
  link: string;
  content: string;
  image: string;
  sport: string;
  category: string;
  tournament: string;
  event: string;
};

const blankBanner: BannerEditorValue = {
  title: "",
  bannerType: "sport",
  target: "web",
  position: "slider",
  link: "",
  content: "",
  image: "",
  sport: "",
  category: "",
  tournament: "",
  event: "",
};

const sports = ["Soccer", "Basketball", "Tennis"];
const categories = ["England", "Spain", "Italy"];
const tournaments = ["Premier League", "La Liga", "Serie A"];
const fixtures = ["Arsenal vs Chelsea", "Real Madrid vs Barcelona", "Inter vs Juventus"];

export default function BannerEditorClient({
  mode,
  initialValue,
}: {
  mode: "add" | "edit";
  initialValue?: Partial<BannerEditorValue>;
}) {
  const [formData, setFormData] = useState<BannerEditorValue>({ ...blankBanner, ...initialValue });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  function updateValue(key: keyof BannerEditorValue, value: string) {
    setFormData((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => updateValue("image", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function saveBanner() {
    if (mode === "add" && !formData.image) {
      setError("Please select an image first");
      return;
    }
    if (formData.position === "popup" && mode === "add") {
      setError("Popup banner limit should be checked before create");
      return;
    }
    setError("");
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New Banner" : "Edit Banner"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "add"
            ? "Uploads image, then POSTs /admin/content-management/create-banner"
            : "Optionally uploads a new image, then PUTs /admin/content-management/banner"}
        </p>
      </div>

      <form className="space-y-5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" value={formData.title} onChange={(value) => updateValue("title", value)} />
          <SelectField label="Banner Type" value={formData.bannerType} options={[["sport", "Sport"], ["registration", "Registration"]]} onChange={(value) => updateValue("bannerType", value)} />
          <SelectField label="Target" value={formData.target} options={[["web", "Web"], ["mobile", "Mobile"]]} onChange={(value) => updateValue("target", value)} />
          <SelectField label="Position" value={formData.position} options={[["popup", "Pop Up"], ["slider", "Slider"]]} onChange={(value) => updateValue("position", value)} />
          <TextField label="Link" value={formData.link} onChange={(value) => updateValue("link", value)} />
          <TextField label="Content" value={formData.content} onChange={(value) => updateValue("content", value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
            {formData.image ? (
              <img src={formData.image} alt="Banner preview" className="h-28 w-full rounded-md object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">No image</div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Choose File</button>
              <input value={formData.image} onChange={(event) => updateValue("image", event.target.value)} className="h-10 min-w-72 flex-1 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </div>
            {selectedFileName ? <p className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedFileName}</p> : null}
          </div>
        </div>

        {formData.bannerType === "sport" ? (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add Competition</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SelectField label="Sport" value={formData.sport} options={sports.map((item) => [item, item])} onChange={(value) => updateValue("sport", value)} />
              <SelectField label="Category" value={formData.category} options={categories.map((item) => [item, item])} onChange={(value) => updateValue("category", value)} />
              <SelectField label="Tournament" value={formData.tournament} options={tournaments.map((item) => [item, item])} onChange={(value) => updateValue("tournament", value)} />
              <SelectField label="Fixture" value={formData.event} options={fixtures.map((item) => [item, item])} onChange={(value) => updateValue("event", value)} />
            </div>
          </div>
        ) : null}

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={saveBanner} className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
            Save
          </button>
          <Link href="/content-management/banners" className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium dark:border-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
        <option value="">Select</option>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}
