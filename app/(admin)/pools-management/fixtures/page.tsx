"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { getStoredToken } from "@/utils/session";
import { withAuth } from "@/utils/withAuth";

const POOL_SIZE = 49;
const SPORT_ID = 1;

type DateOption = {
  key: string;
  week: string;
  start: string;
  end: string;
  date: string;
};

type Tournament = {
  id?: string | number;
  tournament_id?: string | number;
  tournamentID?: string | number;
  name?: string;
  tournament?: string;
  tournamentName?: string;
  tournament_name?: string;
  category_name?: string;
  categoryName?: string;
  country?: string;
  games?: string | number;
};

type FixtureOption = {
  id?: string | number;
  matchID?: string | number;
  matchId?: string | number;
  match_id?: string | number;
  fixtureID?: string | number;
  fixture_id?: string | number;
  event_id?: string | number;
  gameID?: string | number;
  game_id?: string | number;
  provider_id?: string | number;
  name?: string;
  eventName?: string;
  event_name?: string;
  matchTitle?: string;
  match_name?: string;
  homeTeam?: string;
  home_team?: string;
  home?: string;
  awayTeam?: string;
  away_team?: string;
  away?: string;
  date?: string;
  eventDate?: string;
  event_date?: string;
  kickoffTime?: string;
};

type FixtureRow = {
  tournament: Tournament | null;
  event: FixtureOption | null;
  eventOptions: FixtureOption[];
  loadingEvents: boolean;
  gameID: string;
  matchID: string;
  eventDate: string;
  eventTime: string;
};

type CurrentPoolFixture = {
  id?: string | number;
  poolNumber?: string | number;
  categoryName?: string;
  category_name?: string;
  tournamentName?: string;
  tournament_name?: string;
  matchId?: string | number;
  matchName?: string;
  kickoffTime?: string;
  matchStatus?: string;
  resultStatus?: string;
};

