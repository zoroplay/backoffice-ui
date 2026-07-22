"use client";

import { useMemo, useState } from "react";

type Market = {
  id: string;
  name: string;
  odds: string;
  result: "1" | "2" | "3";
};

type Special = {
  id: string;
  name: string;
  categoryId: string;
  startDate: string;
  eventId: string;
  markets: Market[];
};

const categories = [
  { id: "derbies", name: "Derby Specials" },
  { id: "bankers", name: "Weekend Bankers" },
  { id: "goals", name: "Goals Markets" },
];

const initialSpecials: Special[] = [
  {
    id: "special-1",
    name: "North London Derby Goals",
    categoryId: "derbies",
    startDate: "2026-07-25",
    eventId: "1001",
    markets: [
      { id: "m1", name: "Over 2.5", odds: "1.82", result: "2" },
      { id: "m2", name: "Both Teams To Score", odds: "1.75", result: "2" },
    ],
  },
  {
    id: "special-2",
    name: "Weekend Banker Treble",
    categoryId: "bankers",
    startDate: "2026-07-26",
    eventId: "1002",
    markets: [{ id: "m3", name: "Home Win", odds: "1.95", result: "2" }],
  },
];

export default function SoccerSpecialsClient() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [specials, setSpecials] = useState(initialSpecials);
  const [selectedSpecial, setSelectedSpecial] = useState<Special | null>(null);
  const [specialForm, setSpecialForm] = useState({
    name: "",
    categoryId: categories[0].id,
    eventId: "",
    startDate: "",
  });
  const [categoryName, setCategoryName] = useState("");

  const filteredSpecials = useMemo(
    () => specials.filter((special) => special.categoryId === selectedCategoryId),
    [selectedCategoryId, specials],
  );

  function saveSpecial() {
    if (!specialForm.name) return;
    setSpecials((current) => [
      ...current,
      {
        id: `special-${Date.now()}`,
        name: specialForm.name,
        categoryId: specialForm.categoryId,
        eventId: specialForm.eventId || "manual",
        startDate: specialForm.startDate || "2026-07-22",
        markets: [{ id: `market-${Date.now()}`, name: "Selection", odds: "1.00", result: "2" }],
      },
    ]);
    setSpecialForm({ name: "", categoryId: selectedCategoryId, eventId: "", startDate: "" });
  }

  function deleteSpecial(id: string) {
    if (window.confirm("You will not be able to recover this item")) {
      setSpecials((current) => current.filter((special) => special.id !== id));
    }
  }

  function updateSettlement(index: number, result: Market["result"]) {
    if (!selectedSpecial) return;
    setSelectedSpecial({
      ...selectedSpecial,
      markets: selectedSpecial.markets.map((market, marketIndex) =>
        marketIndex === index ? { ...market, result } : market,
      ),
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Specials List</h2>
        </div>
        <div className="space-y-5 p-5">
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {filteredSpecials.map((special, index) => (
              <div key={special.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {special.name.length > 40 ? `${special.name.slice(0, 37)}...` : special.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{special.startDate}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button type="button" onClick={() => setSelectedSpecial(special)} className="font-medium text-brand-600 dark:text-brand-400">Settle Market</button>
                  <button type="button" onClick={() => setSpecialForm({ name: special.name, categoryId: special.categoryId, eventId: special.eventId, startDate: special.startDate })} className="font-medium text-gray-700 dark:text-gray-300">Edit</button>
                  <button type="button" onClick={() => deleteSpecial(special.id)} className="font-medium text-red-600 dark:text-red-300">Delete</button>
                </div>
              </div>
            ))}
            {!filteredSpecials.length ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No record found</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add/Edit Soccer Specials</h2>
          </div>
          <form className="space-y-4 p-5">
            <input value={specialForm.name} onChange={(event) => setSpecialForm((current) => ({ ...current, name: event.target.value }))} placeholder="Special name" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select value={specialForm.categoryId} onChange={(event) => setSpecialForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input value={specialForm.eventId} onChange={(event) => setSpecialForm((current) => ({ ...current, eventId: event.target.value }))} placeholder="Event ID" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input type="date" value={specialForm.startDate} onChange={(event) => setSpecialForm((current) => ({ ...current, startDate: event.target.value }))} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <button type="button" onClick={saveSpecial} className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Save Special</button>
          </form>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add/Edit Soccer Special Cat</h2>
          </div>
          <form className="space-y-4 p-5">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <button type="button" onClick={() => setCategoryName("")} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Save Category</button>
          </form>
        </div>
      </section>

      {selectedSpecial ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{selectedSpecial.name}</h2>
            </div>
            <div className="p-5">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead>
                  <tr>{["Name", "Odds", "Result"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedSpecial.markets.map((market, index) => (
                    <tr key={market.id}>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{market.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{market.odds}</td>
                      <td className="px-4 py-3">
                        <select value={market.result} onChange={(event) => updateSettlement(index, event.target.value as Market["result"])} className="h-9 rounded-md border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                          <option value="1">Won</option>
                          <option value="2">Lost</option>
                          <option value="3">Void</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setSelectedSpecial(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Cancel</button>
                <button type="button" onClick={() => setSelectedSpecial(null)} className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white">Settle Bets</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
