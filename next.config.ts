import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/ReportingAndBI/ReportingDashboard",
        destination: "/report/reporting_dashboard",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/GamingActivity",
        destination: "/report/gaming_activities",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/NetworkSales",
        destination: "/report/network_sales",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/OnlineSales",
        destination: "/report/online_sales",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/RegistrationsHistory",
        destination: "/report/registrations_history",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/AccountingReport",
        destination: "/report/accounting_report",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/PayoutTransactions",
        destination: "/report/payout_transactions",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/NetCashReport",
        destination: "/report/net_cash_report",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/RetailCashReport",
        destination: "/report/retail_cash_report",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/MoneyTransactions",
        destination: "/report/money_transactions",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/TaxReport",
        destination: "/report/tax_report",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/TaxOnTurnoverReport",
        destination: "/report/tax_on_turnover_report",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/Commission",
        destination: "/report/commission",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/LoginsHistory",
        destination: "/report/logins_history",
        permanent: false,
      },
      {
        source: "/ReportingAndBI/SystemTransactions",
        destination: "/report/system_transactions",
        permanent: false,
      },
      {
        source: "/Tickets/BetSearch",
        destination: "/tickets/quick_bet",
        permanent: false,
      },
      {
        source: "/Tickets/TicketsOnHold",
        destination: "/tickets/ticket-on-hold",
        permanent: false,
      },
      {
        source: "/Tickets/OpenBets",
        destination: "/tickets/open_bet",
        permanent: false,
      },
      {
        source: "/Tickets/BetsHistory",
        destination: "/tickets/bets-history",
        permanent: false,
      },
      {
        source: "/Tickets/PendingCashout",
        destination: "/tickets/pending-cashout-bets",
        permanent: false,
      },
      {
        source: "/Tickets/ExposureMonitor",
        destination: "/tickets/exposure-monitor",
        permanent: false,
      },
      {
        source: "/Tickets/DeclinedBetsHistory",
        destination: "/tickets/declined-bets-history",
        permanent: false,
      },
      {
        source: "/Tickets/HotMatches",
        destination: "/tickets/hot-matches",
        permanent: false,
      },
      {
        source: "/Tickets/SportsPerformance",
        destination: "/tickets/sports-performance",
        permanent: false,
      },
      {
        source: "/Tickets/UnsettledBets",
        destination: "/tickets/unsettled-bets",
        permanent: false,
      },
      {
        source: "/Tickets/WinningsOnHold",
        destination: "/tickets/winnings-on-hold",
        permanent: false,
      },
      {
        source: "/PlayerManagement/PlayerSearch",
        destination: "/player-management/player-search",
        permanent: false,
      },
      {
        source: "/PlayerManagement/OnlinePlayersReport",
        destination: "/player-management/online-players-report",
        permanent: false,
      },
      {
        source: "/PlayerManagement/RegistrationReport",
        destination: "/player-management/registration-report",
        permanent: false,
      },
      {
        source: "/PlayerManagement/PlayerSegmentation",
        destination: "/player-management/player-segmentation",
        permanent: false,
      },
      {
        source: "/PlayerManagement/CampaignTriggers",
        destination: "/player-management/campaign-triggers",
        permanent: false,
      },
      {
        source: "/PlayerManagement/InactivePlayersReport",
        destination: "/player-management/inactive-players-report",
        permanent: false,
      },
      {
        source: "/PlayerManagement/FrozenAccountsReport",
        destination: "/player-management/frozen-account-report",
        permanent: false,
      },
      {
        source: "/PlayerManagement/PlayerActivityReport",
        destination: "/player-management/player-activity-report",
        permanent: false,
      },
      {
        source: "/PlayerManagement/PlayerLiabilityReport",
        destination: "/player-management/player-liability-report",
        permanent: false,
      },
      {
        source: "/PlayerManagement/PlayerInfo/:PlayerId",
        destination: "/player-management/player-info/:PlayerId",
        permanent: false,
      },
      {
        source: "/Banking/DepositsWithdrawalsManager",
        destination: "/banking/deposits-withdrawals",
        permanent: false,
      },
      {
        source: "/Banking/RetailCashTransactions",
        destination: "/banking/retail-cash-sales",
        permanent: false,
      },
      {
        source: "/Banking/OperationBalanceTransfer",
        destination: "/banking/operation-balance-transfer",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows",
        destination: "/banking/cashflow",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/CashBooks",
        destination: "/banking/cashflow/cash-books",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/Cashbooks",
        destination: "/banking/cashflow/cash-books",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/CashIn",
        destination: "/banking/cashflow/cash-in",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/CashOut",
        destination: "/banking/cashflow/cash-out",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/Deductions",
        destination: "/banking/cashflow/deductions",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/Defcon",
        destination: "/banking/cashflow/defcon",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/Expenses",
        destination: "/banking/cashflow/expenses",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/Settings",
        destination: "/banking/cashflow/settings",
        permanent: false,
      },
      {
        source: "/Banking/Cashflows/Standings",
        destination: "/banking/cashflow/standings",
        permanent: false,
      },
      {
        source: "/Bonuses/List",
        destination: "/bonus-management/player-bonuses",
        permanent: false,
      },
      {
        source: "/Bonuses/Campaigns",
        destination: "/bonus-management/bonus-campaigns",
        permanent: false,
      },
      {
        source: "/Bonuses/BonusOnTickets",
        destination: "/bonus-management/multibet-bonus",
        permanent: false,
      },
      {
        source: "/Bonuses/GrantMassBonus",
        destination: "/bonus-management/grant-mass-bonuses",
        permanent: false,
      },
      {
        source: "/Bonuses/CashOut",
        destination: "/bonus-management/cashout",
        permanent: false,
      },
      {
        source: "/Bonuses/CutX",
        destination: "/bonus-management/cut-x",
        permanent: false,
      },
      {
        source: "/Bonuses/PlayerReports",
        destination: "/bonus-management/player-bonuses-report",
        permanent: false,
      },
      {
        source: "/Bonuses/PowerBonusCommission",
        destination: "/bonus-management/power-bonus-report",
        permanent: false,
      },
    ];
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
};

export default nextConfig;
