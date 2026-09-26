import type { Product } from "./product";

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type PaymentMethod = "cod" | "upi" | "card";

export type OrderStatus =
  | "Placed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  deliveryMethod: string;
  subtotal: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}