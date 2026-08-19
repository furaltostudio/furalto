import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AuthSession } from "@/types";

export type AdminOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shipping: number;
  internalNotes?: string;
  contact: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    slug: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    fabric?: string;
    finish?: string;
    size?: string;
  }>;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdminStats = {
  orders: number;
  pendingAppointments: number;
  newContacts: number;
  staffCount: number;
  products: number;
  customers: number;
  newsletterSubscribers: number;
  revenue: number;
  revenueAllTime: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  revenueLastMonth: number;
  paidOrders: number;
  paidOrdersThisMonth: number;
  averageOrderValue: number;
  processingOrders: number;
  categoryCount: number;
  revenueMonthly: Array<{
    key: string;
    label: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Array<{
    orderNumber: string;
    status: string;
    paymentStatus?: string;
    total: number;
    contact: { firstName: string; lastName: string };
    createdAt: string;
  }>;
  recentContacts: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
};

export type AdminSubcategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  subcategories: AdminSubcategory[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProduct = {
  _id?: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  collection: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  details?: string[];
  specs?: Array<{ label: string; value: string }>;
  images?: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
    hidden?: boolean;
  }>;
  fabrics?: Array<{ id: string; label: string; swatch?: string }>;
  finishes?: Array<{ id: string; label: string; swatch?: string }>;
  sizes?: Array<{ id: string; label: string }>;
  relatedSlugs?: string[];
  rooms?: string[];
  scaleImageIndex?: number | null;
  isActive: boolean;
  updatedAt?: string;
};

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  provider: string;
  isEmailVerified: boolean;
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
  lastLoginAt?: string;
};

export type AdminAssignee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "staff" | "admin";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

export type StaffInvite = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type NewsletterSubscriber = {
  _id: string;
  email: string;
  isActive: boolean;
  source: string;
  createdAt: string;
};

export type UploadedAsset = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
};

export type AdminNotification = {
  id: string;
  type: "order" | "appointment" | "contact" | "custom_quote" | "newsletter";
  title: string;
  message: string;
  href: string;
  meta?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
};

