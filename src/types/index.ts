export type Locale = 'kk' | 'ru' | 'tr' | 'en';

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

export interface Category {
  id: string;
  slug: string;
  name_ru: string;
  name_kk: string;
  name_tr: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string;
  show_on_home?: boolean;
  created_at: string;
}

export type StorefrontSectionKey = 'todays_favorites';

export interface StorefrontSection {
  key: StorefrontSectionKey;
  product_ids: string[];
  product_slugs?: string[];
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  category_id: string | null;
  name_ru: string;
  name_kk: string;
  name_tr: string;
  name_en: string;
  description_ru: string;
  description_kk: string;
  description_tr: string;
  description_en: string;
  price: number;
  image_url: string;
  /** Optional extra gallery images (2–3 total with image_url). Only set when uploaded. */
  image_urls?: string[];
  is_active: boolean;
  stock_quantity: number;
  sort_order: number;
  created_at: string;
  categories?: Category | null;
  /** Live now — discounted price applies to cart */
  clearance_active?: boolean;
  /** Rule is on, but outside time window — show as upcoming announcement */
  clearance_scheduled?: boolean;
  sale_price?: number;
  sale_discount_percent?: number;
  clearance_start_time?: string;
  clearance_end_time?: string;
}

export interface ClearanceRule {
  id: string;
  product_slug: string;
  product_id: string | null;
  discount_percent: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderChannel = 'b2c' | 'b2b';
export type B2BPaymentStatus = 'pending' | 'paid';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  delivery_date: string;
  delivery_time: string;
  address: string;
  cake_text: string;
  notes: string;
  items: OrderItem[];
  total: number;
  locale: Locale;
  status: OrderStatus;
  stock_deducted?: boolean;
  created_at: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  order_channel?: OrderChannel;
  b2b_customer_id?: string | null;
  b2b_branch_id?: string | null;
  discount_percent?: number;
  subtotal?: number | null;
  payment_status?: B2BPaymentStatus;
  paid_at?: string | null;
  /** Enriched on admin orders page */
  b2b_company_name?: string | null;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  /** Sepete eklenirken kaydedilen stok üst sınırı */
  stockMax?: number;
}

export interface CheckoutFormData {
  customerName: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  address: string;
  cakeText?: string;
  notes?: string;
}

export interface ProductFormData {
  slug: string;
  categoryId: string;
  nameEn: string;
  nameRu: string;
  nameKk: string;
  nameTr: string;
  descriptionEn: string;
  descriptionRu: string;
  descriptionKk: string;
  descriptionTr: string;
  price: number;
  imageUrl: string;
  /** Extra gallery images (2nd, 3rd, …) */
  imageUrls?: string[];
  isActive: boolean;
  stockQuantity: number;
  sortOrder: number;
}
