"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";
import { useModal } from "@/hooks/useModal";

import { columns, PlayerBonus, createActionColumn } from "./columns";
import { playerBonusesData } from "./data";
import BonusFormModal from "./BonusFormModal";

function PlayerBonusesPage() {
  const [data, setData] = useState<PlayerBonus[]>(playerBonusesData);
  const [editingBonus, setEditingBonus] = useState<PlayerBonus | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const handleAddNew = () => {
    setEditingBonus(null);
    openModal();
  };

  const handleEdit = (bonus: PlayerBonus) => {
    setEditingBonus(bonus);
    openModal();
  };

  const handleDelete = (bonusId: string) => {
    setData((prev) => prev.filter((item) => item.id !== bonusId));
  };

  const handleSaveBonus = (bonus: Omit<PlayerBonus, "id">) => {
    if (editingBonus) {
      // Edit existing bonus
      setData((prev) =>
        prev.map((item) =>
          item.id === editingBonus.id ? { ...bonus, id: editingBonus.id } : item
        )
      );
    } else {
      // Add new bonus
      const newBonus: PlayerBonus = {
        ...bonus,
        id: (data.length + 1).toString(),
      };
      setData((prev) => [...prev, newBonus]);
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
      <PageBreadcrumb pageTitle="Bonus Manager" />

      {/* Add New Button */}
      <div className="flex items-center justify-start">
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

      {/* Bonus Form Modal */}
      <BonusFormModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSaveBonus}
        editData={editingBonus}
      />
    </div>
  );
}

export default withAuth(PlayerBonusesPage);