export const adminService = {
  getStats() {
    return apiClient.get<ApiResponse<AdminStats>>(API_ROUTES.admin.stats);
  },

  getNotifications(params?: Record<string, string>) {
    return apiClient.get<
      ApiResponse<{ notifications: AdminNotification[]; unreadCount: number }>
    >(API_ROUTES.admin.notifications, { params });
  },

  markNotificationRead(id: string) {
    return apiClient.patch<ApiResponse<{ notification: AdminNotification }>>(
      API_ROUTES.admin.notificationRead(id)
    );
  },

  markAllNotificationsRead() {
    return apiClient.patch<
      ApiResponse<{ notifications: AdminNotification[]; unreadCount: number }>
    >(API_ROUTES.admin.notificationsReadAll);
  },

  uploadImage(file: File, folder = "furalto/products") {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    return apiClient
      .upload<ApiResponse<{ asset: UploadedAsset }>>(API_ROUTES.admin.uploadImage, formData)
      .then((response) => response.data.asset);
  },

  getAssignees() {
    return apiClient.get<ApiResponse<{ assignees: AdminAssignee[] }>>(API_ROUTES.admin.assignees);
  },

  getOrders(params?: Record<string, string>) {
    return apiClient.get<ApiResponse<{ orders: AdminOrder[]; total: number; page: number; limit: number }>>(
      API_ROUTES.admin.orders,
      { params }
    );
  },

  getOrder(orderNumber: string) {
    return apiClient.get<ApiResponse<{ order: AdminOrder }>>(API_ROUTES.admin.order(orderNumber));
  },

  updateOrder(
    orderNumber: string,
    body: {
      status?: string;
      paymentStatus?: string;
      internalNotes?: string;
      assignedTo?: string | null;
    }
  ) {
    return apiClient.patch<ApiResponse<{ order: AdminOrder }>>(
      API_ROUTES.admin.order(orderNumber),
      body
    );
  },

  getProducts(params?: Record<string, string>) {
    return apiClient.get<ApiResponse<{ products: AdminProduct[]; total: number; page: number; limit: number }>>(
      API_ROUTES.admin.products,
      { params }
    );
  },

  getProduct(slug: string) {
    return apiClient.get<ApiResponse<{ product: AdminProduct }>>(API_ROUTES.admin.product(slug));
  },

  createProduct(body: Partial<AdminProduct>) {
    return apiClient.post<ApiResponse<{ product: AdminProduct }>>(API_ROUTES.admin.products, body);
  },

  updateProduct(slug: string, body: Partial<AdminProduct>) {
    return apiClient.patch<ApiResponse<{ product: AdminProduct }>>(API_ROUTES.admin.product(slug), body);
  },

  toggleProductStatus(slug: string, isActive: boolean) {
    return apiClient.patch<ApiResponse<{ product: AdminProduct }>>(
      API_ROUTES.admin.productStatus(slug),
      { isActive }
    );
  },

  getCategories() {
    return apiClient.get<ApiResponse<{ categories: AdminCategory[] }>>(API_ROUTES.admin.categories);
  },

  createCategory(body: {
    name: string;
    slug?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return apiClient.post<ApiResponse<{ category: AdminCategory }>>(
      API_ROUTES.admin.categories,
      body
    );
  },

  updateCategory(
    id: string,
    body: Partial<{
      name: string;
      slug: string;
      description: string;
      sortOrder: number;
      isActive: boolean;
      subcategories: Array<Partial<AdminSubcategory> & { name: string; slug?: string }>;
    }>
  ) {
    return apiClient.patch<ApiResponse<{ category: AdminCategory }>>(
      API_ROUTES.admin.category(id),
      body
    );
  },

  deleteCategory(id: string) {
    return apiClient.delete<ApiResponse<{ id: string }>>(API_ROUTES.admin.category(id));
  },

  addSubcategory(
    id: string,
    body: { name: string; slug?: string; sortOrder?: number; isActive?: boolean }
  ) {
    return apiClient.post<ApiResponse<{ category: AdminCategory }>>(
      API_ROUTES.admin.categorySubcategories(id),
      body
    );
  },

  updateSubcategory(
    id: string,
    subId: string,
    body: Partial<{ name: string; slug: string; sortOrder: number; isActive: boolean }>
  ) {
    return apiClient.patch<ApiResponse<{ category: AdminCategory }>>(
      API_ROUTES.admin.categorySubcategory(id, subId),
      body
    );
  },

  deleteSubcategory(id: string, subId: string) {
    return apiClient.delete<ApiResponse<{ category: AdminCategory }>>(
      API_ROUTES.admin.categorySubcategory(id, subId)
    );
  },

  getCustomers(params?: Record<string, string>) {
    return apiClient.get<ApiResponse<{ customers: AdminCustomer[]; total: number; page: number; limit: number }>>(
      API_ROUTES.admin.customers,
      { params }
    );
  },

  getCustomer(id: string) {
    return apiClient.get<
      ApiResponse<{
        customer: AdminCustomer;
        orders: Array<{ orderNumber: string; status: string; total: number; paymentStatus: string; createdAt: string }>;
        appointments: Array<Record<string, unknown>>;
      }>
    >(API_ROUTES.admin.customer(id));
  },

  getAppointments(params?: Record<string, string>) {
    return apiClient.get<ApiResponse<{ appointments: Array<Record<string, unknown>>; total: number; page: number; limit: number }>>(
      API_ROUTES.admin.appointments,
      { params }
    );
  },

  updateAppointment(id: string, body: { status?: string }) {
    return apiClient.patch<ApiResponse<{ appointment: Record<string, unknown> }>>(
      API_ROUTES.admin.appointment(id),
      body
    );
  },

  getContacts(params?: Record<string, string>) {
    return apiClient.get<ApiResponse<{ contacts: Array<Record<string, unknown>>; total: number; page: number; limit: number }>>(
      API_ROUTES.admin.contacts,
      { params }
    );
  },

  updateContact(id: string, body: { status?: string }) {
    return apiClient.patch<ApiResponse<{ contact: Record<string, unknown> }>>(
      API_ROUTES.admin.contact(id),
      body
    );
  },

  getCustomQuotes(params?: Record<string, string>) {
    return apiClient.get<
      ApiResponse<{
        quotes: Array<Record<string, unknown>>;
        total: number;
        page: number;
        limit: number;
      }>
    >(API_ROUTES.admin.customQuotes, { params });
  },

  updateCustomQuote(id: string, body: { status: string }) {
    return apiClient.patch<ApiResponse<{ quote: Record<string, unknown> }>>(
      API_ROUTES.admin.customQuote(id),
      body
    );
  },

  getNewsletter(params?: Record<string, string>) {
    return apiClient.get<ApiResponse<{ subscribers: NewsletterSubscriber[]; total: number; page: number; limit: number }>>(
      API_ROUTES.admin.newsletter,
      { params }
    );
  },

  updateNewsletterSubscriber(id: string, isActive: boolean) {
    return apiClient.patch<ApiResponse<{ subscriber: NewsletterSubscriber }>>(
      API_ROUTES.admin.newsletterSubscriber(id),
      { isActive }
    );
  },

  getStaff() {
    return apiClient.get<ApiResponse<{ staff: StaffMember[] }>>(API_ROUTES.admin.staff);
  },

  getStaffInvites() {
    return apiClient.get<ApiResponse<{ invites: StaffInvite[] }>>(API_ROUTES.admin.staffInvites);
  },

  inviteStaff(body: { email: string; firstName?: string; lastName?: string }) {
    return apiClient.post<ApiResponse<{ invite: StaffInvite }>>(API_ROUTES.admin.staffInvites, body);
  },

  revokeInvite(id: string) {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ROUTES.admin.staffInvite(id));
  },

  deactivateStaff(id: string) {
    return apiClient.patch<ApiResponse<{ message: string }>>(API_ROUTES.admin.deactivateStaff(id));
  },

  getContent(params?: Record<string, string>) {
    return apiClient.get<
      ApiResponse<{
        items: Array<{
          key: string;
          title: string;
          type: string;
          description?: string;
          data: Record<string, unknown>;
          isPublished: boolean;
          updatedAt?: string;
        }>;
      }>
    >(API_ROUTES.admin.content, { params });
  },

  getContentItem(key: string) {
    return apiClient.get<
      ApiResponse<{
        content: {
          key: string;
          title: string;
          type: string;
          description?: string;
          data: Record<string, unknown>;
          isPublished: boolean;
          updatedAt?: string;
        };
      }>
    >(API_ROUTES.admin.contentItem(key));
  },

  saveContent(
    key: string,
    body: {
      title: string;
      type: string;
      description?: string;
      data: Record<string, unknown>;
      isPublished?: boolean;
    }
  ) {
    return apiClient.put<
      ApiResponse<{
        content: {
          key: string;
          title: string;
          type: string;
          description?: string;
          data: Record<string, unknown>;
          isPublished: boolean;
        };
      }>
    >(API_ROUTES.admin.contentItem(key), { ...body, key });
  },

  getBlogPosts(params?: Record<string, string>) {
    return apiClient.get<
      ApiResponse<{
        posts: import("@/services/blog.service").BlogPost[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >(API_ROUTES.admin.blog, { params });
  },

  getBlogPost(id: string) {
    return apiClient.get<ApiResponse<{ post: import("@/services/blog.service").BlogPost }>>(
      API_ROUTES.admin.blogPost(id)
    );
  },

  createBlogPost(body: Record<string, unknown>) {
    return apiClient.post<ApiResponse<{ post: import("@/services/blog.service").BlogPost }>>(
      API_ROUTES.admin.blog,
      body
    );
  },

  updateBlogPost(id: string, body: Record<string, unknown>) {
    return apiClient.patch<ApiResponse<{ post: import("@/services/blog.service").BlogPost }>>(
      API_ROUTES.admin.blogPost(id),
      body
    );
  },

  deleteBlogPost(id: string) {
    return apiClient.delete<ApiResponse<{ id: string; deleted: boolean }>>(
      API_ROUTES.admin.blogPost(id)
    );
  },
};

export const inviteService = {
  getInvite(token: string) {
    return apiClient.get<
      ApiResponse<{ invite: { email: string; firstName: string; lastName: string; expiresAt: string } }>
    >(API_ROUTES.auth.invite(token), { auth: false });
  },

  acceptInvite(body: { token: string; password: string; firstName?: string; lastName?: string }) {
    return apiClient.post<ApiResponse<AuthSession>>(API_ROUTES.auth.acceptInvite, body, {
      auth: false,
    });
  },
};
