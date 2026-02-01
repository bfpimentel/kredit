import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "@/api";

interface Spending {
  id: string;
  amount: number;
  date: string;
  category_name: string;
}

export default function Dashboard() {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/spendings?month=${selectedMonth}`);
      setSpendings(res.data);
    } catch (error) {
      console.error("Error fetching spendings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group by category
  const categoryData = spendings
    .reduce((acc, curr) => {
      const existing = acc.find((item) => item.name === curr.category_name);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category_name, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  // Group by day of month
  const dailyData = spendings
    .reduce((acc, curr) => {
      const day = format(parseISO(curr.date), "d");
      const existing = acc.find((item) => item.day === day);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ day, amount: curr.amount, date: curr.date });
      }
      return acc;
    }, [] as { day: string; amount: number; date: string }[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalAmount = spendings.reduce((sum, s) => sum + s.amount, 0);
  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6"];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Total Spendings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <p className="text-sm font-medium text-gray-500">Categories</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{categoryData.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-500">Transactions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{spendings.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Daily Spending</h2>
        <div className="h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} labelFormatter={(label) => `Day ${label}`} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: "#4F46E5", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No data for this month</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
          <h2 className="text-lg font-semibold mb-6">Spendings by Category</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} interval={0} />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data for this month</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
          <h2 className="text-lg font-semibold mb-6">Distribution</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data for this month</div>
          )}
        </div>
      </div>
    </div>
  );
}
