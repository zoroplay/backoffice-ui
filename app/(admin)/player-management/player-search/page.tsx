"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { createColumns, Player } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { Infotext } from "@/components/common/Info";
import { apiEnv, bonusesApi, normalizeApiError, playerApi } from "@/lib/api";
import Button from "@/components/ui/button/Button";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { toast } from "sonner";
import {
  ChangePasswordActionModal,
  ConfirmAccountActionModal,
  GiveBonusModal,
  WalletAdjustmentModal,
  type PlayerActionTarget,
} from "./components";

function PlayerSmartSearchPage() {
  const [rows, setRows] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const emptyStateText = "Search to see data.";
  const [activeQuery, setActiveQuery] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedUser, setSelectedUser] = useState<PlayerActionTarget | null>(null);
  const [activeAction, setActiveAction] = useState<
    | null
    | "changePassword"
    | "manualDeposit"
    | "manualWithdrawal"
    | "giveBonus"
    | "verifyUser"
    | "freezeUser"
    | "unfreezeUser"
    | "terminateUser"
  >(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [bonusOptions, setBonusOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingBonusOptions, setIsLoadingBonusOptions] = useState(false);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder(
      "Search by Customer Code, Name, Username, Email, or Phone..."
    );

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const handleSearch = () => {
    const nextQuery = query.trim();
    setActiveQuery(nextQuery);
    setPage(1);
    setHasSearched(true);
  };

  const handleClear = () => {
    resetQuery();
    setRows([]);
    setTotalPages(1);
    setTotal(0);
    setHasSearched(false);
    setError(null);
    setActiveQuery("");
    setPage(1);
  };

  const toPlayer = (row: Record<string, unknown>): Player => ({
    id: Number(row.id ?? row.userId ?? 0),
    code: String(row.code ?? row.customerCode ?? row.id ?? ""),
    username: String(row.username ?? row.user ?? ""),
    fullName: String(row.fullName ?? row.name ?? ""),
    status: Number(row.status ?? 0),
    playerStatus:
      Number(row.status ?? 0) === 1
        ? "Active"
        : Number(row.status ?? 0) === 2
        ? "Frozen"
        : "Terminated",
    email: String(row.email ?? ""),
    phone: String(row.phone ?? row.mobile ?? ""),
    registeredOn: String(row.registered ?? row.registeredOn ?? row.createdAt ?? ""),
    country: String(row.country ?? ""),
    currency: String(row.currency ?? ""),
    verified: Number(row.verified ?? 0),
    verificationStatus: Number(row.verified ?? 0) === 1 ? "Verified" : "Unverified",
  });

  const paginationInfo = useMemo(
    () => ({
      page,
      totalPages,
      total,
    }),
    [page, total, totalPages]
  );

  const runSearch = () => {
    if (!hasSearched) return;
    setRefreshTick((prev) => prev + 1);
  };

  const openActionModal = (
    action:
      | "changePassword"
      | "manualDeposit"
      | "manualWithdrawal"
      | "giveBonus"
      | "verifyUser"
      | "freezeUser"
      | "unfreezeUser"
      | "terminateUser",
    player: Player
  ) => {
    setSelectedUser({
      id: player.id,
      username: player.username,
      status: player.status,
      verified: player.verified,
    });
    setActiveAction(action);
  };

  const closeActionModal = () => {
    setActiveAction(null);
    setSelectedUser(null);
    setIsSubmittingAction(false);
  };

  useEffect(() => {
    if (activeAction !== "giveBonus") return;
    if (bonusOptions.length > 0) return;

    let cancelled = false;

    const loadBonusOptions = async () => {
      setIsLoadingBonusOptions(true);
      try {
        const res = await bonusesApi.getBonuses();
        if (cancelled) return;

        const root = (res as { data?: unknown })?.data ?? res;
        const bonusList =
          ((root as { bonus?: unknown })?.bonus as unknown[]) ||
          ((root as { data?: unknown })?.data as unknown[]) ||
          (Array.isArray(root) ? root : []);

        const options = Array.isArray(bonusList)
          ? bonusList
              .map((item) => {
                const row = (item as Record<string, unknown>) ?? {};
                const name = String(row.name ?? "").trim();
                if (!name) return null;
                return { value: name, label: name };
              })
              .filter(
                (option): option is { value: string; label: string } =>
                  Boolean(option)
              )
          : [];

        setBonusOptions(options);
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeApiError(err);
        toast.error(apiErr.message ?? "Failed to load bonus options");
      } finally {
        if (!cancelled) setIsLoadingBonusOptions(false);
      }
    };

    void loadBonusOptions();

    return () => {
      cancelled = true;
    };
  }, [activeAction, bonusOptions.length]);

  const columns = useMemo(
    () =>
      createColumns({
        onChangePassword: (player) => openActionModal("changePassword", player),
        onManualDeposit: (player) => openActionModal("manualDeposit", player),
        onManualWithdrawal: (player) =>
          openActionModal("manualWithdrawal", player),
        onGiveBonus: (player) => openActionModal("giveBonus", player),
        onVerifyUser: (player) => openActionModal("verifyUser", player),
        onFreezeUser: (player) => openActionModal("freezeUser", player),
        onUnfreezeUser: (player) => openActionModal("unfreezeUser", player),
        onTerminateUser: (player) => openActionModal("terminateUser", player),
      }),
    []
  );

  useEffect(() => {
    if (!hasSearched) return;
    const searchKey = activeQuery.trim();

    let cancelled = false;

    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await playerApi.searchPlayers({
          searchKey,
          clientId: Number(apiEnv.clientId),
          page,
          limit,
        });

        if (cancelled) return;

        const payload = res as {
          data?: unknown;
          page?: number;
          limit?: number;
          totalPages?: number;
          total?: number;
        };

        const list = Array.isArray(payload?.data) ? payload.data : [];
        const nextRows = list.map((row) =>
          toPlayer((row as Record<string, unknown>) ?? {})
        );

        setRows(nextRows);
        setTotalPages(Number(payload?.totalPages ?? 1));
        setTotal(Number(payload?.total ?? nextRows.length));
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeApiError(err);
        setError(apiErr.message ?? "Failed to fetch players");
        setRows([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchPlayers();

    return () => {
      cancelled = true;
    };
  }, [activeQuery, hasSearched, limit, page, refreshTick]);

  const handleChangePassword = async (payload: {
    password: string;
    conf_password: string;
  }) => {
    if (!selectedUser) return;
    setIsSubmittingAction(true);
    try {
      await playerApi.changePassword({
        ...payload,
        userId: selectedUser.id,
        username: selectedUser.username,
        clientId: Number(apiEnv.clientId),
      });
      toast.success("Password changed successfully");
      closeActionModal();
    } catch (err) {
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message ?? "Failed to change password");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleWalletAdjustment = async (
    action: "deposit" | "withdraw",
    payload: { amount: string; description: string }
  ) => {
    if (!selectedUser) return;
    setIsSubmittingAction(true);
    try {
      await playerApi.transferFunds({
        amount: payload.amount,
        description: payload.description,
        action,
        userId: selectedUser.id,
        clientId: Number(apiEnv.clientId),
        username: selectedUser.username,
        source: "admin",
        wallet: "main",
        subject: "Wallet Adjustment",
        channel: "admin",
      });
      toast.success(
        action === "deposit"
          ? "Manual deposit completed"
          : "Manual withdrawal completed"
      );
      closeActionModal();
      runSearch();
    } catch (err) {
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message ?? "Failed to process wallet adjustment");
    } finally {
      setIsSubmittingAction(false);
    }
  }; 

  const handleGiveBonus = async (payload: {
    bonusType: string;
    amount: string;
  }) => {
    if (!selectedUser) return;
    setIsSubmittingAction(true);
    try {
      await bonusesApi.giveBonus({
        bonusType: payload.bonusType,
        amount: payload.amount,
        userId: selectedUser.id,
        username: selectedUser.username,
        clientId: Number(apiEnv.clientId),
      });
      toast.success("Bonus granted successfully");
      closeActionModal();
      runSearch();
    } catch (err) {
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message ?? "Failed to grant bonus");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!selectedUser) return;
    setIsSubmittingAction(true);
    try {
      await playerApi.verifyAccount(selectedUser.id);
      toast.success("Account verified successfully");
      closeActionModal();
      runSearch();
    } catch (err) {
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message ?? "Failed to verify account");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleUpdateStatus = async (
    status: 1 | 2 | 3,
    message: string,
    shouldResetPage = false
  ) => {
    if (!selectedUser) return;
    setIsSubmittingAction(true);
    try {
      await playerApi.updateStatus(selectedUser.id, status);
      toast.success(message);
      closeActionModal();
      if (shouldResetPage) {
        setPage(1);
      }
      setRefreshTick((prev) => prev + 1);
    } catch (err) {
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message ?? "Failed to update account status");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 p-4">

      <PageBreadcrumb pageTitle="Player Smart Search" />
      <Infotext text="Use the global search to filter by Customer Code, Name, Username, Email." />

      <TableFilterToolbar
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        isLoading={isLoading}
      />

      {/* Data Table */}
      <div className="overflow-x-auto custom-scrollbar">
        {!hasSearched ? (
          <div className="flex justify-center py-8 text-gray-500">
            {emptyStateText}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <DataTable
              columns={columns}
              data={rows}
              loading={isLoading}
              pageSize={limit}
              hidePagination
            />
          </>
        )}
      </div>

      {hasSearched ? (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {paginationInfo.page} of {paginationInfo.totalPages} (
            {paginationInfo.total} total rows)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={paginationInfo.page <= 1 || isLoading}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={paginationInfo.page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(paginationInfo.totalPages, prev + 1))
              }
              disabled={
                paginationInfo.page >= paginationInfo.totalPages || isLoading
              }
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(paginationInfo.totalPages)}
              disabled={
                paginationInfo.page >= paginationInfo.totalPages || isLoading
              }
            >
              Last
            </Button>
          </div>
        </div>
      ) : null}

      <ChangePasswordActionModal
        isOpen={activeAction === "changePassword"}
        user={selectedUser}
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        onSubmit={handleChangePassword}
      />

      <WalletAdjustmentModal
        isOpen={activeAction === "manualDeposit"}
        user={selectedUser}
        action="deposit"
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        onSubmit={(payload) => handleWalletAdjustment("deposit", payload)}
      />

      <WalletAdjustmentModal
        isOpen={activeAction === "manualWithdrawal"}
        user={selectedUser}
        action="withdraw"
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        onSubmit={(payload) => handleWalletAdjustment("withdraw", payload)}
      />

      <GiveBonusModal
        isOpen={activeAction === "giveBonus"}
        user={selectedUser}
        options={bonusOptions}
        isOptionsLoading={isLoadingBonusOptions}
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        onSubmit={handleGiveBonus}
      />

      <ConfirmAccountActionModal
        isOpen={activeAction === "verifyUser"}
        user={selectedUser}
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        title="Verify Account"
        message="Are you sure you want to verify this account"
        onConfirm={handleVerifyUser}
      />

      <ConfirmAccountActionModal
        isOpen={activeAction === "freezeUser"}
        user={selectedUser}
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        title="Freeze Account"
        message="Are you sure you want to freeze this account"
        onConfirm={() => handleUpdateStatus(2, "Account frozen successfully", true)}
      />

      <ConfirmAccountActionModal
        isOpen={activeAction === "unfreezeUser"}
        user={selectedUser}
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        title="Unfreeze Account"
        message="Are you sure you want to unfreeze this account"
        onConfirm={() => handleUpdateStatus(1, "Account unfrozen successfully", true)}
      />

      <ConfirmAccountActionModal
        isOpen={activeAction === "terminateUser"}
        user={selectedUser}
        isSubmitting={isSubmittingAction}
        onClose={closeActionModal}
        title="Terminate Account"
        message="Are you sure you want to terminate this account"
        confirmVariant="error"
        onConfirm={() =>
          handleUpdateStatus(3, "Account terminated successfully", true)
        }
      />
    </div>
  );
}

export default withAuth(PlayerSmartSearchPage);
