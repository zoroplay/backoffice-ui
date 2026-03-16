"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/ui/button/Button";
import { DataTable } from "@/components/tables/DataTable";
import { Plus, Trash2, Settings, Users, Calculator, Wallet, Search, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

import { 
  providers, 
  BonusTier,
  PowerBonusConfig,
  AgentAssignment,
  DashboardRow
} from "./data";
import { configColumns, assignmentColumns, dashboardColumns } from "./columns";
import { bonusesApi } from "@/lib/api/modules/bonuses";

const sectionHeaderClassName = "flex items-center gap-2 bg-brand-500 p-4 text-white font-semibold rounded-t-2xl";

const PowerBonusReportPage = () => {
  const [activeTab, setActiveTab] = useState("configurations");
  const [isLoading, setIsLoading] = useState(false);

  const providerOptions = providers.map(p => ({ value: p, label: p }));

  // Tab 1 States: Configurations
  const [configs, setConfigs] = useState<PowerBonusConfig[]>([]);
  const [newConfig, setNewConfig] = useState<Partial<PowerBonusConfig>>({
    provider: "",
    targetStake: 0,
    startDate: "",
    endDate: "",
    isActive: true
  });
  const [tiers, setTiers] = useState<Partial<BonusTier>[]>([
    { id: "1", minSelections: 0, maxSelections: 0, rateLowMargin: 0, rateHighMargin: 0 }
  ]);

  // Tab 2 States: Assignments
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [searchAgentId, setSearchAgentId] = useState("");
  const [assignForm, setAssignForm] = useState({
    agentId: "",
    powerBonusId: "",
    provider: ""
  });

  // Tab 3 States: Calculation & Dashboard
  const [calcForm, setCalcForm] = useState({
    provider: "",
    from: "",
    to: "",
    agentId: ""
  });
  const [dashForm, setDashForm] = useState({
    provider: "",
    from: "",
    to: ""
  });
  const [dashboardData, setDashboardData] = useState<DashboardRow[]>([]);

  // Fetch Configurations on mount
  React.useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const data = await bonusesApi.getPowerBonusConfigurations();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      if (!newConfig.provider || !newConfig.startDate || !newConfig.endDate) {
        toast.error("Please fill all required fields");
        return;
      }
      setIsLoading(true);
      const payload = {
        ...newConfig,
        tiers: tiers.map(({ id, ...rest }) => rest)
      };
      await bonusesApi.createPowerBonusConfiguration(payload);
      toast.success("Configuration created successfully");
      fetchConfigs();
    } catch (error) {
      toast.error("Failed to create configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    try {
      if (!assignForm.agentId || !assignForm.powerBonusId || !assignForm.provider) {
        toast.error("Please fill all assignment fields");
        return;
      }
      setIsLoading(true);
      await bonusesApi.assignAgentToPowerBonus(assignForm);
      toast.success("Agent assigned successfully");
    } catch (error) {
      toast.error("Failed to assign agent");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentAssignments = async () => {
    if (!searchAgentId) {
      toast.error("Please enter an Agent ID");
      return;
    }
    try {
      setIsLoading(true);
      const data = await bonusesApi.listAgentPowerBonusAssignments(searchAgentId);
      const assignmentsList = Array.isArray(data) ? data : [];
      setAssignments(assignmentsList);
      toast.success(`Found ${assignmentsList.length} assignments`);
    } catch (error) {
      toast.error("Failed to fetch agent assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCalculation = async () => {
    try {
      if (!calcForm.provider || !calcForm.from || !calcForm.to) {
        toast.error("Provider and date range are required");
        return;
      }
      setIsLoading(true);
      await bonusesApi.calculatePowerBonusForAgent(calcForm);
      toast.success("Calculation triggered successfully");
    } catch (error) {
      toast.error("Failed to run calculation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDashboard = async () => {
    try {
      if (!dashForm.provider || !dashForm.from || !dashForm.to) {
        toast.error("Provider and date range are required");
        return;
      }
      setIsLoading(true);
      const data = await bonusesApi.getPowerBonusDashboard(dashForm);
      setDashboardData(Array.isArray(data) ? data : []);
      toast.success("Dashboard data loaded");
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayBonus = async () => {
    try {
      if (!dashForm.provider || !dashForm.from || !dashForm.to) {
        toast.error("Please select provider and dates in Dashboard tab first");
        return;
      }
      setIsLoading(true);
      await bonusesApi.payPowerBonusToAgents(dashForm);
      toast.success("Payout process triggered successfully");
    } catch (error) {
      toast.error("Failed to trigger payout");
    } finally {
      setIsLoading(false);
    }
  };

  const addTier = () => {
    setTiers([...tiers, { id: Date.now().toString(), minSelections: 0, maxSelections: 0, rateLowMargin: 0, rateHighMargin: 0 }]);
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Power Bonus Report" />

      <Tabs defaultValue="configurations" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <TabsTrigger value="configurations" className="px-6 py-2.5 rounded-lg"><Settings className="w-4 h-4 mr-2" /> Configurations</TabsTrigger>
          <TabsTrigger value="assignments" className="px-6 py-2.5 rounded-lg"><Users className="w-4 h-4 mr-2" /> Assignments</TabsTrigger>
          <TabsTrigger value="calculation" className="px-6 py-2.5 rounded-lg"><Calculator className="w-4 h-4 mr-2" /> Calculation & Dashboard</TabsTrigger>
          <TabsTrigger value="pay" className="px-6 py-2.5 rounded-lg"><Wallet className="w-4 h-4 mr-2" /> Pay Bonus</TabsTrigger>
        </TabsList>

        {/* 1. CONFIGURATIONS CONTENT */}
        <TabsContent value="configurations" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          {/* Create Configuration Form */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
            <div className={sectionHeaderClassName}>
              <Plus className="w-5 h-5" /> Create Configuration
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Provider</label>
                  <Select 
                    options={providerOptions} 
                    placeholder="Select provider" 
                    onChange={(val: any) => setNewConfig({ ...newConfig, provider: val.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Target Stake</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    onChange={(e) => setNewConfig({ ...newConfig, targetStake: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Start Date</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setNewConfig({ ...newConfig, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">End Date</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setNewConfig({ ...newConfig, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="active" 
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 h-4 w-4" 
                  checked={newConfig.isActive}
                  onChange={(e) => setNewConfig({ ...newConfig, isActive: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
              </div>

              {/* Tiers Sub-Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                   <Layers className="w-4 h-4 text-brand-500" /> Bonus Tiers
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Min Selections</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Max Selections</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Rate Low Margin (%)</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Rate High Margin (%)</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {tiers.map((tier, idx) => (
                        <tr key={tier.id}>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              className="text-center" 
                              value={tier.minSelections} 
                              onChange={(e) => {
                                const updated = [...tiers];
                                updated[idx].minSelections = parseInt(e.target.value);
                                setTiers(updated);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              className="text-center" 
                              value={tier.maxSelections} 
                              onChange={(e) => {
                                const updated = [...tiers];
                                updated[idx].maxSelections = parseInt(e.target.value);
                                setTiers(updated);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              className="text-center" 
                              value={tier.rateLowMargin} 
                              onChange={(e) => {
                                const updated = [...tiers];
                                updated[idx].rateLowMargin = parseFloat(e.target.value);
                                setTiers(updated);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input 
                              type="number" 
                              className="text-center" 
                              value={tier.rateHighMargin} 
                              onChange={(e) => {
                                const updated = [...tiers];
                                updated[idx].rateHighMargin = parseFloat(e.target.value);
                                setTiers(updated);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Button variant="outline" size="sm" onClick={() => removeTier(tier.id!)} className="text-error-600 h-11 px-3">
                              <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={addTier} className="border-gray-300 dark:border-gray-700">Add Tier</Button>
                  <Button onClick={handleCreateConfig} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Configuration"}
                  </Button>
                  <Button variant="outline" className="text-gray-500" onClick={() => {
                    setNewConfig({ provider: "", targetStake: 0, startDate: "", endDate: "", isActive: true });
                    setTiers([{ id: "1", minSelections: 0, maxSelections: 0, rateLowMargin: 0, rateHighMargin: 0 }]);
                  }}>Reset</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Existing Configurations Table */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
            <div className={sectionHeaderClassName}>
              <Settings className="w-5 h-5" /> Power Bonus Configurations
            </div>
            <div className="p-4">
              <DataTable columns={configColumns} data={configs} loading={isLoading} />
            </div>
          </section>
        </TabsContent>

        {/* 2. ASSIGNMENTS CONTENT */}
        <TabsContent value="assignments" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
              <div className={sectionHeaderClassName}><Plus className="w-5 h-5" /> Assign Agent to Power Bonus</div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Agent ID</label>
                  <Input 
                    placeholder="Ex: AGENT-123" 
                    value={assignForm.agentId}
                    onChange={(e) => setAssignForm({ ...assignForm, agentId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Power Bonus ID</label>
                  <Input 
                    placeholder="Ex: PB-001" 
                    value={assignForm.powerBonusId}
                    onChange={(e) => setAssignForm({ ...assignForm, powerBonusId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Provider</label>
                  <Select 
                    options={providerOptions} 
                    placeholder="Select provider" 
                    onChange={(val: any) => setAssignForm({ ...assignForm, provider: val.value })} 
                  />
                </div>
                <Button className="w-full mt-2" onClick={handleAssignAgent} disabled={isLoading}>
                  {isLoading ? "Assigning..." : "Assign Agent"}
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
              <div className={sectionHeaderClassName}><Search className="w-5 h-5" /> Fetch Agent Assignments</div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Agent ID</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search Agent ID" 
                      value={searchAgentId}
                      onChange={(e) => setSearchAgentId(e.target.value)}
                    />
                    <Button onClick={fetchAgentAssignments} disabled={isLoading}>
                      {isLoading ? "Loading..." : "Load"}
                    </Button>
                  </div>
                </div>
                {assignments.length > 0 ? (
                  <div className="mt-4">
                    <DataTable columns={assignmentColumns} data={assignments} />
                  </div>
                ) : (
                  <div className="mt-4 p-4 border rounded-xl border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-400 text-sm">
                    Assignments table will appear here after loading
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
            <div className={sectionHeaderClassName}><Layers className="w-5 h-5" /> All Assignments</div>
            <div className="p-4">
              <DataTable columns={assignmentColumns} data={assignments} loading={isLoading} />
            </div>
          </section>
        </TabsContent>

        {/* 3. CALCULATION & DASHBOARD CONTENT */}
        <TabsContent value="calculation" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
           <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
              <div className={sectionHeaderClassName}><RefreshCw className="w-5 h-5" /> Calculate For Agent</div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Provider</label>
                  <Select 
                    options={providerOptions} 
                    onChange={(val: any) => setCalcForm({ ...calcForm, provider: val.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">From</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setCalcForm({ ...calcForm, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">To</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setCalcForm({ ...calcForm, to: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Agent ID</label>
                  <Input 
                    placeholder="Optional" 
                    onChange={(e) => setCalcForm({ ...calcForm, agentId: e.target.value })}
                  />
                </div>
                <Button onClick={handleRunCalculation} disabled={isLoading}>
                  {isLoading ? "Running..." : "Run Calculation"}
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
              <div className={sectionHeaderClassName}><Calculator className="w-5 h-5" /> Dashboard Breakdown</div>
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Provider</label>
                  <Select 
                    options={providerOptions} 
                    onChange={(val: any) => setDashForm({ ...dashForm, provider: val.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">From</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setDashForm({ ...dashForm, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">To</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setDashForm({ ...dashForm, to: e.target.value })}
                  />
                </div>
                <Button onClick={handleLoadDashboard} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Load Dashboard"}
                </Button>
              </div>
              <div className="p-4">
                <DataTable columns={dashboardColumns} data={dashboardData} loading={isLoading} />
              </div>
            </section>
        </TabsContent>

        {/* 4. PAY BONUS CONTENT */}
        <TabsContent value="pay" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
            <div className={sectionHeaderClassName}><Wallet className="w-5 h-5" /> Pay Power Bonus</div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-brand-50 border border-brand-100 dark:bg-brand-900/20 dark:border-brand-800 rounded-xl text-sm text-brand-700 dark:text-brand-300">
                This pays the currently loaded dashboard rows. Use the **Dashboard Breakdown** tab to fetch and validate rows first.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Provider</label>
                  <Select 
                    options={providerOptions} 
                    onChange={(val: any) => setDashForm({ ...dashForm, provider: val.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">From</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setDashForm({ ...dashForm, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">To</label>
                  <Input 
                    type="date" 
                    onChange={(e) => setDashForm({ ...dashForm, to: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                size="md" 
                className="px-8" 
                onClick={handlePayBonus} 
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Pay Loaded Agents"}
              </Button>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(PowerBonusReportPage);