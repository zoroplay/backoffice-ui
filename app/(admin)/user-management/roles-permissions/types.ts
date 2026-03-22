export type RoleType = "admin" | "agency" | "player";

export type RoleRecord = {
  id: string | number;
  name: string;
  type: RoleType;
  description: string;
  permissions: string[];
  members: number;
};

export type PermissionRecord = {
  id: string | number;
  name: string;
  category: string;
  description: string;
  isCore: boolean;
};

export type RoleFormValues = {
  name: string;
  description: string;
  type: RoleType;
};

export type PermissionFormValues = {
  name: string;
  category: string;
  description: string;
  isCore: boolean;
};