type CurrentPool = {
  id?: string | number;
  name?: string;
  status?: string;
  fixtureCount?: number;
  firstKickoff?: string;
  lockTime?: string;
  createdByUsername?: string;
  publishedAt?: string;
  fixtures?: CurrentPoolFixture[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfIsoWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function endOfIsoWeek(date: Date) {
  const copy = startOfIsoWeek(date);
  copy.setDate(copy.getDate() + 6);
  return copy;
}

function buildDateOptions(): DateOption[] {
  return Array.from({ length: 4 }, (_, index) => {
    const current = new Date();
    current.setDate(current.getDate() - index * 7);
    const start = startOfIsoWeek(current);
    const end = endOfIsoWeek(current);

    return {
      key: `${current.getFullYear()}-${index}`,
      week: String(weekNumber(current)),
      start: isoDate(start),
      end: isoDate(end),
      date: `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    };
  });
}

function weekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function createEmptyFixtureRow(): FixtureRow {
  return {
    tournament: null,
    event: null,
    eventOptions: [],
    loadingEvents: false,
    gameID: "",
    matchID: "",
    eventDate: "",
    eventTime: "",
  };
}

function createEmptyFixtures() {
  return Array.from({ length: POOL_SIZE }, () => createEmptyFixtureRow());
}

function normalizeList(value: any) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
}

function configuredBase(key: string) {
  const values: Record<string, string | undefined> = {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_BETTING_API: process.env.NEXT_PUBLIC_BETTING_API,
    NEXT_PUBLIC_BETTING_API_URL: process.env.NEXT_PUBLIC_BETTING_API_URL,
    NEXT_PUBLIC_FIXTURE_API: process.env.NEXT_PUBLIC_FIXTURE_API,
    NEXT_PUBLIC_FIXTURE_API_URL: process.env.NEXT_PUBLIC_FIXTURE_API_URL,
  };

  return values[key]?.replace(/\/+$/, "") ?? "";
}

function envBase(...keys: string[]) {
  for (const key of keys) {
    const value = configuredBase(key);
    if (value) return value;
  }
  return "";
}

function relativeUrl(path: string) {
  const base = envBase("NEXT_PUBLIC_BASE_URL");
  return `${base}/${path.replace(/^\/+/, "")}`;
}

function externalUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function authHeaders(json = true) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "client-code": process.env.NEXT_PUBLIC_CLIENT_CODE ?? "",
    "SBE-Client-ID": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
    "sbe-client-id": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
  };

  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = token;

  return headers;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(init?.body instanceof FormData ? false : true),
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.message || body?.status_description || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

function getTournamentId(item: Tournament | null) {
  return String(item?.tournament_id ?? item?.tournamentID ?? item?.id ?? "");
}

function getMatchId(item: FixtureOption | FixtureRow | null) {
  if (!item) return "";
  const source = item as FixtureOption & FixtureRow;
  return String(source.matchID || source.matchId || source.match_id || source.fixtureID || source.fixture_id || source.event_id || "");
}

function getGameId(item: FixtureOption | null) {
  return String(item?.gameID ?? item?.game_id ?? item?.provider_id ?? item?.id ?? "");
}

function tournamentLabel(option: Tournament | null) {
  if (!option) return "";
  const category = option.category_name || option.categoryName || option.country || "";
  const name = option.name || option.tournament || option.tournamentName || option.tournament_name || "";
  return category ? `${category} - ${name}` : name || getTournamentId(option);
}

function eventLabel(option: FixtureOption | null) {
  if (!option) return "";
  const home = option.homeTeam || option.home_team || option.home || "";
  const away = option.awayTeam || option.away_team || option.away || "";
  return option.name || option.eventName || option.event_name || option.matchTitle || option.match_name || (home || away ? `${home} vs ${away}` : getMatchId(option));
}

function poolDivision(fixture: CurrentPoolFixture) {
  const category = fixture.categoryName || fixture.category_name || "";
  const tournament = fixture.tournamentName || fixture.tournament_name || "";
  return category ? `${category} - ${tournament}` : tournament || "-";
}

function datePart(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return isoDate(date);
}

function timePart(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${isoDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FixturesPage() {
  const fixtureBase = envBase("NEXT_PUBLIC_FIXTURE_API", "NEXT_PUBLIC_FIXTURE_API_URL");
  const bettingBase = envBase("NEXT_PUBLIC_BETTING_API", "NEXT_PUBLIC_BETTING_API_URL", "NEXT_PUBLIC_BASE_URL");
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";

  const [activeView, setActiveView] = useState<"current" | "create">("current");
  const [dateOptions] = useState<DateOption[]>(() => buildDateOptions());
  const [activeWeek, setActiveWeek] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [poolName, setPoolName] = useState("");
  const [fixtures, setFixtures] = useState<FixtureRow[]>(() => createEmptyFixtures());
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentPool, setCurrentPool] = useState<CurrentPool | null>(null);
  const [currentPoolError, setCurrentPoolError] = useState("");
  const [eventOptionsByTournamentId, setEventOptionsByTournamentId] = useState<Record<string, FixtureOption[]>>({});
  const [loadingCurrentPool, setLoadingCurrentPool] = useState(false);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const activeWeekOption = useMemo(
    () => dateOptions.find((option) => option.week === activeWeek) || dateOptions[0] || null,
    [activeWeek, dateOptions],
  );

  const selectedFixturesCount = useMemo(() => fixtures.filter((row) => Boolean(row.matchID)).length, [fixtures]);
  const duplicateMatchIds = useMemo(() => {
    const ids = fixtures.map((row) => row.matchID).filter(Boolean);
    return ids.filter((id, index) => ids.indexOf(id) !== index).filter((id, index, all) => all.indexOf(id) === index);
  }, [fixtures]);

  const currentPoolFixtures = Array.isArray(currentPool?.fixtures) ? currentPool.fixtures : [];
  const hasCurrentPool = Boolean(currentPool?.id);

  async function loadCurrentPool() {
    if (!bettingBase || !clientId) {
      setCurrentPool(null);
      setCurrentPoolError("Betting API or client ID is not configured.");
      return;
    }

    setLoadingCurrentPool(true);
    setCurrentPoolError("");

    try {
      const body = await requestJson<any>(externalUrl(bettingBase, `${clientId}/pools/current`));
      setCurrentPool(body?.data ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load current pool";
      setCurrentPool(null);
      setCurrentPoolError(message.includes("404") ? "" : message);
    } finally {
      setLoadingCurrentPool(false);
    }
  }

  async function loadTournaments(weekOption = activeWeekOption) {
    if (!fixtureBase || !weekOption) {
      setTournaments([]);
      if (!fixtureBase) toast.error("Fixture API is not configured");
      return;
    }

    setLoadingTournaments(true);
    try {
      const body = await requestJson<any>(
        externalUrl(fixtureBase, `tournaments/${SPORT_ID}?start=${weekOption.start}&end=${weekOption.end}`),
      );
      setTournaments(normalizeList(body).filter((item: Tournament) => Number(item.games ?? 0) > 0));
    } catch (error) {
      setTournaments([]);
      toast.error(error instanceof Error ? error.message : "Unable to load divisions");
    } finally {
      setLoadingTournaments(false);
    }
  }

  async function loadEventsForTournament(tournament: Tournament) {
    const tournamentId = getTournamentId(tournament);
    if (!fixtureBase || !activeWeekOption || !tournamentId) return [];

    if (eventOptionsByTournamentId[tournamentId]) {
      return eventOptionsByTournamentId[tournamentId];
    }

    const perPage = Math.max(Number(tournament.games ?? 0), 1);
    const body = await requestJson<any>(
      externalUrl(
        fixtureBase,
        `fixtures/${SPORT_ID}?page=1&per_page=${perPage}&market_ids=1&tournament_id=${tournamentId}&start=${activeWeekOption.start}&end=${activeWeekOption.end}`,
      ),
    );
    const events = normalizeList(body);
    setEventOptionsByTournamentId((current) => ({ ...current, [tournamentId]: events }));
    return events;
  }

  async function openCreatePoolView() {
    setActiveView("create");
    setPoolName("");
    setFixtures(createEmptyFixtures());
    setEventOptionsByTournamentId({});
    setLoadingFormData(true);
    await loadTournaments();
    setLoadingFormData(false);
  }

  async function selectTournament(rowIndex: number, tournamentId: string) {
    const tournament = tournaments.find((item) => getTournamentId(item) === tournamentId) ?? null;

    setFixtures((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              tournament,
              event: null,
              eventOptions: [],
              loadingEvents: Boolean(tournament),
              gameID: "",
              matchID: "",
              eventDate: "",
              eventTime: "",
            }
          : row,
      ),
    );

    if (!tournament) return;

    try {
      const events = await loadEventsForTournament(tournament);
      setFixtures((current) =>
        current.map((row, index) =>
          index === rowIndex
            ? {
                ...row,
                eventOptions: events,
                loadingEvents: false,
              }
            : row,
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load events");
      setFixtures((current) => current.map((row, index) => (index === rowIndex ? { ...row, eventOptions: [], loadingEvents: false } : row)));
    }
  }

  function selectEvent(rowIndex: number, matchId: string) {
    setFixtures((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) return row;
        const event = row.eventOptions.find((item) => getMatchId(item) === matchId) ?? null;
        const kickoff = event?.date || event?.eventDate || event?.event_date || event?.kickoffTime || "";

        return {
          ...row,
          event,
          gameID: getGameId(event),
          matchID: getMatchId(event),
          eventDate: datePart(kickoff),
          eventTime: timePart(kickoff),
        };
      }),
    );
  }

  function validateForm() {
    if (!poolName.trim()) return "Please enter a pool name";
    if (selectedFixturesCount !== POOL_SIZE) return `Exactly ${POOL_SIZE} fixtures must be selected`;
    if (duplicateMatchIds.length) return "Duplicate fixtures are not allowed";
    return "";
  }

  async function saveChanges(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting || !bettingBase || !clientId) return;

    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const body = await requestJson<any>(externalUrl(bettingBase, `${clientId}/pools`), {
        method: "POST",
        body: JSON.stringify({
          name: poolName.trim(),
          matchIds: fixtures.map((row) => Number(row.matchID)).filter(Boolean),
        }),
      });

      if (body?.status_code && Number(body.status_code) >= 400) {
        toast.error(body.status_description || "Unable to create pool");
        return;
      }

      toast.success(body?.status_description || "Pool created successfully");
      await loadCurrentPool();
      setActiveView("current");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create pool");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changeWeek(week: string) {
    const nextWeekOption = dateOptions.find((option) => option.week === week) || dateOptions[0] || null;
    setActiveWeek(week);
    setCurrentWeek(week);
    setEventOptionsByTournamentId({});
    setFixtures(createEmptyFixtures());
    await loadTournaments(nextWeekOption);
  }

  async function submitUpload() {
    if (!uploadFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("week", currentWeek);
      const body = await requestJson<any>(relativeUrl("/api/utilities/upload-pool-results"), {
        method: "POST",
        body: formData,
      });

      if (!body?.success) {
        toast.error(body?.message || "Unable to upload results");
        return;
      }

      toast.success("Results uploaded");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      await loadCurrentPool();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload results");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (dateOptions.length) {
      setActiveWeek(dateOptions[0].week);
      setCurrentWeek(dateOptions[0].week);
    }
  }, [dateOptions]);

  useEffect(() => {
    loadCurrentPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pool Fixtures" />

      {activeView === "current" ? (
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-brand-500 px-5 py-3 text-white dark:border-gray-800">
            <h2 className="text-base font-semibold">Current Pool</h2>
            {hasCurrentPool ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={openCreatePoolView}>
                  Create New Weekly Pool
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                  Upload Result
                </Button>
              </div>
            ) : null}
          </div>

          <div className="p-5">
            {loadingCurrentPool ? <div className="py-6 text-center text-gray-500 dark:text-gray-400">Loading current pool...</div> : null}
            {!loadingCurrentPool && currentPoolError ? <div className="text-sm text-red-600 dark:text-red-400">{currentPoolError}</div> : null}
            {!loadingCurrentPool && !currentPoolError && hasCurrentPool ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Info label="Name" value={currentPool?.name || "-"} />
                  <Info label="Status" value={currentPool?.status || "-"} />
                  <Info label="Fixtures" value={String(currentPool?.fixtureCount || currentPoolFixtures.length || 0)} />
                  <Info label="First Kickoff" value={dateTime(currentPool?.firstKickoff)} />
                  <Info label="Lock Time" value={dateTime(currentPool?.lockTime)} />
                  <Info label="Created By" value={currentPool?.createdByUsername || "-"} />
                  <Info label="Published At" value={dateTime(currentPool?.publishedAt)} />
                </div>
                <CurrentPoolTable fixtures={currentPoolFixtures} />
              </div>
            ) : null}
            {!loadingCurrentPool && !currentPoolError && !hasCurrentPool ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">No current pool.</p>
                <Button type="button" onClick={openCreatePoolView}>
                  Create New Weekly Pool
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-brand-500 px-5 py-3 text-white dark:border-gray-800">
            <h2 className="text-base font-semibold">Create Weekly Pool</h2>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveView("current")}>
                Back To Pool View
              </Button>
              <select
                value={activeWeek}
                onChange={(event) => changeWeek(event.target.value)}
                className="h-10 rounded-md border border-white/40 bg-white px-3 text-sm text-gray-900"
              >
                {dateOptions.map((item) => (
                  <option key={item.key} value={item.week}>
                    Wk {item.week}, {item.date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={saveChanges} className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pool Name</span>
                <input
                  value={poolName}
                  onChange={(event) => setPoolName(event.target.value)}
                  placeholder="Enter pool name"
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
              <div className="flex items-end text-sm font-semibold text-gray-700 dark:text-gray-300">
                {selectedFixturesCount}/{POOL_SIZE} fixtures selected
              </div>
            </div>

            {loadingFormData ? <div className="py-8 text-center text-gray-500 dark:text-gray-400">Loading fixtures...</div> : null}
            {!loadingFormData ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {["S/N", "Division", "Event ID", "Game ID", "Event", "Date", "Time"].map((head) => (
                        <th key={head} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                    {fixtures.map((row, index) => {
                      const duplicate = Boolean(row.matchID && duplicateMatchIds.includes(row.matchID));

                      return (
                        <tr key={index} className={duplicate ? "bg-red-50 dark:bg-red-950/30" : ""}>
                          <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{index + 1}</td>
                          <td className="min-w-64 px-3 py-2">
                            <select
                              value={getTournamentId(row.tournament)}
                              disabled={loadingTournaments}
                              onChange={(event) => selectTournament(index, event.target.value)}
                              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                            >
                              <option value="">{loadingTournaments ? "Loading divisions..." : "Select Division"}</option>
                              {tournaments.map((tournament) => (
                                <option key={getTournamentId(tournament)} value={getTournamentId(tournament)}>
                                  {tournamentLabel(tournament)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{row.matchID || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{row.gameID || "-"}</td>
                          <td className="min-w-72 px-3 py-2">
                            <select
                              value={getMatchId(row.event)}
                              disabled={!row.tournament || row.loadingEvents}
                              onChange={(event) => selectEvent(index, event.target.value)}
                              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                            >
                              <option value="">{row.loadingEvents ? "Loading events..." : "Select Event"}</option>
                              {row.eventOptions.map((event) => (
                                <option key={getMatchId(event)} value={getMatchId(event)}>
                                  {eventLabel(event)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{row.eventDate || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{row.eventTime || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="max-w-sm">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Pool"}
              </Button>
            </div>
          </form>
        </section>
      )}

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} size="md">
        <ModalHeader>Upload Results</ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            <input
              type="file"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">Selected file: {uploadFile ? uploadFile.name : ""}</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!uploadFile || uploading} onClick={submitUpload}>
            {uploading ? "Uploading" : "Submit"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm text-gray-700 dark:text-gray-300">
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

function CurrentPoolTable({ fixtures }: { fixtures: CurrentPoolFixture[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {["S/N", "Division", "Event ID", "Event", "Date", "Time", "Match Status", "Status"].map((head) => (
              <th key={head} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
          {fixtures.map((fixture, index) => (
            <tr key={fixture.id ?? fixture.poolNumber ?? index}>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{fixture.poolNumber || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{poolDivision(fixture)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{fixture.matchId || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{fixture.matchName || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{datePart(fixture.kickoffTime) || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{timePart(fixture.kickoffTime) || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{fixture.matchStatus || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{fixture.resultStatus || "-"}</td>
            </tr>
          ))}
          {!fixtures.length ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                No fixtures found in the current pool.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default withAuth(FixturesPage);
