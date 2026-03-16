"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit2, Globe2, ShieldCheck, Power, PowerOff } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal/Modal";
import { mockPaymentMethods } from "./data";
import { PaymentMethod } from "./types";
import { PaymentMethodForm } from "./components/PaymentMethodForm";
import { toast } from "sonner";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const handleAddClick = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (values: PaymentMethod) => {
    if (editingMethod) {
      // Update
      setMethods((prev) =>
        prev.map((m) => (m.id === editingMethod.id ? { ...values, id: m.id } : m))
      );
      toast.success("Payment method updated successfully");
    } else {
      // Add
      const newMethod = {
        ...values,
        id: values.providerName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      };
      setMethods((prev) => [...prev, newMethod]);
      toast.success("New payment method added");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    setIsModalOpen(false);
    toast.success("Payment method deleted");
  };

  const columns = useMemo<ColumnDef<PaymentMethod>[]>(
    () => [
      {
        accessorKey: "displayTitle",
        header: "Display Title",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {row.original.displayTitle}
            </span>
            <span className="text-xs text-gray-500">{row.original.providerName}</span>
          </div>
        ),
      },
      {
        accessorKey: "isEnabled",
        header: "Status",
        cell: ({ getValue }) => {
          const enabled = getValue<boolean>();
          return (
            <Badge variant="light" color={enabled ? "success" : "error"} size="xs">
              {enabled ? (
                <Power className="h-3 w-3 mr-1" />
              ) : (
                <PowerOff className="h-3 w-3 mr-1" />
              )}
              {enabled ? "Active" : "Disabled"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "useForWithdrawal",
        header: "Withdrawal",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.useForWithdrawal && (
              <Badge variant="light" color="info" size="xs">
                Available
              </Badge>
            )}
            {row.original.isDefaultWithdrawal && (
              <Badge variant="solid" color="primary" size="xs">
                Default
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "baseUrl",
        header: "Base URL",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px] block">
            {getValue<string>() || "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row.original)}
            startIcon={<Edit2 className="h-3.5 w-3.5" />}
          >
            Edit
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Configurations · Payment Method" />

      {/* Header Section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment Methods Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure gateways, API credentials, and withdrawal rules for your platform.
            </p>
          </div>
          <Button
            onClick={handleAddClick}
            startIcon={<Plus className="h-4 w-4" />}            
          >
            Add new payment method
          </Button>
        </div>

        {/* Summary Stats / Info */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
           <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Gateway Security</p>
              <p className="text-xs text-gray-500">All credentials are encrypted and stored securely.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Global Coverage</p>
              <p className="text-xs text-gray-500">{methods.length} active configurations across regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configured Gateways</h2>
        </div>
        <div className="overflow-hidden p-6 pt-2">
          <DataTable columns={columns} data={methods} />
        </div>
      </section>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl">
        <ModalHeader>
          {editingMethod ? `Edit ${editingMethod.displayTitle}` : "Add New Payment Method"}
        </ModalHeader>
        <ModalBody className="py-6">
          <PaymentMethodForm
            initialValues={editingMethod || undefined}
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}
