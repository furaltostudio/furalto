import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types";
import type { AdminCategory } from "@/services/admin.service";

export const categoryService = {
  list() {
    return apiClient.get<ApiResponse<{ categories: AdminCategory[] }>>(API_ROUTES.categories.list, {
      auth: false,
    });
  },
};
