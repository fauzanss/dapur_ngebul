import { API_BASE } from '@/constants/config';

export type MenuItem = {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  available?: boolean;
};

export type CreateOrderItem = {
  menu_item_id: number;
  quantity: number;
  note?: string;
};

export type CreateOrderRequest = {
  order_uuid: string;
  cashier: string;
  items: CreateOrderItem[];
  paid_amount: number;
};

export type OrderSummary = {
  id: number;
  order_uuid: string;
  total_amount: number;
  paid_amount: number | null;
  status: string;
  cashier: string | null;
  created_at: string;
};

export type SalesSummary = {
  date: string;
  total: number;
  count: number;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  getMenu: () => http<MenuItem[]>(`/api/menu`),
  createOrder: (body: CreateOrderRequest) =>
    http(`/api/orders`, { method: 'POST', body: JSON.stringify(body) }),
  getOrders: (dateISO?: string) =>
    http<OrderSummary[]>(`/api/orders${dateISO ? `?date=${encodeURIComponent(dateISO)}` : ''}`),
  getSales: (dateISO?: string) => http<SalesSummary>(`/api/sales${dateISO ? `?date=${encodeURIComponent(dateISO)}` : ''}`),
};


