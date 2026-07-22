"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";

import type { JackpotBonus, JackpotCampaign, JackpotFixture } from "./jackpotData";
import { campaignFixtureLookup, jackpotCampaigns } from "./jackpotData";

type JackpotCampaignDraft = {
  id?: string;
  title: string;
  amount: string;
  stake: string;
  agentCommission: string;
  terms: string;
  fixtures: JackpotFixture[];
  bonuses: JackpotBonus[];
};

type CampaignFieldErrors = ReturnType<typeof requiredErrors>;

const blankDraft: JackpotCampaignDraft = {
  title: "",
  amount: "",
  stake: "",
  agentCommission: "",
  terms: "",
  fixtures: [],
  bonuses: [],
};

const editableFieldKeys: (keyof CampaignFieldErrors)[] = ["title", "amount", "stake", "agentCommission"];

function campaignToDraft(campaign?: JackpotCampaign, fallbackId?: string): JackpotCampaignDraft {
  if (!campaign) return { ...blankDraft, id: fallbackId };
  return {
    id: campaign.id,
    title: campaign.title,
    amount: String(campaign.amount),
    stake: String(campaign.stake),
    agentCommission: String(campaign.agentCommission),
    terms: campaign.terms,
    fixtures: campaign.fixtures,
    bonuses: campaign.bonuses,
  };
}

function requiredErrors(draft: JackpotCampaignDraft) {
  return {
    title: draft.title.trim() ? "" : "Title is required",
    amount: draft.amount.trim() ? "" : "Amount is required",
    stake: draft.stake.trim() ? "" : "Stake is required",
    agentCommission: draft.agentCommission.trim() ? "" : "Agent commission is required",
  };
}

export default function JackpotCampaignEditorClient({
  mode,
  jackpotId,
}: {
  mode: "add" | "edit";
  jackpotId?: string;
}) {
  const initialDraft = useMemo(
    () => campaignToDraft(jackpotCampaigns.find((campaign) => campaign.id === jackpotId), jackpotId),
    [jackpotId],
  );
  const [draft, setDraft] = useState<JackpotCampaignDraft>(initialDraft);
  const [fixtureId, setFixtureId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CampaignFieldErrors>({
    title: "",
    amount: "",
    stake: "",
    agentCommission: "",
  });
  const [lookupMessage, setLookupMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  function updateDraft(key: keyof JackpotCampaignDraft, value: string | JackpotFixture[] | JackpotBonus[]) {
    setDraft((current) => ({ ...current, [key]: value }));
    const fieldKey = key as keyof CampaignFieldErrors;
    if (editableFieldKeys.includes(fieldKey)) {
      setFieldErrors((current) => ({ ...current, [fieldKey]: "" }));
    }
  }

  function findFixture(nextFixtureId: string) {
    setFixtureId(nextFixtureId);
    setLookupMessage("");
    if (nextFixtureId.length !== 4) return;

    const fixture = campaignFixtureLookup.find((item) => item.providerId === nextFixtureId);
    if (!fixture) {
      setLookupMessage("Fixture not found");
      setFixtureId("");
      return;
    }

    if (draft.fixtures.some((item) => item.providerId === fixture.providerId)) {
      setLookupMessage("Fixture already added");
      setFixtureId("");
      return;
    }

    updateDraft("fixtures", [...draft.fixtures, fixture]);
    setFixtureId("");
  }

  function removeFixture(index: number) {
    updateDraft("fixtures", draft.fixtures.filter((_, fixtureIndex) => fixtureIndex !== index));
  }

  function addBonus() {
    updateDraft("bonuses", [...draft.bonuses, { lostGames: 0, amount: 0 }]);
  }

  function removeBonus(index: number) {
    updateDraft("bonuses", draft.bonuses.filter((_, bonusIndex) => bonusIndex !== index));
  }

  function updateBonus(index: number, key: keyof JackpotBonus, value: string) {
    updateDraft(
      "bonuses",
      draft.bonuses.map((bonus, bonusIndex) =>
        bonusIndex === index ? { ...bonus, [key]: Number(value) || 0 } : bonus,
      ),
    );
  }

  function saveCampaign() {
    const errors = requiredErrors(draft);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setSaveMessage("");
      return;
    }

    const fixturePayload = draft.fixtures.map((fixture) => fixture.providerId).join(",");
    setSaveMessage(
      `Ready to submit ${mode === "add" ? "CMS.storeJackpot" : "CMS.storeJackpot update"} with fixtures="${fixturePayload}".`,
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {mode === "add" ? "Add New" : "Edit Jackpot"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {mode === "add"
            ? "Create a jackpot campaign with required commercial settings, fixture lookup, terms, and consolation bonuses."
            : "Update campaign settings, selected fixtures, and terms for this jackpot."}
        </p>
      </div>

      <form className="space-y-6 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" error={fieldErrors.title} required>
            <input
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className={inputClass(fieldErrors.title)}
            />
          </Field>
          <Field label="Amount" error={fieldErrors.amount} required>
            <input
              value={draft.amount}
              onChange={(event) => updateDraft("amount", event.target.value)}
              inputMode="decimal"
              className={inputClass(fieldErrors.amount)}
            />
          </Field>
          <Field label="Stake" error={fieldErrors.stake} required>
            <input
              value={draft.stake}
              onChange={(event) => updateDraft("stake", event.target.value)}
              inputMode="decimal"
              className={inputClass(fieldErrors.stake)}
            />
          </Field>
          <Field label="Agent Commission on Stake" error={fieldErrors.agentCommission} required>
            <input
              value={draft.agentCommission}
              onChange={(event) => updateDraft("agentCommission", event.target.value)}
              inputMode="decimal"
              className={inputClass(fieldErrors.agentCommission)}
            />
          </Field>
        </div>

        <Field label="Terms">
          <textarea
            value={draft.terms}
            onChange={(event) => updateDraft("terms", event.target.value)}
            className="min-h-40 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </Field>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Fixtures</h2>
          </div>
          <div className="space-y-4 p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {["Events", "Start Time", ""].map((head) => (
                      <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                  {draft.fixtures.map((fixture, index) => (
                    <tr key={fixture.providerId}>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fixture.eventName}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fixture.schedule}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          aria-label={`Remove ${fixture.eventName}`}
                          onClick={() => removeFixture(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!draft.fixtures.length ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Search for events and add
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Find fixture</div>
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={fixtureId}
                  onChange={(event) => findFixture(event.target.value)}
                  maxLength={4}
                  placeholder="Enter fixture Id"
                  className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>
            {lookupMessage ? <p className="text-sm text-red-500">{lookupMessage}</p> : null}
          </div>
        </div>

        {mode === "add" ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Bonuses</h2>
              <button type="button" onClick={addBonus} className="inline-flex items-center gap-2 text-sm font-medium text-success-600">
                <Plus size={16} />
                Add Bonus
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {["No. of Lost Games", "Amount", ""].map((head) => (
                      <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                  {draft.bonuses.map((bonus, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <input
                          value={bonus.lostGames}
                          onChange={(event) => updateBonus(index, "lostGames", event.target.value)}
                          className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={bonus.amount}
                          onChange={(event) => updateBonus(index, "amount", event.target.value)}
                          className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          inputMode="decimal"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          aria-label="Remove bonus"
                          onClick={() => removeBonus(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!draft.bonuses.length ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No bonuses configured
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {saveMessage ? (
          <div className="rounded-md bg-success-50 px-3 py-2 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-300">
            {saveMessage}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={saveCampaign}
            className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600"
          >
            Save
          </button>
          <Link
            href="/jackpots"
            className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({
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
