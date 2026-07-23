"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { getStoredToken } from "@/utils/session";
import { withAuth } from "@/utils/withAuth";

type AnyRecord = Record<string, any>;

type SportOption = {
  sport_id?: string | number;
  sportId?: string | number;
  id?: string | number;
  sport_name?: string;
  sportName?: string;
  name?: string;
};

type TournamentOption = {
  tournament_id?: string | number;
  tournamentID?: string | number;
  id?: string | number;
  name?: string;
  tournament_name?: string;
  tournamentName?: string;
};

type TopTournament = {
  id?: string | number;
  tournament_name?: string;
  tournamentName?: string;
  name?: string;
  source?: string;
  priority?: string | number;
};

type FormState = {
  sportId: string;
  tournamentId: string;
  source: string;
  priority: string;
};

const platformOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

const blankForm: FormState = {
  sportId: "",
  tournamentId: "",
  source: "web",
  priority: "100",
};

function fixtureBase() {
  return (
    process.env.NEXT_PUBLIC_FIXTURE_API ||
    process.env.NEXT_PUBLIC_FIXTURE_API_URL ||
    process.env.NEXT_PUBLIC_BETTING_API ||
    process.env.NEXT_PUBLIC_BETTING_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    ""
  ).replace(/\/+$/, "");
}

function fixtureUrl(path: string) {
  return `${fixtureBase()}/${path.replace(/^\/+/, "")}`;
}

function authHeaders(json = true) {
  const headers: Record<string, string> = {
    "client-code": process.env.NEXT_PUBLIC_CLIENT_CODE ?? "",
    "SBE-Client-ID": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
    "sbe-client-id": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
  };
  const token = getStoredToken();

  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = token;
  return headers;
}

async function requestFixture<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(fixtureUrl(path), {
    ...init,
    headers: {
      ...authHeaders(init?.body instanceof FormData ? false : true),
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || body?.error || `Request failed with status ${response.status}`);
  }

  return body as T;
}

function listFrom(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value;
  const record = value && typeof value === "object" ? (value as AnyRecord) : {};
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.data?.data)) return record.data.data;
  return [];
}

function sportId(sport: SportOption) {
  return String(sport.sport_id ?? sport.sportId ?? sport.id ?? "");
}

function sportLabel(sport: SportOption) {
  return String(sport.sport_name ?? sport.sportName ?? sport.name ?? sportId(sport) ?? "-");
}

function tournamentId(tournament: TournamentOption) {
  return String(tournament.tournament_id ?? tournament.tournamentID ?? tournament.id ?? "");
}

function tournamentLabel(tournament: TournamentOption | TopTournament) {
  return String(tournament.tournament_name ?? tournament.tournamentName ?? tournament.name ?? tournamentId(tournament as TournamentOption) ?? "-");
}

function topTournamentId(item: TopTournament) {
  return String(item.id ?? "");
}

function isCreated(value: unknown) {
  const record = value && typeof value === "object" ? (value as AnyRecord) : {};
  return record.status_code === 201 || record.success === true;
}

function isDeleted(value: unknown) {
  const record = value && typeof value === "object" ? (value as AnyRecord) : {};
  return record.status_code === 200 || record.success === true;
}

function TopBetsPage() {
  const [topTournaments, setTopTournaments] = useState<TopTournament[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [form, setForm] = useState<FormState>(blankForm);
  const [loading, setLoading] = useState(true);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const selectedSport = useMemo(
    () => sports.find((sport) => sportId(sport) === form.sportId) ?? null,
    [form.sportId, sports]
  );

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournamentId(tournament) === form.tournamentId) ?? null,
    [form.tournamentId, tournaments]
  );

  const loadTopBets = useCallback(async () => {
    const body = await requestFixture<any>("/top_tournament");
    setTopTournaments(listFrom(body) as TopTournament[]);
  }, []);

  const loadSports = useCallback(async () => {
    const body = await requestFixture<any>("/sports");
    setSports(listFrom(body) as SportOption[]);
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadTopBets(), loadSports()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setLoading(false);
    }
  }, [loadSports, loadTopBets]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  async function loadTournaments(nextSportId: string) {
    setForm((current) => ({ ...current, sportId: nextSportId, tournamentId: "" }));
    setTournaments([]);

    if (!nextSportId) return;

    setLoadingTournaments(true);
    try {
      const body = await requestFixture<any>(`/tournaments/${nextSportId}`);
      setTournaments(listFrom(body) as TournamentOption[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load tournaments");
    } finally {
      setLoadingTournaments(false);
    }
  }

  async function saveTopBet(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedSport || !selectedTournament) {
      toast.error("Select sport and tournament");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sport_id: Number(form.sportId) || form.sportId,
        tournament_id: Number(form.tournamentId) || form.tournamentId,
        source: form.source,
        priority: Number.parseInt(form.priority, 10) || 0,
      };
      const body = await requestFixture<any>("/top_tournament", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!isCreated(body)) {
        toast.error("An error occured");
        return;
      }

      toast.success(`${tournamentLabel(selectedTournament)} has been added to top bets`);
      setForm(blankForm);
      setTournaments([]);
      await loadTopBets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setSaving(false);
    }
  }

  async function removeTopBet(item: TopTournament) {
    const id = topTournamentId(item);
    if (!id) {
      toast.error("Unable to determine top bet id");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    setRemovingId(id);
    try {
      const body = await requestFixture<any>(`/top_tournament/${id}`, { method: "DELETE" });

      if (!isDeleted(body)) {
        toast.error("An error occured");
        return;
      }

      toast.success("Item has been removed");
      setTopTournaments((current) => current.filter((topBet) => topTournamentId(topBet) !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setRemovingId("");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Top Bets" />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Top Tournaments</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tournaments currently promoted as top bets.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadInitialData()} disabled={loading} startIcon={<RefreshCw size={16} />}>
              Refresh
            </Button>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-5">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading top bets...</div>
            ) : topTournaments.length ? (
              <ul className="space-y-3">
                {topTournaments.map((topBet) => {
                  const id = topTournamentId(topBet);
                  return (
                    <li key={id || tournamentLabel(topBet)} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800">
                      <div>
                        <h2 className="text-sm font-semibold text-brand-600 dark:text-brand-300">{tournamentLabel(topBet)}</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Platform: {String(topBet.source || "-")}</p>
                        {topBet.priority !== undefined ? (
                          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Priority: {String(topBet.priority)}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        disabled={removingId === id}
                        onClick={() => void removeTopBet(topBet)}
                      >
                        <Trash2 size={14} />
                        {removingId === id ? "Removing..." : "Remove"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No record found
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Tournament to Top Bet</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select a sport, load its tournaments, then set platform and priority.
            </p>
          </div>

          <form className="space-y-5 p-5" onSubmit={saveTopBet}>
            <div>
              <Label>Sports</Label>
              <select
                value={form.sportId}
                onChange={(event) => void loadTournaments(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Sports</option>
                {sports.map((sport) => (
                  <option key={sportId(sport)} value={sportId(sport)}>
                    {sportLabel(sport)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Tournament</Label>
              <select
                value={form.tournamentId}
                onChange={(event) => setForm((current) => ({ ...current, tournamentId: event.target.value }))}
                disabled={!form.sportId || loadingTournaments}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">{loadingTournaments ? "Loading tournaments..." : "Select League"}</option>
                {tournaments.map((tournament) => (
                  <option key={tournamentId(tournament)} value={tournamentId(tournament)}>
                    {tournamentLabel(tournament)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Platform</Label>
              <select
                value={form.source}
                onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {platformOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default withAuth(TopBetsPage);
