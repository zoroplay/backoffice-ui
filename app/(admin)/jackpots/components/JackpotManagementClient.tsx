"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import type { JackpotManagementDetails, JackpotManagementFixture } from "./jackpotData";
import {
  defaultJackpotManagementDetails,
  jackpotManagementFixtures,
  jackpotManagementSearchFixtures,
} from "./jackpotData";

type DetailErrors = Record<"title" | "description" | "stake" | "endDate", string>;
const detailErrorKeys: (keyof DetailErrors)[] = ["title", "description", "stake", "endDate"];

function getErrors(details: JackpotManagementDetails): DetailErrors {
  return {
    title: details.title.trim() ? "" : "Title is required",
    description: details.description.trim() ? "" : "Description is required",
    stake: details.stake.trim() ? "" : "Stake amount is required",
    endDate: details.endDate.trim() ? "" : "Please enter an expiry date",
  };
}

export default function JackpotManagementClient() {
  const [details, setDetails] = useState<JackpotManagementDetails>(defaultJackpotManagementDetails);
  const [fixtures, setFixtures] = useState<JackpotManagementFixture[]>(jackpotManagementFixtures);
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<DetailErrors>(getErrors(defaultJackpotManagementDetails));
  const [detailsMessage, setDetailsMessage] = useState("");
  const [fixturesMessage, setFixturesMessage] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return jackpotManagementSearchFixtures
      .filter((fixture) => `${fixture.eventId} ${fixture.eventName}`.toLowerCase().includes(needle))
      .filter((fixture) => !fixtures.some((selected) => selected.eventId === fixture.eventId))
      .slice(0, 6);
  }, [fixtures, query]);

  function updateDetail(key: keyof JackpotManagementDetails, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
    const detailKey = key as keyof DetailErrors;
    if (detailErrorKeys.includes(detailKey)) {
      setErrors((current) => ({ ...current, [detailKey]: "" }));
    }
  }

  function addFixture(fixture: JackpotManagementFixture) {
    setFixtures((current) => [...current, fixture]);
    setQuery("");
    setFixturesMessage("");
  }

  function saveDetails() {
    const nextErrors = getErrors(details);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setDetailsMessage("");
      return;
    }
    setDetailsMessage("Ready to POST /admin/content-management/save-jackpot-data.");
  }

  function saveFixtures() {
    setFixturesMessage("Ready to POST /admin/content-management/save-jackpot-fixtures.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Jackpot Details</h2>
        </div>
        <form className="space-y-5 p-5">
          <DetailField label="Title" error={errors.title} required>
            <input value={details.title} onChange={(event) => updateDetail("title", event.target.value)} className={inputClass(errors.title)} />
          </DetailField>
          <DetailField label="Description" error={errors.description} required>
            <textarea
              rows={10}
              value={details.description}
              onChange={(event) => updateDetail("description", event.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-900 dark:text-white ${
                errors.description ? "border-red-300 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
              }`}
            />
          </DetailField>
          <DetailField label="Stake Amount" error={errors.stake} required>
            <input value={details.stake} onChange={(event) => updateDetail("stake", event.target.value)} inputMode="decimal" className={inputClass(errors.stake)} />
          </DetailField>
          <DetailField label="Expiry Date" error={errors.endDate} required>
            <input
              value={details.endDate}
              onChange={(event) => updateDetail("endDate", event.target.value)}
              placeholder="YYYY-MM-DD HH:mm"
              className={inputClass(errors.endDate)}
            />
          </DetailField>
          <DetailField label="Status">
            <select
              value={details.status}
              onChange={(event) => updateDetail("status", event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="1">Enable</option>
              <option value="0">Disable</option>
            </select>
          </DetailField>

          {detailsMessage ? (
            <div className="rounded-md bg-success-50 px-3 py-2 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-300">
              {detailsMessage}
            </div>
          ) : null}

          <button type="button" onClick={saveDetails} className="w-full rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
            Save
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Manage Fixtures</h2>
        </div>
        <div className="space-y-5 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type event name to add to list"
              className="h-11 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {results.length ? (
              <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {results.map((fixture) => (
                  <button
                    key={fixture.eventId}
                    type="button"
                    onClick={() => addFixture(fixture)}
                    className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{fixture.eventId}</span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">{fixture.team1} vs {fixture.team2}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {fixtures.map((fixture, index) => (
                  <tr key={`${fixture.eventId}-${index}`}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fixture.eventName}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Remove ${fixture.eventName}`}
                        onClick={() => setFixtures((current) => current.filter((_, fixtureIndex) => fixtureIndex !== index))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!fixtures.length ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No fixtures selected
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {fixtures.length ? (
            <button type="button" onClick={saveFixtures} className="w-full rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
              Save
            </button>
          ) : null}
          {fixturesMessage ? (
            <div className="rounded-md bg-success-50 px-3 py-2 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-300">
              {fixturesMessage}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function DetailField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required ? <span className="text-red-500">*</span> : null}
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

function inputClass(error?: string) {
  return `h-10 w-full rounded-md border px-3 text-sm dark:bg-gray-900 dark:text-white ${
    error ? "border-red-300 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
  }`;
}
