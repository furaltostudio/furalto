import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse, HealthStatus } from "@/types";

export const healthService = {
  getStatus: () =>
    apiClient.get<ApiResponse<HealthStatus>>(API_ROUTES.health),
};
