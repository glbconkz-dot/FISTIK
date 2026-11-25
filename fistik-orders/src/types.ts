export type ManagerOrder = {
  id: string;
  order_number: string;
  customer_name: string | null;
  phone: string | null;
  total: number;
  status: string | null;
  created_at: string;
  confirmed_at: string | null;
  order_channel: string | null;
  payment_status: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  address: string | null;
  notes: string | null;
};

export type HealthResponse = {
  ok: boolean;
  service?: string;
  hasSecret?: boolean;
  hasServiceRole?: boolean;
  tableOk?: boolean;
  activeDevices?: number | null;
};

export type OrdersResponse = {
  orders: ManagerOrder[];
  adminUrl?: string;
};
