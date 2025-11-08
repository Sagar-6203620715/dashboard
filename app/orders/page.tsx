'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Send,
  Copy,
  ChevronDown,
} from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  orderType: string;
  trackingId: string;
  orderTotal: string;
  action: string;
  status: 'Completed' | 'In-Progress' | 'Pending';
}

const sampleOrders: Order[] = [
  {
    id: '1',
    customerName: 'Janet Adebayo',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Home Delivery',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Completed',
    status: 'Completed',
  },
  {
    id: '2',
    customerName: 'Samuel Johnson',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Home Delivery',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'In-Progress',
    status: 'In-Progress',
  },
  {
    id: '3',
    customerName: 'Francis Doe',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Pick Up',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Pending',
    status: 'Pending',
  },
  {
    id: '4',
    customerName: 'Christian Dior',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Pick Up',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Completed',
    status: 'Completed',
  },
  {
    id: '5',
    customerName: 'Christian Dior',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Pick Up',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Completed',
    status: 'Completed',
  },
  {
    id: '6',
    customerName: 'Janet Adebayo',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Home Delivery',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Completed',
    status: 'Completed',
  },
  {
    id: '7',
    customerName: 'Samuel Johnson',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Home Delivery',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'In-Progress',
    status: 'In-Progress',
  },
  {
    id: '8',
    customerName: 'Francis Doe',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Pick Up',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Pending',
    status: 'Pending',
  },
  {
    id: '9',
    customerName: 'Christian Dior',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Pick Up',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Completed',
    status: 'Completed',
  },
  {
    id: '10',
    customerName: 'Christian Dior',
    orderDate: '12 Aug 2022 - 12:25 am',
    orderType: 'Pick Up',
    trackingId: '9348fjr73',
    orderTotal: '₦25,000.00',
    action: 'Completed',
    status: 'Completed',
  },
];

interface MetricCardProps {
  label: string | string[];
  value: string | number | (string | number)[];
  change?: string;
  changeColor?: 'green' | 'red';
}

function MetricCard({
  label,
  value,
  change = '+0.00%',
  changeColor = 'green',
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-gray-100">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start gap-4">
          <div className="p-2 rounded-lg bg-orange-100">
            <div className="text-orange-500">📦</div>
          </div>
          <select className="text-xs border-0 bg-transparent outline-none cursor-pointer text-gray-400">
            <option>This Week</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {Array.isArray(label) ? (
          <div className="space-y-6">
            {(label as string[]).map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-sm font-medium text-gray-600">{item}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {Array.isArray(value) ? value[idx] : value}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      changeColor === 'red'
                        ? 'text-red-500'
                        : 'text-green-600'
                    }`}
                  >
                    {change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">{label}</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              <span className={`text-xs font-medium text-${changeColor}-600`}>
                {change}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: 'Completed' | 'In-Progress' | 'Pending') {
  switch (status) {
    case 'Completed':
      return (
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
          Completed
        </Badge>
      );
    case 'In-Progress':
      return (
        <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">
          In-Progress
        </Badge>
      );
    case 'Pending':
      return (
        <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">
          Pending
        </Badge>
      );
  }
}

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredOrders = sampleOrders.filter((order) =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <div className="flex-1 ml-72 min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-700">Orders</h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-orange-50">
            <span className="text-sm font-medium text-gray-700">
              Nanny's Shop
            </span>
            <ChevronDown size={16} className="inline ml-2" />
          </div>
          <div className="text-2xl">🔔</div>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/b4f35bf26cdf5ee2d0a27c107b023596d365143e?width=64"
            alt="Profile"
            className="w-8 h-8 rounded-lg"
          />
        </div>
      </div>

      {/* Orders Summary */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Orders Summary
          </h2>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 rounded-xl">
            <Plus size={20} />
            Create a New Order
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label={['All Orders', 'Pending', 'Completed']}
            value={['450', '5', '320']}
            change="+0.00%"
          />
          <MetricCard
            label={['Canceled', 'Returned', 'Damaged']}
            value={['30', '20', '5']}
            change="-20%"
            changeColor="red"
          />
          <MetricCard
            label={['Abandoned Cart', 'Customers']}
            value={['20%', '30']}
            change="+0.00%"
          />
        </div>
      </div>

      {/* Customer Orders Section */}
      <Card className="rounded-2xl border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Customer Orders
            </h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2">
                <Search size={18} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm outline-none bg-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="text-sm gap-2 border-gray-600"
              >
                <Filter size={16} />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm gap-2 border-gray-600"
              >
                <Calendar size={16} />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm gap-2 border-gray-600"
              >
                <Send size={16} />
                Share
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm gap-2 border-gray-600"
                  >
                    Bulk Action
                    <ChevronDown size={16} />
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
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-gray-200">
                <tr className="h-12">
                  <th className="text-left p-3 font-medium text-gray-800">
                    <Checkbox />
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Customer Name
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Order Date
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Order Type
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Tracking ID
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Order Total
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Action
                  </th>
                  <th className="text-left p-3 font-medium text-gray-800">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 h-12">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedRows.includes(order.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRows([...selectedRows, order.id]);
                          } else {
                            setSelectedRows(
                              selectedRows.filter((id) => id !== order.id)
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="p-3 text-gray-700">{order.customerName}</td>
                    <td className="p-3 text-gray-700">{order.orderDate}</td>
                    <td className="p-3 text-gray-700">{order.orderType}</td>
                    <td className="p-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        {order.trackingId}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                        >
                          <Copy size={16} className="text-gray-600" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{order.orderTotal}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 w-fit">
                        <span className="text-gray-600 text-xs">
                          {order.action}
                        </span>
                        <ChevronDown size={14} className="text-gray-600" />
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 p-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Items per page</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(parseInt(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredOrders.length)} of{' '}
                {filteredOrders.length} items
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {currentPage} of {totalPages || 1} pages
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
