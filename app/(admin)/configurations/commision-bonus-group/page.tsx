"use client";

import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { withAuth } from "@/utils/withAuth";

type BonusGroupRow = {
  id: string;
  group: string;
  avgMinSel: string;
  avgMaxSel: string;
  ggrBelow80: string;
  ggrAtLeast80: string;
  bonusRate: string;
  targetStake: string;
  targetCoupon: string;
};

const createRow = (index: number): BonusGroupRow => {
  const label = String.fromCharCode(65 + index);
  return {
    id: `group-${Date.now()}-${index}`,
    group: `Group ${label}`,
    avgMinSel: "",
    avgMaxSel: "",
    ggrBelow80: "",
    ggrAtLeast80: "",
    bonusRate: "",
    targetStake: "",
    targetCoupon: "",
  };
};

const initialRows: BonusGroupRow[] = [0, 1, 2, 3].map(createRow);

function CommisionBonusGroupPage() {
  const [rows, setRows] = useState<BonusGroupRow[]>(initialRows);
  const [isSaving, setIsSaving] = useState(false);

  const stats = useMemo(() => {
    return {
      groups: rows.length,
      configured: rows.filter(
        (row) =>
          row.avgMinSel ||
          row.avgMaxSel ||
          row.ggrBelow80 ||
          row.ggrAtLeast80 ||
          row.bonusRate ||
          row.targetStake ||
          row.targetCoupon
      ).length,
    };
  }, [rows]);

  const updateRow = (
    id: string,
    field: keyof Omit<BonusGroupRow, "id" | "group">,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow(prev.length)]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API integration comes in next step.
      await Promise.resolve();
      toast.success("Commission bonus groups saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Configurations · Commision Bonus Group" />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Manage Commision Bonus Groups
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure margin rules, bonus rates, and target conditions per group.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{stats.groups} groups</span>
            <span>{stats.configured} configured</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="rounded-t-2xl bg-brand-500 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white">Bonuse Groups</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900/60">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Group
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Avg. Min Sel
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Avg. Max Sel
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  GGR Margin {"<"} 80%
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  GGR Margin {">="} 80%
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Bonus Rate
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Target Stake
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Target Coupon
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-base font-medium text-gray-900 dark:text-gray-100">
                    {row.group}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.avgMinSel}
                      onChange={(event) =>
                        updateRow(row.id, "avgMinSel", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.avgMaxSel}
                      onChange={(event) =>
                        updateRow(row.id, "avgMaxSel", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.ggrBelow80}
                      onChange={(event) =>
                        updateRow(row.id, "ggrBelow80", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.ggrAtLeast80}
                      onChange={(event) =>
                        updateRow(row.id, "ggrAtLeast80", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.bonusRate}
                      onChange={(event) =>
                        updateRow(row.id, "bonusRate", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.targetStake}
                      onChange={(event) =>
                        updateRow(row.id, "targetStake", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={row.targetCoupon}
                      onChange={(event) =>
                        updateRow(row.id, "targetCoupon", event.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            startIcon={<Plus className="h-4 w-4" />}
          >
            Add More
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default withAuth(CommisionBonusGroupPage);
