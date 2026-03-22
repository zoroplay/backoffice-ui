"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit2, Globe2, ShieldCheck, Power, PowerOff } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal/Modal";
import { PaymentMethod } from "./types";
import { PaymentMethodForm } from "./components/PaymentMethodForm";
import { toast } from "sonner";
import { apiEnv, normalizeApiError, settingsApi } from "@/lib/api";
import type { PaymentMethodRecord } from "@/lib/api/modules/settings.service";

const toPaymentMethodRows = (payload: unknown): PaymentMethod[] => {
  if (!payload || typeof payload !== "object") return [];

  const root = payload as { data?: unknown };
  const rows = Array.isArray(root.data)
    ? (root.data as PaymentMethodRecord[])
    : Array.isArray(payload)
      ? (payload as PaymentMethodRecord[])
      : [];

  return rows.map((row) => ({
    id: row.id,
    isEnabled: Number(row.status) === 1,
    isDefaultWithdrawal: false,
    useForWithdrawal: Number(row.forDisbursement) === 1,
    displayTitle: row.title ?? "",
    providerName: row.provider ?? "",
    apiSecretKey: row.secretKey ?? "",
    apiPublicKey: row.publicKey ?? "",
    merchantId: row.merchantId ?? "",
    baseUrl: row.baseUrl ?? "",
  }));
};

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await settingsApi.getPaymentMethods(Number(apiEnv.clientId));
      setMethods(toPaymentMethodRows(payload));
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to load payment methods");
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handleAddClick = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: PaymentMethod) => {
    try {
      setIsSubmitting(true);

      if (editingMethod) {
        await settingsApi.updatePaymentMethod(
          {
            id: Number(editingMethod.id),
            clientId: Number(apiEnv.clientId),
            status: values.isEnabled ? 1 : 0,
            provider: values.providerName,
            secretKey: values.apiSecretKey,
            publicKey: values.apiPublicKey,
            merchantId: values.merchantId,
            baseUrl: values.baseUrl,
            forDisbursement: values.useForWithdrawal ? 1 : 0,
            title: values.displayTitle,
          },
          Number(apiEnv.clientId)
        );

        // Required: always refresh list from GET after update
        await fetchPaymentMethods();
        toast.success("Payment method updated successfully");
      } else {
        await settingsApi.createPaymentMethod(
          {
            title: values.displayTitle,
            provider: values.providerName,
            publicKey: values.apiPublicKey,
            secretKey: values.apiSecretKey,
            merchantId: values.merchantId,
            baseUrl: values.baseUrl,
            forDisbursement: values.useForWithdrawal ? 1 : 0,
            clientId: Number(apiEnv.clientId),
          },
          Number(apiEnv.clientId)
        );

        await fetchPaymentMethods();
        toast.success("New payment method added");
      }

      setIsModalOpen(false);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to save payment method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setIsSubmitting(true);
      await settingsApi.deletePaymentMethod(id, Number(apiEnv.clientId));

      // Required: always refresh list from GET after delete
      await fetchPaymentMethods();

      setIsModalOpen(false);
      toast.success("Payment method deleted");
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to delete payment method");
    } finally {
      setIsSubmitting(false);
    }
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
          <Button onClick={handleAddClick} startIcon={<Plus className="h-4 w-4" />}>
            Add new payment method
          </Button>
        </div>

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

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configured Gateways</h2>
        </div>
        <div className="overflow-hidden p-6 pt-2">
          <DataTable columns={columns} data={methods} loading={isLoading} />
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl">
        <ModalHeader>
          {editingMethod ? `Edit ${editingMethod.displayTitle}` : "Add New Payment Method"}
        </ModalHeader>
        <ModalBody className="py-6">
          <PaymentMethodForm
            initialValues={editingMethod || undefined}
            onSubmit={handleFormSubmit}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}
