"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type TicketBonus = {
  id?: string | number;
  client_id?: string | number;
  section: "online" | "onliners" | "shop" | string;
  ticket_length?: string | number;
  ticketLength?: string | number;
  min_odd?: string | number;
  max_bonus_amount?: string | number;
  bonus?: string | number;
};

function emptyBonus(section: "online" | "shop"): TicketBonus {
  return {
    ticketLength: "3",
    ticket_length: "3",
    min_odd: 0,
    bonus: "5",
    max_bonus_amount: "0",
    section,
  };
}

function normalizedTicketLength(item: TicketBonus) {
  return String(item.ticketLength ?? item.ticket_length ?? "");
}

function normalizedMaxBonus(item: TicketBonus) {
  return String(item.max_bonus_amount ?? "0");
}

function sectionMatches(item: TicketBonus, section: "online" | "shop") {
  if (section === "online") return item.section === "online" || item.section === "onliners";
  return item.section === "shop";
}

function MultibetBonusPage() {
  const [bonuses, setBonuses] = useState<TicketBonus[]>([]);
  const [activeSection, setActiveSection] = useState<"online" | "shop">("online");
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<"online" | "shop" | null>(null);

  const onlinerBonuses = useMemo(() => bonuses.filter((item) => sectionMatches(item, "online")), [bonuses]);
  const shopBonuses = useMemo(() => bonuses.filter((item) => sectionMatches(item, "shop")), [bonuses]);
  const currentItems = activeSection === "online" ? onlinerBonuses : shopBonuses;

  async function loadBonuses() {
    setLoading(true);
    const response = await GETREQUEST<any>("/admin/bonus/acca-bonus");
    const body = response.data ?? {};

    if (!response.ok || !body.success) {
      toast.error(response.error || body.message || "An error occured");
      setBonuses([]);
      setLoading(false);
      return;
    }

    setBonuses(Array.isArray(body.data) ? body.data : []);
    setLoading(false);
  }

  function addRow(section: "online" | "shop") {
    setBonuses((current) => [...current, emptyBonus(section)]);
  }

  function removeRow(target: TicketBonus, section: "online" | "shop") {
    let removed = false;
    setBonuses((current) =>
      current.filter((item) => {
        if (!removed && sectionMatches(item, section) && normalizedTicketLength(item) === normalizedTicketLength(target)) {
          removed = true;
          return false;
        }
        return true;
      }),
    );
  }

  function updateRow(target: TicketBonus, field: keyof TicketBonus, value: string) {
    setBonuses((current) =>
      current.map((item) => (item === target ? { ...item, [field]: value, ...(field === "ticketLength" ? { ticket_length: value } : {}) } : item)),
    );
  }

  async function saveSection(section: "online" | "shop") {
    const items = bonuses.filter((item) => sectionMatches(item, section));
    setSavingSection(section);

    const payload = {
      section,
      items: items.map((item) => ({
        id: item.id,
        client_id: item.client_id,
        section: item.section || section,
        ticket_length: normalizedTicketLength(item),
        min_odd: item.min_odd || 0,
        max_bonus_amount: normalizedMaxBonus(item),
        bonus: item.bonus,
      })),
    };

    const response = await POSTREQUEST<any>("/admin/bonus/acca-bonus", payload);
    const body = response.data ?? {};
    setSavingSection(null);

    if (!response.ok || !body.success) {
      toast.error(response.error || body.message || "Something went wrong");
      return;
    }

    toast.success(section === "online" ? "Bonuses for onliners has been saved" : "Bonuses for shop has been saved");
    await loadBonuses();
  }

  useEffect(() => {
    loadBonuses();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Bonuses on Tickets" />

      <div className="grid gap-6 lg:grid-cols-2">
        <BonusSection
          active={activeSection === "online"}
          items={onlinerBonuses}
          loading={loading}
          onActivate={() => setActiveSection("online")}
          onAdd={() => addRow("online")}
          onRemove={(item) => removeRow(item, "online")}
          onSave={() => saveSection("online")}
          onUpdate={updateRow}
          saving={savingSection === "online"}
          title="Onliners"
        />
        <BonusSection
          active={activeSection === "shop"}
          items={shopBonuses}
          loading={loading}
          onActivate={() => setActiveSection("shop")}
          onAdd={() => addRow("shop")}
          onRemove={(item) => removeRow(item, "shop")}
          onSave={() => saveSection("shop")}
          onUpdate={updateRow}
          saving={savingSection === "shop"}
          title="Shop"
        />
      </div>
    </div>
  );
}

function BonusSection({
  active,
  items,
  loading,
  onActivate,
  onAdd,
  onRemove,
  onSave,
  onUpdate,
  saving,
  title,
}: {
  active: boolean;
  items: TicketBonus[];
  loading: boolean;
  onActivate: () => void;
  onAdd: () => void;
  onRemove: (item: TicketBonus) => void;
  onSave: () => void;
  onUpdate: (item: TicketBonus, field: keyof TicketBonus, value: string) => void;
  saving: boolean;
  title: string;
}) {
  return (
    <section className={`rounded-lg border bg-white shadow-sm dark:bg-gray-950 ${active ? "border-brand-400" : "border-gray-200 dark:border-gray-800"}`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-800">
        <button type="button" onClick={onActivate} className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </button>
        <Button type="button" variant="outline" onClick={onAdd}>
          Add More
        </Button>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={`${item.id ?? "new"}-${index}`} className="grid gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800 md:grid-cols-[1fr_1fr_1.4fr_auto]">
                  <label className="space-y-1 text-sm">
                    <span className="text-gray-600 dark:text-gray-300">No. of Events</span>
                    <input
                      value={normalizedTicketLength(item)}
                      onChange={(event) => onUpdate(item, "ticketLength", event.target.value)}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Bonus (%)</span>
                    <input
                      value={String(item.bonus ?? "")}
                      onChange={(event) => onUpdate(item, "bonus", event.target.value)}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Max Bonus Amount</span>
                    <input
                      value={normalizedMaxBonus(item)}
                      onChange={(event) => onUpdate(item, "max_bonus_amount", event.target.value)}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </label>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" onClick={() => onRemove(item)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {!items.length ? <div className="py-6 text-center text-gray-500 dark:text-gray-400">No rows configured.</div> : null}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Please wait..." : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default withAuth(MultibetBonusPage);
