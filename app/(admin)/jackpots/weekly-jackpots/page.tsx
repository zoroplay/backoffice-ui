"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";
import { useModal } from "@/hooks/useModal";

import { columns, WeeklyJackpot, createActionColumn } from "./columns";
import { weeklyJackpotsData } from "./data";
import JackpotFormModal from "./JackpotFormModal";

function WeeklyJackpotsPage() {
  const [data, setData] = useState<WeeklyJackpot[]>(weeklyJackpotsData);
  const [editingJackpot, setEditingJackpot] = useState<WeeklyJackpot | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const handleAddNew = () => {
    setEditingJackpot(null);
    openModal();
  };

  const handleEdit = (jackpot: WeeklyJackpot) => {
    setEditingJackpot(jackpot);
    openModal();
  };

  const handleDelete = (jackpotId: string) => {
    setData((prev) => prev.filter((item) => item.id !== jackpotId));
  };

  const handleSaveJackpot = (jackpot: Omit<WeeklyJackpot, "id" | "noOfTickets" | "ggr">) => {
    if (editingJackpot) {
      // Edit existing jackpot
      setData((prev) =>
        prev.map((item) =>
          item.id === editingJackpot.id
            ? {
                ...jackpot,
                id: editingJackpot.id,
                noOfTickets: editingJackpot.noOfTickets,
                ggr: editingJackpot.ggr,
              }
            : item
        )
      );
    } else {
      // Add new jackpot
      const newJackpot: WeeklyJackpot = {
        ...jackpot,
        id: (data.length + 1).toString(),
        noOfTickets: 0,
        ggr: 0,
      };
      setData((prev) => [...prev, newJackpot]);
    }
    closeModal();
  };

  // Combine columns with action column
  const tableColumns = [
    ...columns,
    createActionColumn({ onEdit: handleEdit, onDelete: handleDelete }),
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Weekly Jackpots" />

      {/* Add New Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleAddNew}
          startIcon={<Plus size={18} />}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Add New
        </Button>
      </div>

      {/* Table */}
      <DataTable columns={tableColumns} data={data} />

      {/* Jackpot Form Modal */}
      <JackpotFormModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSaveJackpot}
        editData={editingJackpot}
      />
    </div>
  );
}

export default withAuth(WeeklyJackpotsPage);

