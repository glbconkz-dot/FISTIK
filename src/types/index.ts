export type Locale = 'kk' | 'tr' | 'ru' | 'en';

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

export type StorefrontSectionKey =
  | 'todays_favorites'
  | 'new_collection'
  | 'most_ordered'
  | 'chefs_selection';

export interface StorefrontSection {
  key: StorefrontSectionKey;
  product_ids: string[];
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
  is_active: boolean;
  stock_quantity: number;
  sort_order: number;
  created_at: string;
  categories?: Category | null;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

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
  isActive: boolean;
  stockQuantity: number;
  sortOrder: number;
}
