import type { UserRole } from "@/types";

export const USER_ROLES = {
  CUSTOMER: "customer",
  STAFF: "staff",
  ADMIN: "admin",
} as const satisfies Record<string, UserRole>;

export const STAFF_ROLES: UserRole[] = [USER_ROLES.STAFF, USER_ROLES.ADMIN];

export function isStaffRole(role?: UserRole | null) {
  return role === USER_ROLES.STAFF || role === USER_ROLES.ADMIN;
}

export function isAdminRole(role?: UserRole | null) {
  return role === USER_ROLES.ADMIN;
}

export function getPostLoginPath(role?: UserRole | null) {
  return isStaffRole(role) ? "/admin" : "/account";
}
