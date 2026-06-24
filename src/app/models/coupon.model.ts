export interface Coupon {
  id: number;
  code: string;
  discount_type: 'fixed' | 'percentage';
  usage_limit: number | null;
  discount_amount: number | null;
  used_count: number;
  description: string;
  is_active: boolean;
  valid_from: string;   // ISO date string
  valid_until: string; // ISO date string
  created_at?: string;
  updated_at?: string;
}

export interface CouponFormData {
  code: string;
  discount_type: 'fixed' | 'percentage';
  usage_limit?: number | null;
  discount_amount: number | null;
  description: string;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

export interface CouponListResponse {
  data: Coupon[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  message?: string;
}
