'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Plus, TrendingUp, Users, ShoppingCart, Package } from 'lucide-react';

const chartData = [
  { date: 'Sept 10', value: 211 },
  { date: 'Sept 11', value: 84 },
  { date: 'Sept 12', value: 154 },
  { date: 'Sept 13', value: 51 },
  { date: 'Sept 14', value: 196 },
  { date: 'Sept 15', value: 106 },
  { date: 'Sept 16', value: 196 },
];

interface MetricCardProps {
  icon: React.ReactNode;
  label: string | string[];
  value: string | number | (string | number)[];
  change?: string;
  variant?: 'default' | 'primary';
  fullWidth?: boolean;
  labelColor?: 'default' | 'red';
}

function MetricCard({
  icon,
  label,
  value,
  change = '+0.00%',
  variant = 'default',
  fullWidth = false,
  labelColor = 'default',
}: MetricCardProps) {
  const isPrimary = variant === 'primary';
  const isRedLabel = labelColor === 'red';

  return (
    <Card
      className={`rounded-2xl border-0 ${
        isPrimary 
          ? 'bg-blue-500 text-white' 
          : 'bg-white border border-gray-100'
      } ${fullWidth ? 'w-full' : ''}`}
    >
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start gap-4">
          <div
            className={`p-2 rounded-lg ${
              isPrimary
                ? 'bg-white/20'
                : 'bg-blue-50'
            }`}
          >
            <div className={isPrimary ? 'text-white' : 'text-blue-500'}>
              {icon}
            </div>
          </div>
          <select
            className={`text-xs border-0 bg-transparent outline-none cursor-pointer ${
              isPrimary ? 'text-blue-100' : 'text-gray-400'
            }`}
          >
            <option>This Week</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {Array.isArray(label) ? (
          <div className="space-y-6">
            {(label as string[]).map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`text-sm font-medium ${
                    isPrimary 
                      ? 'text-blue-100' 
                      : isRedLabel && idx === 0
                      ? 'text-red-500'
                      : 'text-gray-600'
                  }`}
                >
                  {item}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      isPrimary ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {Array.isArray(value) ? value[idx] : value}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isPrimary ? 'text-blue-100' : 'text-green-600'
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
            <div
              className={`text-sm font-medium ${
                isPrimary ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              {label}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold ${
                  isPrimary ? 'text-white' : 'text-gray-900'
                }`}
              >
                {value}
              </span>
              <span
                className={`text-xs font-medium ${
                  isPrimary ? 'text-blue-100' : 'text-green-600'
                }`}
              >
                {change}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="flex-1 ml-72 min-h-screen bg-nova-bg p-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-gray-100">
        <h1 className="text-2xl font-semibold text-nova-gray-600">Dashboard</h1>
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/8e8126f6da85a4782f6fd5d9792dd14a1ee2d26f?width=64"
          alt="Profile"
          className="w-8 h-8 rounded-lg"
        />
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Sales"
          value="$0.00"
          change="+0.00%"
        />
        <MetricCard
          icon={<Package size={20} />}
          label="Volume"
          value="0"
          change="+0.00%"
        />
        <MetricCard
          icon={<Users size={20} />}
          label="Customers"
          value="0"
          change="+0.00%"
        />
        <MetricCard
          icon={<ShoppingCart size={20} />}
          label="Active"
          value="0"
          change="+0.00%"
        />
      </div>

      {/* Three Column Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon={<Package size={20} />}
          label={['All Products', 'Active Product']}
          value={['0', '0']}
          variant="primary"
        />
        <MetricCard
          icon={<ShoppingCart size={20} />}
          label={['Abandoned Cart', 'Customers']}
          value={['0%', '0']}
          labelColor="red"
        />
        <MetricCard
          icon={<ShoppingCart size={20} />}
          label={['All Orders', 'Pending', 'Completed']}
          value={['0', '0', '0']}
        />
      </div>

      {/* Main Content - Chart and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-nova-gray-600">Summary</h2>
                <select className="px-3 py-1 rounded-lg bg-blue-50 text-blue-500 text-sm border-0 outline-none cursor-pointer font-medium">
                  <option>Sales</option>
                </select>
              </div>
              <select className="text-xs text-nova-gray-600 border-0 bg-transparent outline-none cursor-pointer font-medium">
                <option>Last 7 Days</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke="#f0f0f0"
                  height={1}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#bec0ca', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#a6a8b1', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e1e2e9',
                    borderRadius: '8px',
                  }}
                  cursor={false}
                />
                <Bar dataKey="value" fill="#eef0fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders Section */}
        <Card className="bg-white border border-gray-100 rounded-2xl flex flex-col h-fit">
          <CardHeader>
            <h2 className="text-lg font-semibold text-nova-gray-600">Recent Orders</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-8 py-12 flex-1">
            <div className="w-32 h-32 rounded-full border-2 border-gray-100 bg-nova-bg flex items-center justify-center">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-nova-gray-600">No Orders Yet?</h3>
              <p className="text-sm text-nova-gray-400 max-w-xs">
                Add products to your store and start selling to see orders here.
              </p>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 rounded-xl">
              <Plus size={20} />
              New Product
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
