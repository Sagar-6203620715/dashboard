'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Send,
  ChevronDown,
  Bell,
  Folder,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: string;
  inStock: number | string;
  discount: string;
  totalValue: string;
  action: 'Publish' | 'Unpublish';
  status: 'Published' | 'Unpublished';
  image: string;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 13 Pro',
    category: 'Gadgets',
    unitPrice: '$790.32',
    inStock: 8,
    discount: '$0.00',
    totalValue: '$6,322.58',
    action: 'Publish',
    status: 'Published',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/0f1117aa83789e7a98c7f4a464558c86886b0082?width=72',
  },
  {
    id: '2',
    name: 'iPhone 12 Pro',
    category: 'Gadgets',
    unitPrice: '$467.74',
    inStock: 12,
    discount: '$0.00',
    totalValue: '$5,612.90',
    action: 'Publish',
    status: 'Published',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/1ff2d6990f09599d64676d3a7dd405c796878a92?width=72',
  },
  {
    id: '3',
    name: 'Polo T-Shirt',
    category: 'Fashion',
    unitPrice: '$80.65',
    inStock: 120,
    discount: '$0.00',
    totalValue: '$9,677.42',
    action: 'Unpublish',
    status: 'Unpublished',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b1145bfdaf0ce89336c21ebfda2db78a49b1c7f?width=72',
  },
  {
    id: '4',
    name: 'Polo T-Shirt',
    category: 'Fashion',
    unitPrice: '$80.65',
    inStock: 'Out of Stock',
    discount: '$0.00',
    totalValue: '$0.00',
    action: 'Unpublish',
    status: 'Unpublished',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b1145bfdaf0ce89336c21ebfda2db78a49b1c7f?width=72',
  },
  {
    id: '5',
    name: 'Polo T-Shirt',
    category: 'Fashion',
    unitPrice: '$80.65',
    inStock: 'Out of Stock',
    discount: '$0.00',
    totalValue: '$0.00',
    action: 'Unpublish',
    status: 'Unpublished',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b1145bfdaf0ce89336c21ebfda2db78a49b1c7f?width=72',
  },
  {
    id: '6',
    name: 'iPhone 13 Pro',
    category: 'Gadgets',
    unitPrice: '$790.32',
    inStock: 8,
    discount: '$0.00',
    totalValue: '$6,322.58',
    action: 'Publish',
    status: 'Published',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/0f1117aa83789e7a98c7f4a464558c86886b0082?width=72',
  },
  {
    id: '7',
    name: 'iPhone 12 Pro',
    category: 'Gadgets',
    unitPrice: '$467.74',
    inStock: 12,
    discount: '$0.00',
    totalValue: '$5,612.90',
    action: 'Publish',
    status: 'Published',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/1ff2d6990f09599d64676d3a7dd405c796878a92?width=72',
  },
  {
    id: '8',
    name: 'Polo T-Shirt',
    category: 'Fashion',
    unitPrice: '$80.65',
    inStock: 120,
    discount: '$0.00',
    totalValue: '$9,677.42',
    action: 'Unpublish',
    status: 'Unpublished',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2b1145bfdaf0ce89336c21ebfda2db78a49b1c7f?width=72',
  },
];

