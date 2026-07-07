export interface StoreConfig {
  id: string;
  account_id: string;
  slug: string;
  name: string;
  description: string;
  banner_url: string;
  whatsapp_number: string;
  upi_id: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  account_id: string;
  name: string;
  description: string;
  regular_price: number;
  sale_price: number;
  image_url: string;
  category: string;
  is_available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreStatus {
  isOpen: boolean;
  text: string;
  subtext: string;
}
