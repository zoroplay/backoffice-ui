export type UserStatus = "active" | "suspended" | "invited";

export type UserRole =
  | "Super Admin"
  | "Risk Manager"
  | "Customer Support"
  | "Finance"
  | "Affiliate Manager";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  joinedAt: string;
  avatar: string;
  phone: string;
  location: string;
  permissions: string[];
  teams: string[];
};

export type UserFilterOption = {
  label: string;
  value: string;
  group: "role" | "status";
};

export type UserDetail = Pick<
  UserRecord,
  "id" | "name" | "email" | "role" | "status" | "phone" | "location" | "joinedAt" | "lastActive" | "teams"
>;

export type ChangePasswordPayload = {
  userId: string;
  password: string;
  confirmPassword: string;
};

export type EditableUser = {
  country?: string;
  state?: string;
  language?: string;
  currency?: string;
  gender?: string;
  address?: string;
};

