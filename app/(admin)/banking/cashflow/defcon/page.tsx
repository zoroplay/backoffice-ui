import {
  BankingBadge,
  BankingMetrics,
  BankingPageShell,
  BankingSection,
  BankingTable,
  money,
} from "../../components/BankingPageShell";

const defconRows = [
  { id: "DEF-001", branch: "Lagos Main Branch", cashbook: money(340000), expected: money(350000), variance: money(-10000), level: "Watch" },
  { id: "DEF-002", branch: "Abuja Branch", cashbook: money(370000), expected: money(370000), variance: money(0), level: "Normal" },
  { id: "DEF-003", branch: "Kano Branch", cashbook: money(215000), expected: money(260000), variance: money(-45000), level: "Critical" },
];

export default function DefconPage() {
  return (
    <BankingPageShell
      title="Defcon"
      description="Monitor cashflow variance and operational alert levels for branch finance control."
    >
      <BankingMetrics metrics={[
        { label: "Branches", value: "3", detail: "Monitored" },
        { label: "Critical", value: "1", detail: "Immediate action" },
        { label: "Watch", value: "1", detail: "Variance review" },
        { label: "Normal", value: "1", detail: "Balanced" },
      ]} />
      <BankingSection title="Defcon Status">
        <BankingTable
          columns={[
            { label: "Branch", key: "branch" },
            { label: "Cashbook", key: "cashbook", align: "right" },
            { label: "Expected", key: "expected", align: "right" },
            { label: "Variance", key: "variance", align: "right" },
            { label: "Level", key: "level" },
          ]}
          rows={defconRows.map((item) => ({
            ...item,
            level: (
              <BankingBadge tone={item.level === "Critical" ? "danger" : item.level === "Watch" ? "warning" : "success"}>
                {item.level}
              </BankingBadge>
            ),
          }))}
        />
      </BankingSection>
    </BankingPageShell>
  );
}
