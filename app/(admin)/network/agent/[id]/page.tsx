"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { Agency } from "../../agency-list/columns";
import { GETREQUEST } from "@/utils/base_request";
import { asRecord, clientId, rowValue, toNumber } from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);

  async function loadAgent({ showLoader = false }: { showLoader?: boolean } = {}) {
    if (!agentId) return;
    if (showLoader) setLoading(true);
    const response = await GETREQUEST<any>(`/admin/retail/${clientId()}/agent/${agentId}`);
    if (showLoader) setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const data = asRecord(body.data);
    setAgent({
      id: String(rowValue(data, ["id"], agentId)),
      username: String(rowValue(data, ["username"], agentId)),
      name: String(
        rowValue(
          data,
          ["name"],
          `${rowValue(data, ["firstName", "first_name"], "")} ${rowValue(data, ["lastName", "last_name"], "")}`.trim()
        )
      ),
      agentType: String(rowValue(data, ["rolename", "role", "agentType"], "")),
      status: String(rowValue(data, ["status"], "")),
      networkBalance: toNumber(data.networkBalance ?? data.network_balance),
      networkTrust: toNumber(data.networkTrust ?? data.network_trust),
      availBalance: toNumber(data.availBalance ?? data.available_balance ?? data.avail_balance),
      balance: toNumber(data.balance),
      commissionBalance: toNumber(data.commissionBalance ?? data.commission_balance),
      trustUser: toNumber(data.trustUser ?? data.trust_user),
      tempBlock: Boolean(data.tempBlock ?? data.temp_block),
    });
  }

  useEffect(() => {
    void loadAgent({ showLoader: true });
  }, [agentId]);

  if (loading || !agent) {
    return (
      <div className="space-y-6 p-4">
        <PageBreadcrumb pageTitle="Agent Overview" />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {loading ? "Loading agent" : "Agent not found"}
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
        <TabsList className="flex flex-wrap gap-2 border border-dashed border-gray-200 dark:border-gray-700 w-full h-auto dark:bg-transparent p-0">
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
          <BankingTab agentId={agentId} agent={agent} onTransferComplete={() => loadAgent()} />
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
