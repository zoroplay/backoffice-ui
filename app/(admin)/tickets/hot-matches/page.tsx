"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
import { asRecord, formatDate, rowValue, type AnyRecord } from "../components/ticketApiHelpers";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type HotMatchRow = {
  event_id: string;
  option_id: string;
  event_name: string;
  event_date: string;
  raw?: AnyRecord;
};

const emptyRow: HotMatchRow = {
  event_id: "",
  option_id: "",
  event_name: "",
  event_date: "",
};

function mapHotMatch(value: unknown): HotMatchRow {
  const item = asRecord(value);

  return {
    event_id: String(rowValue(item, ["event_id", "eventId"], "")),
    option_id: String(rowValue(item, ["option_id", "optionId"], "")),
    event_name: String(rowValue(item, ["event_name", "eventName"], "")),
    event_date: String(rowValue(item, ["event_date", "eventDate", "schedule"], "")),
    raw: item,
  };
}

export default function HotMatchesPage() {
  const [rows, setRows] = useState<HotMatchRow[]>([emptyRow]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookupIndex, setLookupIndex] = useState<number | null>(null);

  async function loadData() {
    setLoading(true);
    const response = await GETREQUEST<any>("/admin/sport/hotmatches/list");
    setLoading(false);

    const body = response.data;
    if (!response.ok) {
      toast.error(response.error || "An error occured");
      return;
    }

    const nextRows = Array.isArray(body) ? body.map(mapHotMatch) : [];
    setRows(nextRows.length ? nextRows : [emptyRow]);
  }

  async function lookupEvent(row: HotMatchRow, index: number) {
    if (row.event_id.length <= 3) return;

    setLookupIndex(index);
    const response = await GETREQUEST<any>(`/admin/content-management/find-fixture/${row.event_id}`);
    setLookupIndex(null);

    const body = asRecord(response.data);
    if (!response.ok) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    setRows((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              event_name: String(rowValue(body, ["event_name", "eventName"], item.event_name)),
              event_date: String(rowValue(body, ["schedule", "event_date", "eventDate"], item.event_date)),
            }
          : item
      )
    );
  }

  async function saveChanges() {
    setSaving(true);
    const response = await POSTREQUEST<any>("/admin/sport/hotmatches/store", rows);
    setSaving(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Hot matches saved");
    await loadData();
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <TicketOpsShell
      title="Hot Matches Setup"
      description="Maintain highlighted betting events by event ID, fixture lookup, and active 1X2 option."
    >
      <TicketSection title="Hot Matches Selection">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveChanges();
          }}
          className="space-y-4"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="w-[18%] px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Event ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Event</th>
                  <th className="w-[18%] px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Time</th>
                  <th className="w-[16%] px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Active Option</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {rows.map((row, index) => (
                  <tr key={`${row.event_id || "new"}-${index}`}>
                    <td className="px-4 py-3">
                      <input
                        value={row.event_id}
                        onChange={(event) =>
                          setRows((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, event_id: event.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={() => void lookupEvent(row, index)}
                        placeholder="Enter event id"
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {lookupIndex === index ? "Looking up fixture" : row.event_name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {row.event_date ? formatDate(row.event_date) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.option_id}
                        onChange={(event) =>
                          setRows((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, option_id: event.target.value }
                                : item
                            )
                          )
                        }
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="">Select Option</option>
                        <option value="1">1</option>
                        <option value="2">X</option>
                        <option value="3">2</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {index !== 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setRows((current) => current.filter((_, itemIndex) => itemIndex !== index))
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                          title="Remove row"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading hot matches
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setRows((current) => [...current, { ...emptyRow }])}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              <Plus size={16} />
              Add More
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </TicketSection>
    </TicketOpsShell>
  );
}
