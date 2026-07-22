"use client";

import { useMemo, useState } from "react";

import { couponEvents, tournaments } from "./contentManagementData";

type CouponRow = {
  tournamentId: string;
  eventId: string;
};

const initialRows: CouponRow[] = Array.from({ length: 49 }, (_, index) => {
  const event = couponEvents[index % couponEvents.length];
  return index < 6
    ? { tournamentId: event.tournamentId, eventId: event.id }
    : { tournamentId: "", eventId: "" };
});

export default function WeeklyCouponClient() {
  const [rows, setRows] = useState(initialRows);

  const selectedCount = useMemo(
    () => rows.filter((row) => row.tournamentId && row.eventId).length,
    [rows],
  );

  function updateTournament(index: number, tournamentId: string) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { tournamentId, eventId: "" } : row,
      ),
    );
  }

  function updateEvent(index: number, eventId: string) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, eventId } : row,
      ),
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Weekly Coupon Fixtures</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Nuxt renders 49 selectable rows, loads tournaments/events, copies 1/X/2 odds, and saves the full coupon array.
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selected: <span className="font-semibold text-gray-900 dark:text-white">{selectedCount}/49</span>
        </div>
      </div>
      <div className="overflow-x-auto p-5">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Division", "S/N", "Event ID", "Event", "1", "X", "2", "Date", "Time"].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row, index) => {
              const events = couponEvents.filter((event) => event.tournamentId === row.tournamentId);
              const event = couponEvents.find((item) => item.id === row.eventId);
              return (
                <tr key={index}>
                  <td className="min-w-56 px-4 py-3">
                    <select
                      value={row.tournamentId}
                      onChange={(eventChange) => updateTournament(index, eventChange.target.value)}
                      className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="">Select Tournament</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{index + 1}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{event?.eventId ?? "-"}</td>
                  <td className="min-w-72 px-4 py-3">
                    <select
                      value={row.eventId}
                      onChange={(eventChange) => updateEvent(index, eventChange.target.value)}
                      disabled={!row.tournamentId}
                      className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="">Select Event</option>
                      {events.map((eventOption) => (
                        <option key={eventOption.id} value={eventOption.id}>{eventOption.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{event?.odds.home ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{event?.odds.draw ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{event?.odds.away ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{event?.date ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{event?.time ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <button type="button" className="rounded-md bg-success-500 px-5 py-2 text-sm font-medium text-white hover:bg-success-600">
          Save Changes
        </button>
      </div>
    </section>
  );
}
