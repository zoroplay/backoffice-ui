import {
  ConfigurationBadge,
  ConfigurationField,
  ConfigurationFormGrid,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const commissionRows = [
  { id: "retail-l1", name: "Retail Level 1", basis: "Turnover", rate: "6.5%", product: "Sportsbook", status: "Active" },
  { id: "retail-l2", name: "Retail Level 2", basis: "GGR", rate: "12.0%", product: "Sportsbook", status: "Active" },
  { id: "casino", name: "Casino Provider Share", basis: "GGR", rate: "8.0%", product: "Casino", status: "Active" },
  { id: "virtual", name: "Virtual Sports", basis: "Net Revenue", rate: "5.0%", product: "Virtual", status: "Draft" },
];

export default function CommissionSettingsPage() {
  return (
    <ConfigurationShell
      title="Commission Settings"
      description="Manage commission rules, calculation basis, product scope, rate, and activation status for agency and product revenue sharing."
      actions={[{ label: "Bonus Groups", href: "/configurations/commission-bonus-groups", variant: "secondary" }]}
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Rules", value: String(commissionRows.length), detail: "Configured profiles" },
          { label: "Active", value: "3", detail: "Applied at settlement" },
          { label: "Highest Rate", value: "12%", detail: "Current table" },
          { label: "Products", value: "3", detail: "Sportsbook, casino, virtual" },
        ]}
      />

      <ConfigurationSection title="Add or Edit Commission Rule">
        <form className="space-y-5">
          <ConfigurationFormGrid>
            <ConfigurationField label="Name" value="Retail Level 1" />
            <ConfigurationField label="Product" value="Sportsbook" options={["Sportsbook", "Casino", "Virtual", "Retail"]} />
            <ConfigurationField label="Calculation Basis" value="Turnover" options={["Turnover", "GGR", "Net Revenue"]} />
            <ConfigurationField label="Rate (%)" value={6.5} type="number" />
            <ConfigurationField label="Minimum Stake" value={0} type="number" />
            <ConfigurationField label="Status" value="Active" options={["Active", "Draft", "Inactive"]} />
          </ConfigurationFormGrid>
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Save Rule
            </button>
          </div>
        </form>
      </ConfigurationSection>

      <ConfigurationSection title="Commission Rules">
        <ConfigurationTable
          columns={[
            { label: "Name", key: "name" },
            { label: "Product", key: "product" },
            { label: "Basis", key: "basis" },
            { label: "Rate", key: "rate", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={commissionRows.map((row) => ({
            ...row,
            status: (
              <ConfigurationBadge tone={row.status === "Active" ? "success" : "warning"}>
                {row.status}
              </ConfigurationBadge>
            ),
          }))}
        />
      </ConfigurationSection>
    </ConfigurationShell>
  );
}
