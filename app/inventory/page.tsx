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
  ChevronDown,
  Menu,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  SearchX,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { motion } from "framer-motion";
import Image from "next/image";

const STATUS_STYLES: Record<string, string> = {
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

interface SummaryState {
  all: number;
  published: number;
  lowStock: number;
  totalValue: number;
}

export default function InventoryPage() {
  const { setMobileOpen } = useSidebar();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortCol, setSortCol] =
    useState<keyof Product>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [summary, setSummary] = useState<SummaryState>({
    all: 0,
    published: 0,
    lowStock: 0,
    totalValue: 0,
  });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .order(sortCol as string, { ascending: sortDir === "asc" })
        .range(from, to);

      if (debouncedSearch) {
        query = query.or(
          `name.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%`,
        );
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, count, error: dbError } = await query;
      if (dbError) throw dbError;

      setProducts((data as Product[]) ?? []);
      setTotalCount(count ?? 0);
      setSelectedRows([]);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    debouncedSearch,
    sortCol,
    sortDir,
    statusFilter,
    categoryFilter,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // summary once
  useEffect(() => {
    const supabase = createClient();
    const loadSummary = async () => {
      const [all, published, lowStock, values] = await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("status", "Published"),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .lt("in_stock", 10),
        supabase
          .from("products")
          .select("total_value"),
      ]);
      const valueRows = (values.data ?? []) as { total_value: number }[];
      const totalValue = valueRows.reduce(
        (sum, p) => sum + Number(p.total_value),
        0,
      );
      setSummary({
        all: all.count ?? 0,
        published: published.count ?? 0,
        lowStock: lowStock.count ?? 0,
        totalValue,
      });
    };
    loadSummary();
  }, []);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSort = (col: keyof Product) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const allSelected =
    products.length > 0 && selectedRows.length === products.length;

  const toggleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedRows(products.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

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
              Inventory
            </h1>
          </div>
        </div>

        {/* Summary section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">
              Inventory Summary
            </h2>
            <Button className="h-9 rounded-xl bg-[#5570F1] px-4 text-sm font-medium text-white hover:bg-[#4659d6]">
              <Plus size={18} className="mr-1" />
              Add a New Product
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border border-gray-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  All Products
                </CardTitle>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.all.toLocaleString()}
                </p>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border border-gray-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Published
                </CardTitle>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.published.toLocaleString()}
                </p>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border border-gray-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Low Stock (&lt; 10)
                </CardTitle>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.lowStock.toLocaleString()}
                </p>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border border-gray-100 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Inventory Value
                </CardTitle>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalValue)}
                </p>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-xl border border-gray-100 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">
                Inventory Items
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded border border-gray-300 px-2 py-1.5">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search products"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-6 w-32 border-none bg-transparent text-xs outline-none md:w-44"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Home & Kitchen">
                      Home &amp; Kitchen
                    </SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Unpublished">Unpublished</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
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
                <Button variant="outline" size="sm" onClick={fetchProducts}>
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
                            Product Name
                            {sortIcon(sortCol === "name", sortDir)}
                          </div>
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center gap-1">
                            Category
                            {sortIcon(sortCol === "category", sortDir)}
                          </div>
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("unit_price")}
                        >
                          <div className="flex items-center gap-1">
                            Unit Price
                            {sortIcon(sortCol === "unit_price", sortDir)}
                          </div>
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("in_stock")}
                        >
                          <div className="flex items-center gap-1">
                            In Stock
                            {sortIcon(sortCol === "in_stock", sortDir)}
                          </div>
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-normal text-gray-900">
                          Discount
                        </th>
                        <th
                          className={headerCell}
                          onClick={() => handleSort("total_value")}
                        >
                          <div className="flex items-center gap-1">
                            Total Value
                            {sortIcon(sortCol === "total_value", sortDir)}
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
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16">
                            <div className="flex flex-col items-center gap-3 text-center">
                              <SearchX
                                size={34}
                                className="text-gray-200"
                              />
                              <p className="text-sm text-gray-500">
                                No products found
                              </p>
                              {(debouncedSearch ||
                                statusFilter !== "all" ||
                                categoryFilter !== "all") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-[#5570F1]"
                                  onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                    setCategoryFilter("all");
                                  }}
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        products.map((product, index) => (
                          <motion.tr
                            key={product.id}
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
                                checked={selectedRows.includes(product.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRows((prev) => [
                                      ...prev,
                                      product.id,
                                    ]);
                                  } else {
                                    setSelectedRows((prev) =>
                                      prev.filter((id) => id !== product.id),
                                    );
                                  }
                                }}
                              />
                            </td>
                            <td className={bodyCell}>
                              <div className="flex items-center gap-3">
                                {product.image_url ? (
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 rounded-lg border border-gray-100 object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-[#5570F1]">
                                    {product.category.charAt(0)}
                                  </div>
                                )}
                                <span className="text-sm text-gray-800">
                                  {product.name}
                                </span>
                              </div>
                            </td>
                            <td className={bodyCell}>{product.category}</td>
                            <td className={bodyCell}>
                              {formatCurrency(Number(product.unit_price))}
                            </td>
                            <td className={bodyCell}>
                              <span
                                className={
                                  product.in_stock < 10
                                    ? "font-semibold text-amber-600"
                                    : "text-gray-800"
                                }
                              >
                                {product.in_stock}
                              </span>
                            </td>
                            <td className={bodyCell}>
                              {product.discount_percent
                                ? `${product.discount_percent}%`
                                : "—"}
                            </td>
                            <td className={bodyCell}>
                              {formatCurrency(Number(product.total_value))}
                            </td>
                            <td className={bodyCell}>
                              <StatusBadge status={product.status} />
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
                    <span className="text-xs text-gray-500">
                      Rows per page
                    </span>
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
                      products
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

