import type { ActivityLog } from "./types";

const now = new Date();
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const formatISO = (date: Date) => date.toISOString();

export const activityLogsSeed: ActivityLog[] = [
  {
    id: "log-001",
    username: "Quadr",
    action: "Role created successfully",
    ipAddress: "102.89.10.17",
    timestamp: formatISO(daysAgo(0.1)),
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    payload: {
      body: {
        name: "Retail Supervisor",
        type: "admin",
        description: "Oversees retail store operations",
      },
      method: "POST",
      url: "/api/v2/admin/roles",
    },
    response: {
      status: true,
      message: "Role created successfully",
      data: {
        id: 56,
        name: "Retail Supervisor",
        type: "admin",
      },
    },
  },
  {
    id: "log-002",
    username: "Quadr",
    action: "Permission created successfully",
    ipAddress: "102.89.10.17",
    timestamp: formatISO(daysAgo(0.2)),
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    payload: {
      body: {
        name: "approve_withdrawal",
        category: "Finance",
        description: "Approve pending withdrawal requests",
      },
      method: "POST",
      url: "/api/v2/admin/permissions",
    },
    response: {
      status: true,
      message: "Permission created successfully",
      data: {
        id: 88,
        name: "approve_withdrawal",
      },
    },
  },
  {
    id: "log-003",
    username: "sopi@sportsbookengine.com",
    action: "User created successfully",
    ipAddress: "172.16.2.24",
    timestamp: formatISO(daysAgo(1.1)),
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    payload: {
      body: {
        username: "kasie",
        role: "Customer Support",
        status: "active",
      },
      method: "POST",
      url: "/api/v2/admin/users",
    },
    response: {
      status: true,
      message: "User created successfully",
      data: {
        id: 240,
        username: "kasie",
      },
    },
  },
  {
    id: "log-004",
    username: "FranklyNusi",
    action: "Internal server error",
    ipAddress: "102.89.10.17",
    timestamp: formatISO(daysAgo(1.5)),
    userAgent: "undici",
    payload: {
      body: {
        endpoint: "/api/v2/admin/bonus",
        payload: {
          name: "Weekend Frenzy",
          type: "Casino",
        },
      },
      method: "POST",
      url: "/api/v2/admin/bonus",
    },
    response: {
      status: false,
      message: "Internal server error",
      code: 500,
    },
  },
  {
    id: "log-005",
    username: "FranklyNusi",
    action: "Bonus created successfully",
    ipAddress: "102.89.10.17",
    timestamp: formatISO(daysAgo(1.8)),
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    payload: {
      body: {
        name: "Casino Booster",
        type: "Casino",
        budget: 50000,
      },
      method: "POST",
      url: "/api/v2/admin/promotions/bonus",
    },
    response: {
      status: true,
      message: "Bonus created successfully",
      data: {
        id: 91,
        name: "Casino Booster",
        type: "Casino",
      },
    },
  },
  {
    id: "log-006",
    username: "Quadr",
    action: "Manual odds adjustment applied",
    ipAddress: "102.89.10.17",
    timestamp: formatISO(daysAgo(2.4)),
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    payload: {
      body: {
        eventId: "EPL-2025-124",
        market: "1X2",
        selection: "Home",
        oldOdds: 1.92,
        newOdds: 1.84,
      },
      method: "PATCH",
      url: "/api/v2/admin/manual-odds",
    },
    response: {
      status: true,
      message: "Odds updated successfully",
    },
  },
  {
    id: "log-007",
    username: "sopi@sportsbookengine.com",
    action: "Agent payout approved",
    ipAddress: "172.16.2.24",
    timestamp: formatISO(daysAgo(3.7)),
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    payload: {
      body: {
        ticketId: "AGT-90823",
        amount: 125000,
      },
      method: "POST",
      url: "/api/v2/agency/payout",
    },
    response: {
      status: true,
      message: "Payout approved",
    },
  },
  {
    id: "log-008",
    username: "FranklyNusi",
    action: "User suspension lifted",
    ipAddress: "102.89.10.17",
    timestamp: formatISO(daysAgo(4.5)),
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    payload: {
      body: {
        username: "victor.k",
        reason: "Investigation cleared",
      },
      method: "PATCH",
      url: "/api/v2/admin/users/victor.k/suspension",
    },
    response: {
      status: true,
      message: "Suspension lifted",
    },
  },
];

