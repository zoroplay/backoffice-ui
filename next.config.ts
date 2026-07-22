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
