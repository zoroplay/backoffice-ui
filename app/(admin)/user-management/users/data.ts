import type { UserRecord, UserStatus, UserRole, UserFilterOption } from "./types";

const formatDate = (date: Date) => date.toISOString();

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const userRoles: ReadonlyArray<{ label: string; value: UserRole }> = [
  { label: "Super Admin", value: "Super Admin" },
  { label: "Risk Manager", value: "Risk Manager" },
  { label: "Customer Support", value: "Customer Support" },
  { label: "Finance", value: "Finance" },
  { label: "Affiliate Manager", value: "Affiliate Manager" },
] as const;

export const userStatuses: ReadonlyArray<{ label: string; value: UserStatus }> = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Invited", value: "invited" },
] as const;

const startDate = new Date("2024-03-01T09:00:00Z");

const buildUser = (
  index: number,
  overrides: Partial<UserRecord> = {}
): UserRecord => {
  const joinedAt = addDays(startDate, index * 3);
  const lastActive = addDays(joinedAt, index % 5);

  return {
    id: `USR-${2024000 + index}`,
    name: overrides.name ?? `User ${index}`,
    email: overrides.email ?? `user${index}@example.com`,
    role: overrides.role ?? userRoles[index % userRoles.length].value,
    status: overrides.status ?? userStatuses[index % userStatuses.length].value,
    joinedAt: formatDate(joinedAt),
    lastActive: formatDate(lastActive),
    avatar: overrides.avatar ?? `/images/user/user-${(index % 37) + 1}.jpg`,
    phone: overrides.phone ?? "+234 801 234 5678",
    location: overrides.location ?? "Lagos, Nigeria",
    permissions: overrides.permissions ?? [
      "View Reports",
      "Manage Promotions",
      "Access Risk Settings",
    ],
    teams: overrides.teams ?? ["Growth", "Risk Ops"],
  };
};

export const usersSeed: UserRecord[] = [
  buildUser(1, {
    name: "Chidi Arinze",
    email: "chidi.arinze@example.com",
    role: "Super Admin",
    status: "active",
    avatar: "/images/user/user-11.jpg",
    permissions: ["Full Access"],
    teams: ["Founders"],
  }),
  buildUser(2, {
    name: "Aisha Bello",
    email: "aisha.bello@example.com",
    role: "Risk Manager",
    status: "active",
    avatar: "/images/user/user-07.jpg",
    permissions: ["Manage Risk", "Adjust Odds", "Suspend Markets"],
    teams: ["Risk Ops"],
  }),
  buildUser(3, {
    name: "Diego Martins",
    email: "diego.martins@example.com",
    role: "Finance",
    status: "suspended",
    avatar: "/images/user/user-19.jpg",
    permissions: ["Approve Payouts", "View Ledger"],
    teams: ["Finance"],
  }),
  buildUser(4, {
    name: "Lucy Wang",
    email: "lucy.wang@example.com",
    role: "Customer Support",
    status: "active",
    avatar: "/images/user/user-05.jpg",
  }),
  buildUser(5, {
    name: "Damilola Adesina",
    email: "dami.adesina@example.com",
    role: "Affiliate Manager",
    status: "invited",
    avatar: "/images/user/user-27.jpg",
  }),
  ...Array.from({ length: 20 }).map((_, index) =>
    buildUser(index + 6, {
      status: userStatuses[(index + 1) % userStatuses.length].value,
    })
  ),
];

export const userFilterGroups: UserFilterOption[] = [
  ...userStatuses.map(({ label, value }) => ({
    label,
    value,
    group: "status" as const,
  })),
  ...userRoles.map(({ label, value }) => ({
    label,
    value,
    group: "role" as const,
  })),
];

