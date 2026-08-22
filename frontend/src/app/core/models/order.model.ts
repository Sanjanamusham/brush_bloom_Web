export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: OrderItemInput[];
}

export interface OrderCreatedResult {
  orderCode: string;
  estimatedTotal: number;
  items: { name: string; quantity: number }[];
}

export interface TrackedOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface TrackedOrder {
  orderCode: string;
  customerName: string;
  status: string;
  deliveryNote: string | null;
  estimatedTotal: number;
  createdAt: string;
  items: TrackedOrderItem[];
}

export interface TrackOrderResult {
  found: boolean;
  order?: TrackedOrder;
}

export interface AdminOrder {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  status: string;
  deliveryNote?: string;
  estimatedTotal: number;
  currency: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
  createdAt: string;
}
