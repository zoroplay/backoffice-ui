"use client";

import React, { useMemo, useState } from "react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import { clientId, money } from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { POSTREQUEST } from "@/utils/base_request";
import { toast } from "sonner";

type WalletType = "main" | "trust" | "commission";
type TransferAction = "deposit" | "withdraw";

type TransferForm = {
  amount: string;
  description: string;
  wallet: WalletType;
  action: TransferAction;
};

type BankingTabProps = {
  agentId: string;
  agent: Agency;
  onTransferComplete?: () => void | Promise<void>;
};

const initialForm: TransferForm = {
  amount: "",
  description: "",
  wallet: "main",
  action: "withdraw",
};

function isSuccessResponse(data: unknown) {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return record.success !== false;
}

function messageFrom(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const record = data as Record<string, unknown>;
  return String(record.message || record.error || fallback);
}

function BankingTab({ agentId, agent, onTransferComplete }: BankingTabProps) {
  const [form, setForm] = useState<TransferForm>({
    ...initialForm,
    description: agent.username,
  });
  const [submitting, setSubmitting] = useState(false);

  const isCommissionTransfer = form.wallet === "commission";

  const transferDirection = useMemo(() => {
    if (isCommissionTransfer) {
      return {
        fromUser: agent.username,
        toUser: "System",
        note: "Commission Withdrawal",
      };
    }

    if (form.action === "withdraw") {
      return {
        fromUser: agent.username,
        toUser: "System",
        note: form.description || `withdraw to System`,
      };
    }

    return {
      fromUser: "System",
      toUser: agent.username,
      note: form.description || agent.username,
    };
  }, [agent.username, form.action, form.description, isCommissionTransfer]);

  function updateForm<Key extends keyof TransferForm>(key: Key, value: TransferForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function switchWallet(wallet: WalletType) {
    setForm((current) => ({
      ...current,
      wallet,
      action: wallet === "commission" ? "withdraw" : current.action,
      description: wallet === "commission" ? "Commission Withdrawal" : agent.username,
    }));
  }

  async function submitTransfer(action: TransferAction) {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter an amount");
      return;
    }

    setSubmitting(true);
    const response = isCommissionTransfer
      ? await POSTREQUEST<any>(`/admin/wallet/withdraw-commission/${clientId()}`, {
          userId: agentId,
          amount: form.amount,
        })
      : await POSTREQUEST<any>("/admin/wallet/funds-transfer", {
          amount: form.amount,
          description: transferDirection.note,
          action,
          userId: agentId,
          clientId: clientId(),
          username: agent.username,
          source: "admin",
          wallet: form.wallet,
          subject: "Funds transfer",
          channel: "admin",
          from_user: action === "withdraw" ? agent.username : "System",
          to_user: action === "withdraw" ? "System" : agent.username,
        });
    setSubmitting(false);

    if (!response.ok || !isSuccessResponse(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Transaction failed"));
      return;
    }

    toast.success(messageFrom(response.data, "Transaction was successful"));
    setForm({
      ...initialForm,
      description: agent.username,
    });
    await onTransferComplete?.();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <BalanceTile label="Network Balance" value={agent.networkBalance} />
        <BalanceTile label="Available Balance" value={agent.availBalance} />
        <BalanceTile label="Balance" value={agent.balance} />
        <BalanceTile label="Commission Balance" value={agent.commissionBalance} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            Transfer Form
          </h3>

          <div className="space-y-4">
            <ReadonlyField label="From" value={transferDirection.fromUser} />
            <ReadonlyField label="To" value={transferDirection.toUser} />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </span>
              <input
                value={form.amount}
                onChange={(event) => updateForm("amount", event.target.value)}
                inputMode="decimal"
                className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isCommissionTransfer ? "Commission Balance" : "Note"}
              </span>
              <input
                value={isCommissionTransfer ? String(agent.commissionBalance) : form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                readOnly={isCommissionTransfer}
                className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Transfer Type
              </legend>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                <WalletRadio label="Top Up" value="main" wallet={form.wallet} onChange={switchWallet} />
                <WalletRadio label="Trust (Bailout)" value="trust" wallet={form.wallet} onChange={switchWallet} />
                <WalletRadio label="Commission" value="commission" wallet={form.wallet} onChange={switchWallet} />
              </div>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              {!isCommissionTransfer && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitTransfer("deposit")}
                  className="h-11 rounded-md bg-success-600 px-4 text-sm font-semibold text-white hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Processing..." : "Deposit"}
                </button>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitTransfer("withdraw")}
                className="h-11 rounded-md bg-error-600 px-4 text-sm font-semibold text-white hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            Transfer Details
          </h3>
          <dl className="space-y-4 text-sm">
            <DetailRow label="Withdraw From" value={transferDirection.fromUser} />
            <DetailRow label="Send To" value={transferDirection.toUser} />
            <DetailRow label="Amount" value={form.amount ? money(form.amount) : "-"} />
            <DetailRow label="Note" value={transferDirection.note || "-"} />
            <DetailRow label="Wallet" value={form.wallet === "main" ? "Top Up" : form.wallet === "trust" ? "Trust (Bailout)" : "Commission"} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function BalanceTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        {money(value)}
      </p>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <input
        value={value}
        readOnly
        className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
      />
    </label>
  );
}

function WalletRadio({
  label,
  value,
  wallet,
  onChange,
}: {
  label: string;
  value: WalletType;
  wallet: WalletType;
  onChange: (wallet: WalletType) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="radio"
        checked={wallet === value}
        onChange={() => onChange(value)}
        className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <dt className="font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

export default BankingTab;
