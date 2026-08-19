import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types";
import type {
  CheckoutInitResponse,
  TrackedOrder,
  UserOrderSummary,
  VerifyPaymentResponse,
} from "@/types/order";
import type { ReviewInvite } from "@/types/product";

export const contactService = {
  submit(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return apiClient.post<ApiResponse<{ inquiryId: string }>>(
      API_ROUTES.contact,
      payload,
      { auth: false }
    );
  },
};

export const appointmentService = {
  submit(payload: Record<string, unknown>) {
    return apiClient.post<ApiResponse<{ appointmentId: string; status: string }>>(
      API_ROUTES.appointments,
      payload,
      { auth: false }
    );
  },
};

export const newsletterService = {
  subscribe(email: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(
      API_ROUTES.newsletter.subscribe,
      { email, source: "footer" },
      { auth: false }
    );
  },

  unsubscribe(email: string, token: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(
      API_ROUTES.newsletter.unsubscribe,
      { email, token },
      { auth: false }
    );
  },
};

export const orderService = {
  list() {
    return apiClient.get<ApiResponse<{ orders: UserOrderSummary[] }>>(API_ROUTES.orders.list);
  },

  track(orderNumber: string, email: string) {
    return apiClient.post<ApiResponse<{ order: TrackedOrder }>>(
      API_ROUTES.orders.track,
      { orderNumber, email },
      { auth: false }
    );
  },

  initiateCheckout(payload: Record<string, unknown>) {
    return apiClient.post<ApiResponse<CheckoutInitResponse>>(
      API_ROUTES.orders.checkout,
      payload
    );
  },

  verifyPayment(payload: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return apiClient.post<ApiResponse<VerifyPaymentResponse>>(
      API_ROUTES.orders.verifyPayment,
      payload
    );
  },

  markPaymentFailed(payload: { orderNumber: string; razorpayOrderId?: string }) {
    return apiClient.post<
      ApiResponse<{ orderNumber: string; paymentStatus: string }>
    >(API_ROUTES.orders.paymentFailed, payload);
  },
};

export const reviewService = {
  getInvite(token: string) {
    return apiClient.get<ApiResponse<{ invite: ReviewInvite }>>(API_ROUTES.reviews.invite(token), {
      auth: false,
    });
  },

  submit(payload: {
    token: string;
    productSlug: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    return apiClient.post<
      ApiResponse<{ review: { id: string; productSlug: string; rating: number } }>
    >(API_ROUTES.reviews.submit, payload, { auth: false });
  },
};
