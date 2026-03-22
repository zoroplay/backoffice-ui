export type UserStatus = "active" | "suspended" | "invited";

export type UserRole = string;

export type UserRecord = {
  id: string;
  numericId: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: number | null;
  status: UserStatus;
  lastActive: string;
  joinedAt: string;
  phone: string;
  location: string;
  permissions: string[];
  teams: string[];
  country?: string;
  state?: string;
  language?: string;
  currency?: string;
  gender?: string;
  address?: string;
};

export type UserFilterOption = {
  label: string;
  value: string;
  group: "role" | "status";
};

export type UserDetail = Pick<
  UserRecord,
  | "id"
  | "name"
  | "email"
  | "role"
  | "status"
  | "phone"
  | "location"
  | "joinedAt"
  | "lastActive"
  | "teams"
  | "country"
  | "state"
  | "language"
  | "currency"
  | "gender"
  | "address"
>;

export type ChangePasswordPayload = {
  userId: number;
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

