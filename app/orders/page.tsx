"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/sidebar-provider";
import { PageTransition } from "@/components/page-transition";
import { SkeletonRow } from "@/components/skeleton-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Send,
  Copy,
  ChevronDown,
  Menu,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  SearchX,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Order } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In-Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface MetricCardProps {
  label: string;
  value: number;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-100 bg-white">
      <CardHeader className="pb-3">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {value.toLocaleString()}
        </p>
      </CardHeader>
    </Card>
  );
}

const headerCell =
  "text-left p-3 font-medium text-gray-700 cursor-pointer select-none";

const bodyCell = "p-3 text-sm text-gray-700";

const sortIcon = (active: boolean, dir: "asc" | "desc") => {
  if (!active) return <ArrowUpDown size={14} className="text-gray-300" />;
  return dir === "asc" ? (
    <ArrowUp size={14} className="text-[#5570F1]" />
  ) : (
    <ArrowDown size={14} className="text-[#5570F1]" />
  );
};

export default function OrdersPage() {
  const { setMobileOpen } = useSidebar();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortCol, setSortCol] = useState<keyof Order>("order_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    all: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order(sortCol as string, { ascending: sortDir === "asc" })
        .range(from, to);

      if (debouncedSearch) {
        query = query.ilike("customer_name", `%${debouncedSearch}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count, error: dbError } = await query;
      if (dbError) throw dbError;

      setOrders((data as Order[]) ?? []);
      setTotalCount(count ?? 0);
      setSelectedRows([]);
    } catch (e) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortCol, sortDir, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // summary stats once
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const [all, pending, completed, cancelled] = await Promise.all([
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
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "Cancelled"),
      ]);
      setSummaryStats({
        all: all.count ?? 0,
        pending: pending.count ?? 0,
        completed: completed.count ?? 0,
        cancelled: cancelled.count ?? 0,
      });
    };
    load();
  }, []);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSort = (col: keyof Order) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const allSelected =
    orders.length > 0 && selectedRows.length === orders.length;

  const toggleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedRows(orders.map((o) => o.id));
    } else {
      setSelectedRows([]);
    }
  };

  const formatDate = (val: string) =>
    new Date(val).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleCopyTracking = async (order: Order) => {
    if (!order.tracking_id) return;
    await navigator.clipboard.writeText(order.tracking_id);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F4F5FA] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-1 inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 md:text-2xl">
              Orders
            </h1>
          </div>
        </div>

        {/* Orders Summary */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Orders Summary
            </h2>
            <Button className="rounded-xl bg-[#5570F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#4659d6]">
              <Plus size={18} className="mr-1" />
              Create a New Order
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="All Orders" value={summaryStats.all} />
            <MetricCard label="Pending" value={summaryStats.pending} />
            <MetricCard label="Completed" value={summaryStats.completed} />
            <MetricCard label="Cancelled" value={summaryStats.cancelled} />
          </div>
        </div>

        {/* Table card */}
        <Card className="rounded-2xl border border-gray-100 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Customer Orders
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5">
                  <Search size={16} className="text-gray-500" />
                  <Input
                    placeholder="Search customer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-6 border-none p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="In-Progress">In-Progress</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs text-gray-700"
                >
                  <Filter size={14} />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs text-gray-700"
                >
                  <Calendar size={14} />
                  Date
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs text-gray-700"
                >
                  <Send size={14} />
                  Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs text-gray-700"
                    >
                      Bulk Action
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Delete Selected</DropdownMenuItem>
                    <DropdownMenuItem>Export Selected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {error && !loading ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <AlertCircle size={32} className="text-red-300" />
                <p className="text-sm text-gray-500">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOrders}
                  className="mt-2 text-sm"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-y border-gray-200 bg-gray-50/80">
                      <tr className="h-11">
                        <th className="p-3 text-left">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("customer_name")}
                        >
                          <div className="flex items-center gap-1">
                            Customer
                            {sortIcon(sortCol === "customer_name", sortDir)}
                          </div>
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("order_date")}
                        >
                          <div className="flex items-center gap-1">
                            Order Date
                            {sortIcon(sortCol === "order_date", sortDir)}
                          </div>
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">
                          Order Type
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">
                          Tracking ID
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("order_total")}
                        >
                          <div className="flex items-center gap-1">
                            Order Total
                            {sortIcon(sortCol === "order_total", sortDir)}
                          </div>
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-gray-700">
                          Items
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortIcon(sortCol === "status", sortDir)}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <SkeletonRow key={i} columns={8} />
                        ))
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-14">
                            <div className="flex flex-col items-center gap-3 text-center">
                              <SearchX
                                size={34}
                                className="text-gray-200"
                              />
                              <p className="text-sm text-gray-500">
                                No orders found
                              </p>
                              {(debouncedSearch || statusFilter !== "all") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-[#5570F1]"
                                  onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                  }}
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        orders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.03,
                              duration: 0.2,
                            }}
                            className="h-12 border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="p-3">
                              <Checkbox
                                checked={selectedRows.includes(order.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRows((prev) => [
                                      ...prev,
                                      order.id,
                                    ]);
                                  } else {
                                    setSelectedRows((prev) =>
                                      prev.filter((id) => id !== order.id),
                                    );
                                  }
                                }}
                              />
                            </td>
                            <td className={bodyCell}>
                              {order.customer_name}
                            </td>
                            <td className={bodyCell}>
                              {formatDate(order.order_date)}
                            </td>
                            <td className={bodyCell}>{order.order_type}</td>
                            <td className={bodyCell}>
                              <div className="flex items-center gap-2">
                                <span className="truncate text-xs text-gray-700">
                                  {order.tracking_id ?? "—"}
                                </span>
                                {order.tracking_id && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyTracking(order)}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100"
                                  >
                                    {copiedId === order.id ? (
                                      <Check
                                        size={14}
                                        className="text-green-500"
                                      />
                                    ) : (
                                      <Copy
                                        size={14}
                                        className="text-gray-500"
                                      />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className={bodyCell}>
                              {formatCurrency(order.order_total)}
                            </td>
                            <td className={bodyCell}>{order.items_count}</td>
                            <td className={bodyCell}>
                              <StatusBadge status={order.status} />
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bulk selection bar */}
                {selectedRows.length > 0 && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2 text-xs text-gray-600">
                    <span>
                      {selectedRows.length} row
                      {selectedRows.length > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm text-gray-600 md:flex-row">
                  <div className="flex items-center gap-3">
                    <span>Rows per page</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(val) => {
                        setPageSize(parseInt(val, 10));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500">
                      {(totalCount === 0 ? 0 : (page - 1) * pageSize + 1)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      -
                      {Math.min(page * pageSize, totalCount)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      of{" "}
                      {totalCount
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      items
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      Page {page} of {pageCount}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === pageCount}
                        onClick={() =>
                          setPage((p) => Math.min(pageCount, p + 1))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

