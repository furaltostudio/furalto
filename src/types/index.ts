export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type ApiErrorPayload = {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
};

export type HealthStatus = {
  status: string;
  timestamp: string;
};

export type UserRole = "customer" | "staff" | "admin";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  provider: "local" | "google";
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt?: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  acceptTerms: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};
