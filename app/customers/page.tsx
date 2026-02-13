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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import type { Customer } from "@/lib/types";
import { motion } from "framer-motion";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
}

function SummaryCard({ label, value, sub }: SummaryCardProps) {
  return (
    <Card className="flex-1 rounded-2xl border border-gray-100 bg-white">
      <CardHeader className="pb-3">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </CardHeader>
    </Card>
  );
}

const headerCell =
  "text-left px-3 py-3.5 font-normal text-gray-900 cursor-pointer select-none";

const bodyCell = "px-3 py-3 text-sm text-gray-700";

const sortIcon = (active: boolean, dir: "asc" | "desc") => {
  if (!active) return <ArrowUpDown size={14} className="text-gray-300" />;
  return dir === "asc" ? (
    <ArrowUp size={14} className="text-[#5570F1]" />
  ) : (
    <ArrowDown size={14} className="text-[#5570F1]" />
  );
};

export default function CustomersPage() {
  const { setMobileOpen } = useSidebar();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortCol, setSortCol] =
    useState<keyof Customer>("customer_since");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    avgSpent: 0,
  });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .order(sortCol as string, { ascending: sortDir === "asc" })
        .range(from, to);

      if (debouncedSearch) {
        query = query.or(
          `name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`,
        );
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count, error: dbError } = await query;
      if (dbError) throw dbError;

      setCustomers((data as Customer[]) ?? []);
      setTotalCount(count ?? 0);
      setSelectedRows([]);
    } catch {
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortCol, sortDir, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // summary data once
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const [all, active, orders] = await Promise.all([
        supabase
          .from("customers")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("status", "Active"),
        supabase
          .from("orders")
          .select("order_total"),
      ]);
      const total = all.count ?? 0;
      const activeCount = active.count ?? 0;
      const orderRows = (orders.data ?? []) as { order_total: number }[];
      const totalSpent = orderRows.reduce(
        (sum, o) => sum + Number(o.order_total),
        0,
      );
      const avgSpent =
        orderRows.length === 0 ? 0 : totalSpent / orderRows.length;
      setSummary({
        total,
        active: activeCount,
        avgSpent,
      });
    };
    load();
  }, []);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSort = (col: keyof Customer) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    };
  };

  const allSelected =
    customers.length > 0 && selectedRows.length === customers.length;

  const toggleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedRows(customers.map((c) => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F4F5FA] p-6">
        {/* Top Nav */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mr-1 inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
              Customers
            </h1>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">
              Customers Summary
            </h2>
            <Button className="h-9 rounded-xl bg-[#5570F1] px-4 text-sm font-medium text-white hover:bg-[#4659d6]">
              <Plus size={18} className="mr-1" />
              Add a New Customer
            </Button>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <SummaryCard
              label="All Customers"
              value={summary.total.toLocaleString()}
              sub=""
            />
            <SummaryCard
              label="Active"
              value={summary.active.toLocaleString()}
            />
            <SummaryCard
              label="Average Order Value"
              value={formatCurrency(summary.avgSpent)}
            />
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-xl border border-gray-100 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">
                Customers
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded border border-gray-300 px-2 py-1.5">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-6 w-32 border-none bg-transparent text-xs outline-none md:w-44"
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
                  onClick={fetchCustomers}
                >
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-y border-gray-200 bg-gray-50/80">
                      <tr className="h-12">
                        <th className="px-3 text-left">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            {sortIcon(sortCol === "name", sortDir)}
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-normal text-gray-900">
                          Email
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-normal text-gray-900">
                          Phone
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("orders_count")}
                        >
                          <div className="flex items-center gap-1">
                            Orders
                            {sortIcon(sortCol === "orders_count", sortDir)}
                          </div>
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("total_spent")}
                        >
                          <div className="flex items-center gap-1">
                            Total Spent
                            {sortIcon(sortCol === "total_spent", sortDir)}
                          </div>
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("customer_since")}
                        >
                          <div className="flex items-center gap-1">
                            Customer Since
                            {sortIcon(sortCol === "customer_since", sortDir)}
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-normal text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <SkeletonRow key={i} columns={8} />
                        ))
                      ) : customers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16">
                            <div className="flex flex-col items-center gap-3 text-center">
                              <SearchX
                                size={34}
                                className="text-gray-200"
                              />
                              <p className="text-sm text-gray-500">
                                No customers found
                              </p>
                              {(debouncedSearch || statusFilter !== "all") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
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
                        customers.map((customer, index) => (
                          <motion.tr
                            key={customer.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.03,
                              duration: 0.2,
                            }}
                            className="h-12 border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-3 py-3">
                              <Checkbox
                                checked={selectedRows.includes(customer.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRows((prev) => [
                                      ...prev,
                                      customer.id,
                                    ]);
                                  } else {
                                    setSelectedRows((prev) =>
                                      prev.filter((id) => id !== customer.id),
                                    );
                                  }
                                }}
                              />
                            </td>
                            <td className={bodyCell}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                                    customer.name,
                                  )}`}
                                >
                                  {initials(customer.name)}
                                </div>
                                <span className="text-sm text-gray-800">
                                  {customer.name}
                                </span>
                              </div>
                            </td>
                            <td className={bodyCell}>
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm text-gray-700">
                                  {customer.email}
                                </span>
                                {customer.email && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(customer.email)
                                    }
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100"
                                  >
                                    <Copy
                                      size={14}
                                      className="text-gray-500"
                                    />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className={bodyCell}>
                              {customer.phone ?? "—"}
                            </td>
                            <td className={bodyCell}>
                              {customer.orders_count}
                            </td>
                            <td className={bodyCell}>
                              {formatCurrency(customer.total_spent)}
                            </td>
                            <td className={bodyCell}>
                              {formatDate(customer.customer_since)}
                            </td>
                            <td className={bodyCell}>
                              <StatusBadge status={customer.status} />
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm text-gray-600 md:flex-row">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Rows per page</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(v) => {
                        setPageSize(parseInt(v, 10));
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
                      customers
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