export default function InventoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>(sampleProducts);

  const handleActionChange = (productId: string, newAction: 'Publish' | 'Unpublish') => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              action: newAction,
              status: newAction === 'Publish' ? 'Published' : 'Unpublished',
            }
          : product
      )
    );
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <div className="flex-1 ml-72 min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-medium text-gray-900">Inventory</h1>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-900">Nanny's Shop</span>
              <ChevronDown className="w-5 h-5 text-gray-900" />
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-blue-500" fill="#5570F1" />
            </div>
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/b4f35bf26cdf5ee2d0a27c107b023596d365143e?width=64"
              alt="Profile"
              className="w-8 h-8 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-900">
            Inventory Summary
          </h2>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 rounded-xl h-9 px-4">
            <Plus size={20} />
            Add a New Product
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-5">
          {/* Blue Card */}
          <Card className="rounded-xl border-gray-100 flex-1 bg-blue-500">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs text-blue-200">This Week</div>
                </div>

                <div className="flex gap-8">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="text-sm text-white">All Products</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-white">350</span>
                      <span className="text-xs text-blue-200">+0.00%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="text-sm text-white">Active</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-white">316</span>
                      <span className="text-xs text-blue-200">86%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* White Card */}
          <Card className="rounded-xl border-gray-100 flex-1">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.99268 12.6724C11.0668 12.6724 13.6943 13.1382 13.6943 14.999C13.6943 16.8599 11.0843 17.339 7.99268 17.339C4.91768 17.339 2.29102 16.8774 2.29102 15.0157C2.29102 13.154 4.90018 12.6724 7.99268 12.6724Z"
                        stroke="#130F26"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.99289 10.0163C5.97456 10.0163 4.33789 8.38051 4.33789 6.36217C4.33789 4.34384 5.97456 2.70801 7.99289 2.70801C10.0104 2.70801 11.6471 4.34384 11.6471 6.36217C11.6546 8.37301 10.0296 10.0088 8.01872 10.0163H7.99289Z"
                        stroke="#130F26"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.7354 9.0679C15.0695 8.8804 16.097 7.7354 16.0995 6.34956C16.0995 4.98373 15.1037 3.8504 13.7979 3.63623"
                        stroke="#130F26"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.4961 12.2769C16.7886 12.4694 17.6911 12.9227 17.6911 13.856C17.6911 14.4985 17.2661 14.9152 16.5794 15.176"
                        stroke="#130F26"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">This Week</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="text-sm text-red-500">Low Stock Alert</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-gray-900">23</span>
                      <span className="text-xs text-green-600">+15.80%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="text-sm text-gray-600">Expired</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-gray-900">3</span>
                      <span className="text-xs text-green-600">+85%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="text-sm text-gray-600">1 Start Rating</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-gray-900">2</span>
                      <span className="text-xs text-red-500">-10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Items Table */}
        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-6">
            {/* Table Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-medium text-gray-900">
                Inventory Items
              </h3>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1.5 h-7">
                  <Search size={16} className="text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs outline-none bg-transparent w-24"
                  />
                </div>

                {/* Filter Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-2 h-7 px-2 border-gray-800 text-gray-800"
                >
                  <Filter size={14} />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-2 h-7 px-2 border-gray-800 text-gray-800"
                >
                  <Calendar size={14} />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-2 h-7 px-2 border-gray-800 text-gray-800"
                >
                  <Send size={14} />
                  Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-2 h-7 px-2 border-gray-800 text-gray-800"
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-y border-gray-200">
                  <tr className="h-13">
                    <th className="text-left px-0 py-3.5 font-normal text-gray-900">
                      <Checkbox className="rounded-lg" />
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Product Name
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Category
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Unit Price
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        In-Stock
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Discount
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Total Value
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Action
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3.5 font-normal text-gray-900">
                      <div className="flex items-center gap-2">
                        Status
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-gray-900"
                        >
                          <path
                            d="M14 5.1665H2C1.72667 5.1665 1.5 4.93984 1.5 4.6665C1.5 4.39317 1.72667 4.1665 2 4.1665H14C14.2733 4.1665 14.5 4.39317 14.5 4.6665C14.5 4.93984 14.2733 5.1665 14 5.1665Z"
                            fill="currentColor"
                          />
                          <path
                            d="M12 8.5H4C3.72667 8.5 3.5 8.27333 3.5 8C3.5 7.72667 3.72667 7.5 4 7.5H12C12.2733 7.5 12.5 7.72667 12.5 8C12.5 8.27333 12.2733 8.5 12 8.5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M9.33366 11.8335H6.66699C6.39366 11.8335 6.16699 11.6068 6.16699 11.3335C6.16699 11.0602 6.39366 10.8335 6.66699 10.8335H9.33366C9.60699 10.8335 9.83366 11.0602 9.83366 11.3335C9.83366 11.6068 9.60699 11.8335 9.33366 11.8335Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 h-12">
                      <td className="px-0 py-1.5">
                        <Checkbox
                          checked={selectedRows.includes(product.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRows([...selectedRows, product.id]);
                            } else {
                              setSelectedRows(
                                selectedRows.filter((id) => id !== product.id)
                              );
                            }
                          }}
                          className="rounded-lg"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg border border-gray-100"
                          />
                          <span className="text-gray-700 text-sm">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 text-sm">
                        {product.category}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 text-sm text-right">
                        {product.unitPrice}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 text-sm">
                        {typeof product.inStock === 'string' ? (
                          <span className="text-gray-400">{product.inStock}</span>
                        ) : (
                          product.inStock
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 text-sm text-right">
                        {product.discount}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700 text-sm">
                        {product.totalValue}
                      </td>
                      <td className="px-3 py-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 w-fit cursor-pointer hover:bg-gray-200">
                              <span className="text-gray-600 text-xs">
                                {product.action}
                              </span>
                              <ChevronDown size={14} className="text-gray-600" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleActionChange(product.id, 'Publish')}
                            >
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleActionChange(product.id, 'Unpublish')
                              }
                            >
                              Unpublish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge
                          className={`rounded-lg px-3 py-1 ${
                            product.status === 'Published'
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-100'
                              : 'bg-orange-50 text-gray-900 hover:bg-orange-50'
                          }`}
                        >
                          {product.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(val) => {
                    setItemsPerPage(parseInt(val));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-16 h-6 text-xs bg-gray-100 border-0 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-400">Items per page</span>
                <span className="text-sm text-gray-600">
                  {startIdx + 1}-
                  {Math.min(startIdx + itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} items
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={currentPage.toString()}
                    onValueChange={(val) => setCurrentPage(parseInt(val))}
                  >
                    <SelectTrigger className="w-12 h-6 text-xs bg-gray-100 border-0 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">
                    of {totalPages || 1} pages
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-gray-600"
                    >
                      <path
                        d="M10.4721 11.5289C10.7324 11.7893 10.7324 12.2114 10.4721 12.4717C10.2117 12.7321 9.7896 12.7321 9.52925 12.4717L5.52925 8.47173C5.27686 8.21934 5.26803 7.81295 5.50922 7.54984L9.17588 3.54984C9.42468 3.27843 9.84639 3.2601 10.1178 3.50889C10.3892 3.75768 10.4076 4.1794 10.1588 4.45081L6.92341 7.98028L10.4721 11.5289Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-gray-600"
                    >
                      <path
                        d="M5.52794 4.47108C5.26759 4.21073 5.26759 3.78862 5.52794 3.52827C5.78829 3.26792 6.2104 3.26792 6.47075 3.52827L10.4708 7.52827C10.7231 7.78066 10.732 8.18705 10.4908 8.45016L6.82412 12.4502C6.57532 12.7216 6.15361 12.7399 5.8822 12.4911C5.61079 12.2423 5.59245 11.8206 5.84125 11.5492L9.07659 8.01973L5.52794 4.47108Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
