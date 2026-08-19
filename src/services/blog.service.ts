import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types";
import { API_ROUTES } from "@/constants";

export type BlogCoverImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: BlogCoverImage;
  category: string;
  author: string;
  tags: string[];
  publishedAt: string;
  seoDescription?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogListResult = {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const blogService = {
  list(params?: { page?: string; limit?: string; category?: string }) {
    return apiClient
      .get<ApiResponse<BlogListResult>>(API_ROUTES.blog.list, { params })
      .then((response) => response.data);
  },
  getBySlug(slug: string) {
    return apiClient
      .get<ApiResponse<{ post: BlogPost }>>(API_ROUTES.blog.detail(slug))
      .then((response) => response.data.post);
  },
};
