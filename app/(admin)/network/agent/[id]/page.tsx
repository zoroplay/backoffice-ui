"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { Agency } from "../../agency-list/columns";
import { agentsApi, normalizeApiError } from "@/lib/api";

// Import tab components
import GamingActivityTab from "./components/GamingActivityTab";
import OpenBetsTab from "./components/OpenBetsTab";
import BetHistoryTab from "./components/BetHistoryTab";
import VirtualSportTab from "./components/VirtualSportTab";
import TransactionsTab from "./components/TransactionsTab";
import UsersTab from "./components/UsersTab";
import BankingTab from "./components/BankingTab";
import CommissionProfileTab from "./components/CommissionProfileTab";
import ActivityLogsTab from "./components/ActivityLogsTab";

type TabValue =
  | "gaming-activity"
  | "open-bets"
  | "bet-history"
  | "virtual-sport"
  | "transactions"
  | "users"
  | "banking"
  | "commission-profile"
  | "activity-logs";

function AgentOverviewPage() {
  const params = useParams();
  const agentId = params?.id as string;
  const [activeTab, setActiveTab] = useState<TabValue>("gaming-activity");
  const [agent, setAgent] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const toNumber = (value: unknown) => {
      const num = Number(value ?? 0);
      return Number.isFinite(num) ? num : 0;
    };

    const toAgency = (row: Record<string, unknown>): Agency => ({
      id: String(row.id ?? row.username ?? ""),
      username: String(row.username ?? ""),
      name: String(
        row.name ?? `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim()
      ),
      agentType: String(row.rolename ?? ""),
      status: Number(row.status ?? 0) === 1 ? "Active" : "Inactive",
      networkBalance: toNumber(row.network_balance),
      networkTrust: toNumber(row.network_trust_balance),
      availBalance: toNumber(row.available_balance),
      balance: toNumber(row.balance),
      commissionBalance: toNumber(row.commission_balance),
      trustUser: toNumber(row.trust_balance),
      tempBlock: Number(row.status ?? 0) !== 1,
    });

    const loadAgent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cacheRaw =
          typeof window !== "undefined"
            ? window.sessionStorage.getItem("agency-list-cache")
            : null;
        const cacheRows: Agency[] = cacheRaw ? (JSON.parse(cacheRaw) as Agency[]) : [];
        const cached =
          cacheRows.find((entry) => entry.id === agentId) ??
          cacheRows.find((entry) => entry.username === agentId);

        if (cached) {
          if (!cancelled) {
            setAgent(cached);
            setIsLoading(false);
          }
          return;
        }

        const response = await agentsApi.getAgents({
          page: 1,
          search: agentId,
          agent_type: "",
          state_id: "",
        });

        if (cancelled) return;

        const payload = response as {
          data?: {
            data?: unknown[];
          };
        };

        const list = Array.isArray(payload?.data?.data) ? payload.data.data : [];
        const matched = list
          .map((item) => toAgency((item as Record<string, unknown>) ?? {}))
          .find((entry) => entry.id === agentId || entry.username === agentId);

        if (matched) {
          setAgent(matched);
        } else {
          setError("Agent not found");
        }
      } catch (err) {
        if (cancelled) return;
        const apiError = normalizeApiError(err);
        setError(apiError.message ?? "Failed to load agent");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAgent();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <PageBreadcrumb pageTitle="Agent Overview" />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6 p-4">
        <PageBreadcrumb pageTitle="Agent Overview" />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {error ?? "Agent not found"}
          </p>
        </div>
      </div>
    );
  }

  const pageTitle = `Agent Overview (${agent.username})`;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={pageTitle} />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="flex flex-wrap gap-2 border border-dashed border-gray-200 dark:border-gray-700 w-full h-auto dark:bg-slate-800 p-0">
          <TabsTrigger
            value="gaming-activity"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Gaming Activity
          </TabsTrigger>
          <TabsTrigger
            value="open-bets"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Open Bets
          </TabsTrigger>
          <TabsTrigger
            value="bet-history"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Bet History
          </TabsTrigger>
          <TabsTrigger
            value="virtual-sport"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Virtual Sport
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="banking"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Banking
          </TabsTrigger>
          <TabsTrigger
            value="commission-profile"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Commission Profile
          </TabsTrigger>
          <TabsTrigger
            value="activity-logs"
            className="rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gaming-activity" className="mt-4">
          <GamingActivityTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="open-bets" className="mt-4">
          <OpenBetsTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="bet-history" className="mt-4">
          <BetHistoryTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="virtual-sport" className="mt-4">
          <VirtualSportTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <TransactionsTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UsersTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="banking" className="mt-4">
          <BankingTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="commission-profile" className="mt-4">
          <CommissionProfileTab agentId={agentId} agent={agent} />
        </TabsContent>

        <TabsContent value="activity-logs" className="mt-4">
          <ActivityLogsTab agentId={agentId} agent={agent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(AgentOverviewPage);

