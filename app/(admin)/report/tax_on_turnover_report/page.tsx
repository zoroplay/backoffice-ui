import {
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const summaryRows = [
  { id: "sports", product: "Sportsbook", turnover: "NGN 118.7m", rate: "1.0%", tax: "NGN 1.187m" },
  { id: "casino", product: "Casino", turnover: "NGN 72.4m", rate: "1.0%", tax: "NGN 724k" },
  { id: "virtual", product: "Virtual Sport", turnover: "NGN 18.1m", rate: "1.0%", tax: "NGN 181k" },
];

const detailRows = [
  { id: "TOT-001", date: "2026-07-20", product: "Sportsbook", turnover: "NGN 42.6m", taxable: "NGN 42.6m", tax: "NGN 426k" },
  { id: "TOT-002", date: "2026-07-21", product: "Casino", turnover: "NGN 31.4m", taxable: "NGN 31.4m", tax: "NGN 314k" },
  { id: "TOT-003", date: "2026-07-22", product: "Virtual Sport", turnover: "NGN 7.8m", taxable: "NGN 7.8m", tax: "NGN 78k" },
];

export default function TaxOnTurnoverReportPage() {
  return (
    <ReportPageShell
      title="Tax On Turnover Report"
      description="Calculate and review tax due on turnover by product and date. Nuxt had both Summary and Results tables with export support."
    >
      <ReportMetrics metrics={[
        { label: "Turnover", value: "NGN 209.2m", detail: "Taxable base" },
        { label: "Tax Due", value: "NGN 2.092m", detail: "Selected period" },
        { label: "Rate", value: "1.0%", detail: "Applied rate" },
        { label: "Products", value: "3", detail: "Reported groups" },
      ]} />
      <ReportFilters filters={[
        { label: "From", value: "2026-07-01" },
        { label: "To", value: "2026-07-22" },
        { label: "Product", placeholder: "All products", options: ["Sportsbook", "Casino", "Virtual Sport"] },
      ]} />
      <ReportSection title="Summary" description="Product-level tax summary.">
        <ReportTable
          columns={[
            { label: "Product", key: "product" },
            { label: "Turnover", key: "turnover", align: "right" },
            { label: "Rate", key: "rate", align: "right" },
            { label: "Tax", key: "tax", align: "right" },
          ]}
          rows={summaryRows}
        />
      </ReportSection>
      <ReportSection title="Results" description="Daily detail rows backing the tax calculation.">
        <ReportTable
          columns={[
            { label: "Date", key: "date" },
            { label: "Product", key: "product" },
            { label: "Turnover", key: "turnover", align: "right" },
            { label: "Taxable", key: "taxable", align: "right" },
            { label: "Tax", key: "tax", align: "right" },
          ]}
          rows={detailRows}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
