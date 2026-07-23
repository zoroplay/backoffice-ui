"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
import { Infotext } from "@/components/common/Info";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";

import {
  defaultPlayerReportFilters,
  fetchCountries,
  fetchPlayerReportPage,
  fetchStates,
  updatePlayerReportStatus,
  verifyPlayerReportAccount,
  type CountryOption,
  type PlayerReportFilters,
  type PlayerReportVariant,
  type StateOption,
} from "../reportsApi";
import { PlayerReportTable, downloadPlayerReportCsv } from "./PlayerReportTable";

type PlayerListReportPageProps = {
  variant: Extract<PlayerReportVariant, "online" | "frozen" | "inactive">;
};

const clientTypeOptions = [
  { value: "", label: "Client Type" },
  { value: "client", label: "Client" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
] as const;

const variantConfig = {
  online: {
    title: "Online Players Report",
    info: "Search players by location, username, or client type and review live account details.",
    exportName: "online_players_report.csv",
  },
  frozen: {
    title: "Frozen Accounts Report",
    info: "Review frozen player accounts using the same filters as the Nuxt report route.",
    exportName: "frozen_accounts_report.csv",
  },
  inactive: {
    title: "Inactive Players Report",
    info: "Review inactive player accounts using the same player list backend contract.",
    exportName: "inactive_players_report.csv",
  },
} as const;

function PlayerListReportPage({ variant }: PlayerListReportPageProps) {
  const config = variantConfig[variant];
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [filters, setFilters] = useState<PlayerReportFilters>(defaultPlayerReportFilters);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchPlayerReportPage>>["rows"]>([]);
  const [pagination, setPagination] = useState<Awaited<ReturnType<typeof fetchPlayerReportPage>>["pagination"]>({
    total: 0,
    per_page: 10,
    from: 0,
    to: 0,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [actingId, setActingId] = useState("");

  const currentCountry = useMemo(
    () => countries.find((country) => country.id === filters.country) ?? null,
    [countries, filters.country]
  );

  const loadReport = useCallback(
    async (page = 1, nextFilters = filters) => {
      setLoading(true);
      try {
        const result = await fetchPlayerReportPage(variant, nextFilters, page);
        setRows(result.rows);
        setPagination(result.pagination);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load players");
        setRows([]);
        setPagination((current) => ({ ...current, current_page: page }));
      } finally {
        setLoading(false);
      }
    },
    [filters, variant]
  );

  useEffect(() => {
    let cancelled = false;
    const initialFilters = defaultPlayerReportFilters();

    async function initialize() {
      try {
        const countryRows = await fetchCountries();
        if (!cancelled) {
          setCountries(countryRows);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load countries");
        }
      }

      if (!cancelled) {
        setFilters(initialFilters);
        setLoading(true);
        try {
          const result = await fetchPlayerReportPage(variant, initialFilters, 1);
          if (!cancelled) {
            setRows(result.rows);
            setPagination(result.pagination);
          }
        } catch (error) {
          if (!cancelled) {
            toast.error(error instanceof Error ? error.message : "Unable to load players");
            setRows([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [variant]);

  useEffect(() => {
    let cancelled = false;

    async function loadStateOptions() {
      if (!filters.country) {
        setStates([]);
        return;
      }

      setLoadingStates(true);
      try {
        const stateRows = await fetchStates(filters.country);
        if (!cancelled) {
          setStates(stateRows);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load states");
          setStates([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingStates(false);
        }
      }
    }

    void loadStateOptions();

    return () => {
      cancelled = true;
    };
  }, [filters.country]);

  async function handleSearch() {
    await loadReport(1, filters);
  }

  async function handleClear() {
    const nextFilters = defaultPlayerReportFilters();
    setFilters(nextFilters);
    setStates([]);
    await loadReport(1, nextFilters);
  }

  async function handleVerify(row: (typeof rows)[number]) {
    const confirmed = window.confirm("Are you sure you want to verify this account?");
    if (!confirmed) return;

    setActingId(row.id);
    try {
      await verifyPlayerReportAccount(row.id);
      toast.success("Account verified");
      await loadReport(pagination.current_page, filters);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify account");
    } finally {
      setActingId("");
    }
  }

  async function handleStatusChange(
    row: (typeof rows)[number],
    status: number,
    label: string
  ) {
    const confirmed = window.confirm(`Are you sure you want to ${label.toLowerCase()} this account?`);
    if (!confirmed) return;

    setActingId(row.id);
    try {
      await updatePlayerReportStatus(row.id, status);
      toast.success("Player status updated");
      await loadReport(pagination.current_page, filters);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update player status");
    } finally {
      setActingId("");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={config.title} />
      <Infotext text={config.info} />

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-4">
          <SelectField
            label="Country"
            value={filters.country}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                country: value,
                state: "",
              }))
            }
            options={[
              { value: "", label: "Country" },
              ...countries.map((country) => ({ value: country.id, label: country.name })),
            ]}
          />
          <SelectField
            label="State"
            value={filters.state}
            disabled={!currentCountry || loadingStates}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                state: value,
              }))
            }
            options={[
              { value: "", label: loadingStates ? "Loading states" : "State" },
              ...states.map((state) => ({ value: state.id, label: state.name })),
            ]}
          />
          <TextField
            label="Username"
            placeholder="Username"
            value={filters.username}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                username: value,
              }))
            }
          />
          <SelectField
            label="Client Type"
            value={filters.source}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                source: value as PlayerReportFilters["source"],
              }))
            }
            options={clientTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterActions onSearch={() => void handleSearch()} onClear={() => void handleClear()} isLoading={loading} />
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            startIcon={<Download className="h-4 w-4" />}
            onClick={() => downloadPlayerReportCsv(variant, rows, config.exportName)}
          >
            Export CSV
          </Button>
        </div>
      </section>

      <PlayerReportTable
        variant={variant}
        rows={rows}
        loading={loading}
        actingId={actingId}
        pagination={pagination}
        onPageChange={(page) => void loadReport(page, filters)}
        onVerify={(row) => void handleVerify(row)}
        onStatusChange={(row, status, label) => void handleStatusChange(row, status, label)}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default withAuth(PlayerListReportPage);
