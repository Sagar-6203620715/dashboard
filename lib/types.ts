export type CustomerStatus = "Active" | "Inactive";
export type OrderStatus =
  | "Completed"
  | "In-Progress"
  | "Pending"
  | "Cancelled";
export type OrderType = "Home Delivery" | "Pick Up" | "Express";
export type ProductStatus = "Published" | "Unpublished" | "Draft";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orders_count: number;
  total_spent: number;
  customer_since: string;
  status: CustomerStatus;
  avatar_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  order_date: string;
  order_type: OrderType;
  tracking_id: string | null;
  order_total: number;
  status: OrderStatus;
  items_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  in_stock: number;
  discount_percent: number;
  total_value: number;
  status: ProductStatus;
  image_url: string | null;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  date: string;
  total_sales: number;
  orders_count: number;
  new_customers: number;
  page_views: number;
  created_at: string;
}

// Dashboard KPI summary type
export interface DashboardKPIs {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  activeOrders: number;
  salesChange: number; // percentage change vs last period
  ordersChange: number;
  customersChange: number;
  activeOrdersChange: number;
}

