import {
  ConfigurationBadge,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const bonusGroups = [
  { id: "A", min: 1, max: 4, less: "2.5%", more: "1.5%", rate: "5%", stake: "NGN 5,000", coupon: "25" },
  { id: "B", min: 5, max: 9, less: "3.0%", more: "2.0%", rate: "7%", stake: "NGN 20,000", coupon: "75" },
  { id: "C", min: 10, max: 14, less: "4.0%", more: "2.5%", rate: "10%", stake: "NGN 50,000", coupon: "150" },
  { id: "D", min: 15, max: 30, less: "5.0%", more: "3.0%", rate: "12%", stake: "NGN 100,000", coupon: "250" },
];

export default function CommissionBonusGroupsPage() {
  return (
    <ConfigurationShell
      title="Manage Commission Bonus Groups"
      description="Configure bonus group thresholds for average selections, GGR margin bands, bonus rates, target stake, and target coupon counts."
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Groups", value: String(bonusGroups.length), detail: "Minimum of 4 required" },
          { label: "Max Bonus Rate", value: "12%", detail: "Highest configured rate" },
          { label: "Stake Target", value: "NGN 175k", detail: "Combined target" },
          { label: "Validation", value: "4+", detail: "Nuxt rule preserved" },
        ]}
      />

      <ConfigurationSection
        title="Bonus Groups"
        description="Nuxt blocked saves when fewer than four groups existed; keep that rule when API persistence is connected."
      >
        <ConfigurationTable
          columns={[
            { label: "Group", key: "group" },
            { label: "Avg. Min Sel", key: "min", align: "right" },
            { label: "Avg. Max Sel", key: "max", align: "right" },
            { label: "GGR Margin < 80%", key: "less", align: "right" },
            { label: "GGR Margin >= 80%", key: "more", align: "right" },
            { label: "Bonus Rate", key: "rate", align: "right" },
            { label: "Target Stake", key: "stake", align: "right" },
            { label: "Target Coupon", key: "coupon", align: "right" },
          ]}
          rows={bonusGroups.map((group) => ({
            id: group.id,
            group: <ConfigurationBadge tone="success">Group {group.id}</ConfigurationBadge>,
            min: group.min,
            max: group.max,
            less: group.less,
            more: group.more,
            rate: group.rate,
            stake: group.stake,
            coupon: group.coupon,
          }))}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
            Add More
          </button>
          <button className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Save Changes
          </button>
        </div>
      </ConfigurationSection>
    </ConfigurationShell>
  );
}
