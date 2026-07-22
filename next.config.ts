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
      {
        source: "/UserManagement/Users",
        destination: "/user-management/users",
        permanent: false,
      },
      {
        source: "/UserManagement/AddUser",
        destination: "/user-management/add-user",
        permanent: false,
      },
      {
        source: "/UserManagement/EditUser/:UserId",
        destination: "/user-management/edit-user/:UserId",
        permanent: false,
      },
      {
        source: "/UserManagement/RolesPermissions",
        destination: "/user-management/roles-permissions",
        permanent: false,
      },
      {
        source: "/UserManagement/ActivityLogs",
        destination: "/user-management/activity-logs",
        permanent: false,
      },
      {
        source: "/UserManagement/ChangePassword",
        destination: "/change-password",
        permanent: false,
      },
      {
        source: "/Network/AgencyList",
        destination: "/network/agency-list",
        permanent: false,
      },
      {
        source: "/Network/PendingReq",
        destination: "/network/pending-requests",
        permanent: false,
      },
      {
        source: "/Network/NewAgent",
        destination: "/network/add-new-agent",
        permanent: false,
      },
      {
        source: "/Network/Commissions",
        destination: "/network/commissions",
        permanent: false,
      },
      {
        source: "/Network/CommissionReporting",
        destination: "/network/commission-reporting",
        permanent: false,
      },
      {
        source: "/Network/Transfer",
        destination: "/network/transfer",
        permanent: false,
      },
      {
        source: "/Network/Agent/:Index",
        destination: "/network/agent/:Index",
        permanent: false,
      },
      {
        source: "/Network/Agent/User/:Index",
        destination: "/network/agent/user/:Index",
        permanent: false,
      },
      {
        source: "/Casino2",
        destination: "/casino",
        permanent: false,
      },
      {
        source: "/Casino/BetsHistory",
        destination: "/casino/bets-history",
        permanent: false,
      },
      {
        source: "/Casino/CasinoMenu",
        destination: "/casino/menu",
        permanent: false,
      },
      {
        source: "/Casino/CasinoReporting",
        destination: "/casino/reporting",
        permanent: false,
      },
      {
        source: "/Casino/Categories",
        destination: "/casino/categories",
        permanent: false,
      },
      {
        source: "/Casino/Game",
        destination: "/casino/game",
        permanent: false,
      },
      {
        source: "/Casino/Games",
        destination: "/casino/games",
        permanent: false,
      },
      {
        source: "/Casino/Games/AddNew",
        destination: "/casino/games/add-new",
        permanent: false,
      },
      {
        source: "/Casino/Games/:Game",
        destination: "/casino/games/:Game",
        permanent: false,
      },
      {
        source: "/Casino/Providers",
        destination: "/casino/providers",
        permanent: false,
      },
      {
        source: "/Casino/Settings",
        destination: "/casino/settings",
        permanent: false,
      },
      {
        source: "/Casino/TopGames",
        destination: "/casino/top-games",
        permanent: false,
      },
      {
        source: "/Settings",
        destination: "/configurations/general",
        permanent: false,
      },
      {
        source: "/Settings/CommissionSettings",
        destination: "/configurations/commission-settings",
        permanent: false,
      },
      {
        source: "/Settings/CommissionBonusGroup",
        destination: "/configurations/commission-bonus-groups",
        permanent: false,
      },
      {
        source: "/Settings/PaymentMethods",
        destination: "/configurations/payment-methods",
        permanent: false,
      },
      {
        source: "/Settings/TrustThreshold",
        destination: "/configurations/trust-threshold",
        permanent: false,
      },
      {
        source: "/Settings/SportPriorities",
        destination: "/configurations/sport-priorities",
        permanent: false,
      },
      {
        source: "/Settings/MarketSettings",
        destination: "/configurations/market-settings",
        permanent: false,
      },
      {
        source: "/Settings/GameKeys",
        destination: "/configurations/game-keys",
        permanent: false,
      },
      {
        source: "/Settings/Tipsters",
        destination: "/configurations/tipster-settings",
        permanent: false,
      },
      {
        source: "/Settings/ExposureMonitor",
        destination: "/configurations/exposure-monitor-settings",
        permanent: false,
      },
      {
        source: "/Pools/Fixtures",
        destination: "/pools-management/fixtures",
        permanent: false,
      },
      {
        source: "/Pools/SalesOverview",
        destination: "/pools-management/sales-overview",
        permanent: false,
      },
      {
        source: "/Pools/CouponTickets",
        destination: "/pools-management/coupon-tickets",
        permanent: false,
      },
      {
        source: "/Pools/CouponSales",
        destination: "/pools-management/coupon-sales",
        permanent: false,
      },
      {
        source: "/Pools/Tickets",
        destination: "/pools-management/tickets",
        permanent: false,
      },
      {
        source: "/Promotions",
        destination: "/promotions",
        permanent: false,
      },
      {
        source: "/Promotions/AddNew",
        destination: "/promotions/add-new",
        permanent: false,
      },
      {
        source: "/Promotions/:EditPage",
        destination: "/promotions/:EditPage",
        permanent: false,
      },
      {
        source: "/LuckyBalls/Commission",
        destination: "/lucky-balls/commission",
        permanent: false,
      },
      {
        source: "/LuckyBalls/Shops",
        destination: "/lucky-balls/shops",
        permanent: false,
      },
      {
        source: "/LuckyBalls/Shop",
        destination: "/lucky-balls/shop",
        permanent: false,
      },
      {
        source: "/LuckyBalls/Shop/:UserId",
        destination: "/lucky-balls/shop/:UserId",
        permanent: false,
      },
      {
        source: "/VirtualSport",
        destination: "/virtual-sport",
        permanent: false,
      },
      {
        source: "/OnlineHelp",
        destination: "/support",
        permanent: false,
      },
      {
        source: "/Communications/PlayerMessages",
        destination: "/communications/player-messages",
        permanent: false,
      },
      {
        source: "/Communications/NetworkMessages",
        destination: "/communications/network-messages",
        permanent: false,
      },
      {
        source: "/Communications/MassInboxMessages",
        destination: "/communications/mass-inbox-messages",
        permanent: false,
      },
      {
        source: "/Communications/SMSConfig",
        destination: "/communications/sms-settings",
        permanent: false,
      },
      {
        source: "/RiskManagement/BettingParameters",
        destination: "/risk-management/betting-parameters",
        permanent: false,
      },
      {
        source: "/RiskManagement/Liability",
        destination: "/risk-management/liability",
        permanent: false,
      },
      {
        source: "/RiskManagement/Profitability",
        destination: "/risk-management/profitability",
        permanent: false,
      },
      {
        source: "/ContentManagement/Pages/List",
        destination: "/content-management/pages",
        permanent: false,
      },
      {
        source: "/ContentManagement/Pages/AddNew",
        destination: "/content-management/pages/add-new",
        permanent: false,
      },
      {
        source: "/ContentManagement/Pages/:EditPage",
        destination: "/content-management/pages/:EditPage",
        permanent: false,
      },
      {
        source: "/ContentManagement/Banners/List",
        destination: "/content-management/banners",
        permanent: false,
      },
      {
        source: "/ContentManagement/Banners/AddNew",
        destination: "/content-management/banners/add-new",
        permanent: false,
      },
      {
        source: "/ContentManagement/Banners/:EditBanner",
        destination: "/content-management/banners/:EditBanner",
        permanent: false,
      },
      {
        source: "/ContentManagement/JackpotManagement",
        destination: "/content-management/jackpot-management",
        permanent: false,
      },
      {
        source: "/ContentManagement/Jackpots/List",
        destination: "/jackpots",
        permanent: false,
      },
      {
        source: "/ContentManagement/Jackpots/AddNew",
        destination: "/jackpots/add-new",
        permanent: false,
      },
      {
        source: "/ContentManagement/Jackpots/:Edit",
        destination: "/jackpots/:Edit",
        permanent: false,
      },
      {
        source: "/ContentManagement/Jackpots/WeeklyJackpots",
        destination: "/jackpots/weekly-jackpots",
        permanent: false,
      },
      {
        source: "/ContentManagement/Jackpots/TicketJackpots",
        destination: "/jackpots/ticket-jackpots",
        permanent: false,
      },
      {
        source: "/ContentManagement/Jackpots/Tickets",
        destination: "/jackpots/jackpot-tickets",
        permanent: false,
      },
      {
        source: "/ContentManagement/SiteMenu",
        destination: "/content-management/site-menu",
        permanent: false,
      },
      {
        source: "/ContentManagement/SportsMenu",
        destination: "/content-management/sports-menu",
        permanent: false,
      },
      {
        source: "/ContentManagement/Messaging",
        destination: "/content-management/messaging",
        permanent: false,
      },
      {
        source: "/ContentManagement/MarketsManager",
        destination: "/content-management/markets-manager",
        permanent: false,
      },
      {
        source: "/ContentManagement/TopBets",
        destination: "/content-management/top-bets",
        permanent: false,
      },
      {
        source: "/ContentManagement/WeeklyCoupon",
        destination: "/content-management/weekly-coupon",
        permanent: false,
      },
      {
        source: "/ContentManagement/SoccerSpecials",
        destination: "/content-management/soccer-specials",
        permanent: false,
      },
      {
        source: "/ContentManagement/SureOdds",
        destination: "/content-management/sure-odds",
        permanent: false,
      },
      {
        source: "/ContentManagement/SureOdds/AddNew",
        destination: "/content-management/sure-odds/add-new",
        permanent: false,
      },
      {
        source: "/ContentManagement/SureOdds/Payments",
        destination: "/content-management/sure-odds/payments",
        permanent: false,
      },
      {
        source: "/ContentManagement/SureOdds/:EditSureOdd",
        destination: "/content-management/sure-odds/:EditSureOdd",
        permanent: false,
      },
      {
        source: "/ContentManagement/BookOdds",
        destination: "/risk-management/manual-odds-adjustment",
        permanent: false,
      },
      {
        source: "/ContentManagement/Events",
        destination: "/risk-management/event-odds-margins",
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
