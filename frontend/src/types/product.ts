export type ProductOption = {
  id: string;
  label: string;
  swatch?: string;
  /** Spec overrides applied when this option is selected */
  specs?: ProductSpec[];
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  collection: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  details: string[];
  specs: ProductSpec[];
  images: ProductImage[];
  fabrics: ProductOption[];
  finishes: ProductOption[];
  sizes: ProductOption[];
  relatedSlugs: string[];
  rooms: string[];
  /** 0-based gallery index for the Size guide (optional). */
  scaleImageIndex?: number | null;
  soldCount?: number;
  averageRating?: number;
  reviewCount?: number;
  recommendPercent?: number;
  ratingDistribution?: RatingDistribution;
};

export type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type ProductReview = {
  _id: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  productName?: string;
};

export type ProductReviewsResult = {
  product: {
    slug: string;
    name: string;
    soldCount: number;
    averageRating: number;
    reviewCount: number;
    recommendPercent: number;
    ratingDistribution: RatingDistribution;
  };
  featuredReview: ProductReview | null;
  reviews: ProductReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ReviewInviteItem = {
  slug: string;
  name: string;
  image: string;
  alreadyReviewed: boolean;
};

export type ReviewInvite = {
  orderNumber: string;
  customerName: string;
  items: ReviewInviteItem[];
  expiresAt?: string;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  fabric?: string;
  finish?: string;
  size?: string;
};
