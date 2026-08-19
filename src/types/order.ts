export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  fabric?: string;
  finish?: string;
  size?: string;
};

export type OrderContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount?: number;
  shipping: number;
  items: OrderItem[];
  contact: OrderContact;
  createdAt: string;
  updatedAt: string;
};

export type UserOrderSummary = {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  subtotal: number;
  discount?: number;
  shipping: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CheckoutInitResponse = {
  orderNumber: string;
  subtotal: number;
  discount?: number;
  shipping: number;
  total: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  mockPayment?: boolean;
  mockReason?: string;
};

export type VerifyPaymentResponse = {
  orderNumber: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
};
