"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/sidebar-provider";
import { PageTransition } from "@/components/page-transition";
import { AnimatedNumber } from "@/components/animated-number";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Menu,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
} from "lucide-react";
import type { AnalyticsDaily, Order } from "@/lib/types";
import { motion } from "framer-motion";

const STATUS_STYLES: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In-Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
  Published: "bg-green-100 text-green-700",
  Unpublished: "bg-gray-100 text-gray-500",
  Draft: "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

const cardContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  decimals?: number;
}

function MetricCard({ icon, label, value, prefix, decimals }: MetricCardProps) {
  return (
    <Card className="border border-gray-100 bg-white rounded-2xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="p-2 rounded-lg bg-blue-50 text-[#5570F1]">{icon}</div>
        <span className="text-xs text-gray-400">Last 30 days</span>
      </CardHeader>
      <CardContent className="pt-0 space-y-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <AnimatedNumber
          value={value}
          prefix={prefix}
          decimals={decimals}
          className="text-2xl font-semibold text-gray-900"
        />
      </CardContent>
    </Card>
  );
}

type SimpleOrder = Pick<
  Order,
  "id" | "order_number" | "customer_name" | "order_total" | "status" | "order_date"
>;

export default function DashboardPage() {
  const { setMobileOpen } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeOrders: 0,
  });
  const [productStats, setProductStats] = useState({
    all: 0,
    published: 0,
  });
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    completed: 0,
  });
  const [chartData, setChartData] = useState<AnalyticsDaily[]>([]);
  const [chartMode, setChartMode] = useState<"sales" | "orders" | "customers">("sales");
  const [recentOrders, setRecentOrders] = useState<SimpleOrder[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);

        const thirtyDaysAgo = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0];

        const [
          salesRes,
          ordersCountRes,
          customersCountRes,
          activeOrdersRes,
          allProductsRes,
          publishedProductsRes,
          allOrdersRes,
          pendingOrdersRes,
          completedOrdersRes,
          chartRes,
          recentRes,
        ] = await Promise.all([
          supabase.from("orders").select("order_total").eq("status", "Completed"),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("customers")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .in("status", ["In-Progress", "Pending"]),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("status", "Published"),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "Pending"),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "Completed"),
          supabase
            .from("analytics_daily")
            .select("id, date, total_sales, orders_count, new_customers, page_views, created_at")
            .gte("date", thirtyDaysAgo)
            .order("date", { ascending: true }),
          supabase
            .from("orders")
            .select(
              "id, order_number, customer_name, order_total, status, order_date",
            )
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const totalSales =
          salesRes.data?.reduce(
            (sum, row) => sum + Number((row as any).order_total),
            0,
          ) ?? 0;

        setKpis({
          totalSales,
          totalOrders: ordersCountRes.count ?? 0,
          totalCustomers: customersCountRes.count ?? 0,
          activeOrders: activeOrdersRes.count ?? 0,
        });

        setProductStats({
          all: allProductsRes.count ?? 0,
          published: publishedProductsRes.count ?? 0,
        });

        setOrderStats({
          all: allOrdersRes.count ?? 0,
          pending: pendingOrdersRes.count ?? 0,
          completed: completedOrdersRes.count ?? 0,
        });

        setChartData((chartRes.data as AnalyticsDaily[]) ?? []);
        setRecentOrders((recentRes.data as SimpleOrder[]) ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const initials =
    userEmail?.slice(0, 2).toUpperCase() ??
    "U";

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F4F5FA] p-6">
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-1 inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-[#45464E] md:text-2xl">
              Dashboard
            </h1>
          </div>
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5570F1] text-sm font-semibold text-white">
              {initials}
            </div>
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        </div>

        {/* KPI Row */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          animate="show"
          className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={cardItem}>
            <MetricCard
              icon={<TrendingUp size={18} />}
              label="Revenue"
              value={kpis.totalSales}
              prefix="$"
              decimals={2}
            />
          </motion.div>
          <motion.div variants={cardItem}>
            <MetricCard
              icon={<Package size={18} />}
              label="Orders"
              value={kpis.totalOrders}
            />
          </motion.div>
          <motion.div variants={cardItem}>
            <MetricCard
              icon={<Users size={18} />}
              label="Customers"
              value={kpis.totalCustomers}
            />
          </motion.div>
          <motion.div variants={cardItem}>
            <MetricCard
              icon={<ShoppingCart size={18} />}
              label="Active Orders"
              value={kpis.activeOrders}
            />
          </motion.div>
        </motion.div>

        {/* Second row metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border border-gray-100 bg-[#5570F1] text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <Package size={18} />
              </div>
              <span className="text-xs text-blue-100">Inventory</span>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-0">
              <div>
                <p className="text-xs text-blue-100">All Products</p>
                <AnimatedNumber
                  value={productStats.all}
                  className="text-xl font-semibold"
                />
              </div>
              <div>
                <p className="text-xs text-blue-100">Published</p>
                <AnimatedNumber
                  value={productStats.published}
                  className="text-xl font-semibold"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <ShoppingCart size={18} />
              </div>
              <span className="text-xs text-gray-400">Orders</span>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 pt-0 text-sm">
              <div>
                <p className="text-xs text-gray-500">All Orders</p>
                <AnimatedNumber
                  value={orderStats.all}
                  className="text-lg font-semibold text-gray-900"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <AnimatedNumber
                  value={orderStats.pending}
                  className="text-lg font-semibold text-gray-900"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <AnimatedNumber
                  value={orderStats.completed}
                  className="text-lg font-semibold text-gray-900"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium text-gray-700">
                Overview
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                High-level store snapshot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Total revenue</span>
                <span className="font-semibold">
                  {formatCurrency(kpis.totalSales)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total orders</span>
                <span className="font-semibold">{kpis.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Customers</span>
                <span className="font-semibold">{kpis.totalCustomers}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid: chart + recent orders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border border-gray-100 bg-white lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-semibold text-[#45464E]">
                  Performance
                </CardTitle>
                {/* 3-tab toggle */}
                <div className="flex gap-1 rounded-lg bg-[#F4F5FA] p-1">
                  <button
                    type="button"
                    onClick={() => setChartMode("sales")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      chartMode === "sales"
                        ? "bg-[#5570F1] text-white shadow-sm"
                        : "text-[#8B8D97] hover:text-[#45464E]"
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("orders")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      chartMode === "orders"
                        ? "bg-[#5570F1] text-white shadow-sm"
                        : "text-[#8B8D97] hover:text-[#45464E]"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("customers")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      chartMode === "customers"
                        ? "bg-[#5570F1] text-white shadow-sm"
                        : "text-[#8B8D97] hover:text-[#45464E]"
                    }`}
                  >
                    Customers
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Subtle label showing what is being shown */}
                <span className="text-xs text-gray-400">
                  {chartMode === "sales" && "Daily revenue · last 30 days"}
                  {chartMode === "orders" && "Order volume · last 30 days"}
                  {chartMode === "customers" && "New customers · last 30 days"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={300}>
                {/* 
                  Conditionally render 3 completely different chart types.
                  Each chart type is semantically appropriate for its data:
                  - Revenue → BarChart (discrete daily totals, good for comparing amounts)
                  - Orders  → AreaChart (shows volume trend with filled area under curve)
                  - Customers → LineChart (shows acquisition trend as a pure trend line)
                */}
                {chartMode === "sales" ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 16, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#E1E2E9" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      tick={{ fill: "#8B8D97", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#A6A8B1", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "#EEF0FA" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #E1E2E9", backgroundColor: "#fff" }}
                      formatter={(val: unknown) => [formatCurrency(Number(val)), "Revenue"]}
                      labelFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      }
                    />
                    <Bar
                      dataKey="total_sales"
                      fill="#5570F1"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive
                      animationDuration={800}
                    />
                  </BarChart>
                ) : chartMode === "orders" ? (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 16, left: -16, bottom: 8 }}
                  >
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5570F1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#5570F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E1E2E9" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      tick={{ fill: "#8B8D97", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#A6A8B1", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #E1E2E9", backgroundColor: "#fff" }}
                      formatter={(val: unknown) => [Number(val).toLocaleString(), "Orders"]}
                      labelFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="orders_count"
                      stroke="#5570F1"
                      strokeWidth={2}
                      fill="url(#ordersGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#5570F1" }}
                      isAnimationActive
                      animationDuration={800}
                    />
                  </AreaChart>
                ) : (
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 16, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#E1E2E9" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      tick={{ fill: "#8B8D97", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#A6A8B1", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #E1E2E9", backgroundColor: "#fff" }}
                      formatter={(val: unknown) => [Number(val).toLocaleString(), "New Customers"]}
                      labelFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="new_customers"
                      stroke="#519C66"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#519C66" }}
                      isAnimationActive
                      animationDuration={800}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>

              {/* Legend row below chart */}
              <div className="mt-3 flex items-center justify-center gap-6 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-[#5570F1]" />
                  <span className="text-xs text-gray-400">
                    {chartMode === "sales" ? "Daily Revenue" : chartMode === "orders" ? "Order Count" : "New Customers"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>
                    {chartData.length > 0
                      ? (() => {
                          if (chartMode === "sales") {
                            const total = chartData.reduce((s, d) => s + Number(d.total_sales), 0);
                            return `Total: ${formatCurrency(total)}`;
                          }
                          if (chartMode === "orders") {
                            const total = chartData.reduce((s, d) => s + Number(d.orders_count), 0);
                            return `Total: ${total.toLocaleString()} orders`;
                          }
                          const total = chartData.reduce((s, d) => s + Number(d.new_customers), 0);
                          return `Total: ${total.toLocaleString()} new customers`;
                        })()
                      : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#45464E]">
                Recent Orders
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Latest activity across your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center justify-between rounded-xl bg-gray-50 px-3 py-3"
                    >
                      <div className="space-y-2">
                        <div className="h-3 w-32 rounded-full bg-gray-200" />
                        <div className="h-2 w-24 rounded-full bg-gray-100" />
                      </div>
                      <div className="h-3 w-16 rounded-full bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-200 bg-gray-50">
                    <ShoppingCart size={26} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-[#45464E]">
                    No recent orders
                  </p>
                  <p className="text-xs text-gray-400">
                    New orders will appear here as they come in.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.order_number}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col items-end gap-1">
                        <StatusBadge status={order.status} />
                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(order.order_total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

