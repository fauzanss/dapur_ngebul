import { getApiBase } from '@/lib/settings';
import { showGlobalLoading, hideGlobalLoading } from '@/lib/loading';

export type MenuItem = {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  available?: boolean;
  is_recommended?: boolean;
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
  paid_amount?: number;
  customer_name?: string;
};

export type OrderSummary = {
  id: number;
  order_uuid: string;
  total_amount: number;
  paid_amount: number | null;
  status: string;
  cashier: string | null;
  created_at: string;
  customer_name?: string | null;
};

export type OrderDetail = OrderSummary & {
  items: Array<{
    id: number;
    menu_item_id: number;
    name: string;
    price: number;
    quantity: number;
    note?: string | null;
  }>;
  customer_name?: string | null;
};

export type SalesSummary = {
  date?: string;
  total: number;
  count: number;
  startDate?: string;
  endDate?: string;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  showGlobalLoading();
  try {
    const base = await getApiBase();
    const res = await fetch(`${base}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return res.json();
  } finally {
    hideGlobalLoading();
  }
}

export const api = {
  getMenu: (category?: string) => http<MenuItem[]>(`/api/menu${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getCategories: () => http<string[]>(`/api/menu/categories`),
  getSalesToday: () => http<SalesSummary>(`/api/sales/today`),
  getSalesMonthToDate: () => http<SalesSummary>(`/api/sales/month-to-date`),
  getSalesAllTime: () => http<SalesSummary>(`/api/sales/all-time`),
  createOrder: (body: CreateOrderRequest) =>
    http(`/api/orders`, { method: 'POST', body: JSON.stringify(body) }),
  getOrders: (dateISO?: string, status?: string) => {
    const params = new URLSearchParams();
    if (dateISO) params.append('date', dateISO);
    if (status) params.append('status', status);
    const queryString = params.toString();
    return http<OrderSummary[]>(`/api/orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrderById: (id: number) => http<OrderDetail>(`/api/orders/${id}`),
  updateOrderStatus: (id: number, status: 'COOKING' | 'DELIVERED' | 'PAID' | 'CANCELLED') =>
    http<OrderDetail>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getSales: (dateISO?: string) => http<SalesSummary>(`/api/sales${dateISO ? `?date=${encodeURIComponent(dateISO)}` : ''}`),
  getSalesRange: (startDate: string, endDate: string) =>
    http<SalesSummary>(`/api/sales/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
};


