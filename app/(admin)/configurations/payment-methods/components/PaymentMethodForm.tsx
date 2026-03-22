"use client";

import React, { useEffect, useState } from "react";
import { PaymentMethod } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/ui/button/Button";
import { Trash2 } from "lucide-react";

interface PaymentMethodFormProps {
  initialValues?: Partial<PaymentMethod>;
  onSubmit: (values: PaymentMethod) => Promise<void> | void;
  onDelete?: (id: string | number) => Promise<void> | void;
  isSubmitting?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  isSubmitting = false,
}) => {
  const [formValues, setFormValues] = useState<Partial<PaymentMethod>>({
    isEnabled: true,
    isDefaultWithdrawal: false,
    useForWithdrawal: false,
    displayTitle: "",
    providerName: "",
    apiSecretKey: "",
    apiPublicKey: "",
    merchantId: "",
    baseUrl: "",
    ...initialValues,
  });

  useEffect(() => {
    setFormValues({
      isEnabled: true,
      isDefaultWithdrawal: false,
      useForWithdrawal: false,
      displayTitle: "",
      providerName: "",
      apiSecretKey: "",
      apiPublicKey: "",
      merchantId: "",
      baseUrl: "",
      ...initialValues,
    });
  }, [initialValues]);

  const handleChange = (field: keyof PaymentMethod, value: PaymentMethod[keyof PaymentMethod]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formValues as PaymentMethod);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Toggles/Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isEnabled"
              checked={Boolean(formValues.isEnabled)}
              onCheckedChange={(val) => handleChange("isEnabled", Boolean(val))}
            />
            <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
              Enable Payment Method
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="isDefaultWithdrawal"
              checked={Boolean(formValues.isDefaultWithdrawal)}
              onCheckedChange={(val) => handleChange("isDefaultWithdrawal", Boolean(val))}
            />
            <label htmlFor="isDefaultWithdrawal" className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
              Default Withdrawal
            </label>
          </div>
           <div className="flex items-center gap-3">
            <Checkbox
              id="useForWithdrawal"
              checked={Boolean(formValues.useForWithdrawal)}
              onCheckedChange={(val) => handleChange("useForWithdrawal", Boolean(val))}
            />
            <label htmlFor="useForWithdrawal" className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
              Use for withdrawal
            </label>
          </div>
        </div>

        {/* Text Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Display Title
            </label>
            <input
              type="text"
              className={inputClassName}
              value={formValues.displayTitle ?? ""}
              onChange={(e) => handleChange("displayTitle", e.target.value)}
              placeholder="e.g., Online Deposit (Paystack)"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Provider Name
            </label>
            <input
              type="text"
              className={inputClassName}
              value={formValues.providerName ?? ""}
              onChange={(e) => handleChange("providerName", e.target.value)}
              placeholder="e.g., paystack"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            API Secret Key
          </label>
          <input
            type="password"
            className={inputClassName}
            value={formValues.apiSecretKey ?? ""}
            onChange={(e) => handleChange("apiSecretKey", e.target.value)}
            placeholder="sk_test_..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            API Public Key
          </label>
          <input
            type="text"
            className={inputClassName}
            value={formValues.apiPublicKey ?? ""}
            onChange={(e) => handleChange("apiPublicKey", e.target.value)}
            placeholder="pk_test_..."
          />
        </div>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Merchant ID
          </label>
          <input
            type="text"
            className={inputClassName}
            value={formValues.merchantId ?? ""}
            onChange={(e) => handleChange("merchantId", e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Base URL
          </label>
          <input
            type="url"
            className={inputClassName}
            value={formValues.baseUrl ?? ""}
            onChange={(e) => handleChange("baseUrl", e.target.value)}
            placeholder="https://api.provider.com"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          {onDelete && formValues.id && (
            <Button
              type="button"
              variant="outline"
              className="text-error-600 border-error-200 hover:bg-error-50"
              onClick={() => onDelete(formValues.id!)}
              startIcon={<Trash2 className="h-4 w-4" />}
              disabled={isSubmitting}
            >
              Delete This Method
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : formValues.id
                ? "Save Changes"
                : "Save Payment Method"}
          </Button>
        </div>
      </div>
    </form>
  );
};
