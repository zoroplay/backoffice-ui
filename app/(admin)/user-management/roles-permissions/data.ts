import type {
  PermissionRecord,
  RoleRecord,
  RoleType,
} from "./types";

export const roleTypeOptions: Array<{ label: string; value: RoleType }> = [
  { label: "Admin", value: "admin" },
  { label: "Agency", value: "agency" },
  { label: "Player", value: "player" },
] as const;

const makeRole = (
  id: string,
  name: string,
  type: RoleType,
  members: number,
  permissions: string[],
  description: string
): RoleRecord => ({
  id,
  name,
  type,
  members,
  permissions,
  description,
});

export const rolesSeed: RoleRecord[] = [
  makeRole(
    "role-001",
    "Super Admin",
    "admin",
    4,
    ["User Management", "Risk Management", "Finance"],
    "Full platform control with unrestricted access."
  ),
  makeRole(
    "role-002",
    "Risk Manager",
    "admin",
    6,
    ["Manual Odds Adjustment", "Liability Monitor", "Event & Odds Margins"],
    "Focus on pricing, exposure, and limits."
  ),
  makeRole(
    "role-003",
    "Customer Support",
    "admin",
    12,
    ["Player Management", "Tickets", "Bonus Management"],
    "Assist players, manage tickets, and escalate issues."
  ),
  makeRole(
    "role-004",
    "Master Agent",
    "agency",
    18,
    ["Network Reports", "Agent Onboarding", "Commission Settings"],
    "Manage downstream agents and monitor performance."
  ),
  makeRole(
    "role-005",
    "Retail Admin",
    "admin",
    9,
    ["Cash Desk", "Retail Sales", "Shift Management"],
    "Operate retail branches and reconcile balances."
  ),
];

const makePermission = (
  id: string,
  name: string,
  category: string,
  description: string,
  isCore = false
): PermissionRecord => ({
  id,
  name,
  category,
  description,
  isCore,
});

export const permissionsSeed: PermissionRecord[] = [
  makePermission(
    "perm-001",
    "Manage Users",
    "User Management",
    "Create, edit, suspend, and delete platform users.",
    true
  ),
  makePermission(
    "perm-002",
    "Manual Odds Adjustment",
    "Risk",
    "Update markets and adjust odds in real time."
  ),
  makePermission(
    "perm-003",
    "Issue Bonuses",
    "Promotions",
    "Create bonus campaigns and grant rewards."
  ),
  makePermission(
    "perm-004",
    "Approve Withdrawals",
    "Finance",
    "Review and authorise pending withdrawal requests.",
    true
  ),
  makePermission(
    "perm-005",
    "Manage Agents",
    "Network",
    "Invite agents, set commissions, and manage hierarchies."
  ),
  makePermission(
    "perm-006",
    "View Reports",
    "Analytics",
    "Access dashboards, exports, and scheduled insights."
  ),
  makePermission(
    "perm-007",
    "Configure Payments",
    "Configurations",
    "Add payment methods, adjust limits, and toggle channels.",
    true
  ),
  makePermission(
    "perm-008",
    "Handle Support Tickets",
    "Operations",
    "Respond to player tickets and escalate issues."
  ),
];

