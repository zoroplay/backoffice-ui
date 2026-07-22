import {
  ConfigurationBadge,
  ConfigurationField,
  ConfigurationFormGrid,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const paymentMethods = [
  { id: "paystack", provider: "Paystack", channel: "Deposit", fee: "1.5%", limit: "NGN 1,000,000", status: "Active" },
  { id: "monnify", provider: "Monnify", channel: "Deposit and withdrawal", fee: "0.8%", limit: "NGN 5,000,000", status: "Active" },
  { id: "bank-transfer", provider: "Bank Transfer", channel: "Withdrawal", fee: "Flat NGN 50", limit: "NGN 2,000,000", status: "Inactive" },
];

export default function PaymentMethodsPage() {
  return (
    <ConfigurationShell
      title="Payment Methods Management"
      description="Review enabled payment providers and add new payment method records. Nuxt rendered provider detail tabs and refreshed the list after save events."
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Methods", value: String(paymentMethods.length), detail: "Configured providers" },
          { label: "Active", value: "2", detail: "Available to players" },
          { label: "Deposit Rails", value: "2", detail: "Accept incoming funds" },
          { label: "Withdrawal Rails", value: "2", detail: "Payout capable" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),420px]">
        <ConfigurationSection title="Payment Method Details">
          <ConfigurationTable
            columns={[
              { label: "Provider", key: "provider" },
              { label: "Channel", key: "channel" },
              { label: "Fee", key: "fee", align: "right" },
              { label: "Limit", key: "limit", align: "right" },
              { label: "Status", key: "status" },
            ]}
            rows={paymentMethods.map((method) => ({
              ...method,
              status: (
                <ConfigurationBadge tone={method.status === "Active" ? "success" : "neutral"}>
                  {method.status}
                </ConfigurationBadge>
              ),
            }))}
          />
        </ConfigurationSection>

        <ConfigurationSection title="Add New Payment Method">
          <form className="space-y-5">
            <ConfigurationFormGrid>
              <ConfigurationField label="Provider" value="" />
              <ConfigurationField label="Channel" options={["Deposit", "Withdrawal", "Deposit and withdrawal"]} />
              <ConfigurationField label="Fee" value="" />
              <ConfigurationField label="Daily Limit" value="" type="number" />
              <ConfigurationField label="Status" options={["Active", "Inactive"]} />
            </ConfigurationFormGrid>
            <button type="button" className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Save Payment Method
            </button>
          </form>
        </ConfigurationSection>
      </div>
    </ConfigurationShell>
  );
}
