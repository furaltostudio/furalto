import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/types";

export const authService = {
  register(input: RegisterInput) {
    return apiClient.post<ApiResponse<{ user: AuthUser; message: string }>>(
      API_ROUTES.auth.register,
      input,
      { auth: false }
    );
  },

  login(input: LoginInput) {
    return apiClient.post<ApiResponse<AuthSession>>(API_ROUTES.auth.login, input, {
      auth: false,
    });
  },

  google(credential: string) {
    return apiClient.post<ApiResponse<AuthSession>>(
      API_ROUTES.auth.google,
      { credential },
      { auth: false }
    );
  },

  verifyEmail(token: string) {
    return apiClient.post<ApiResponse<AuthSession>>(
      API_ROUTES.auth.verifyEmail,
      { token },
      { auth: false }
    );
  },

  resendVerification(email: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(
      API_ROUTES.auth.resendVerification,
      { email },
      { auth: false }
    );
  },

  me() {
    return apiClient.get<ApiResponse<{ user: AuthUser }>>(API_ROUTES.auth.me);
  },

  logout() {
    return apiClient.post<ApiResponse<null>>(API_ROUTES.auth.logout);
  },

  forgotPassword(email: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(
      API_ROUTES.auth.forgotPassword,
      { email },
      { auth: false }
    );
  },

  resetPassword(token: string, password: string) {
    return apiClient.post<ApiResponse<AuthSession>>(
      API_ROUTES.auth.resetPassword,
      { token, password },
      { auth: false }
    );
  },
};
