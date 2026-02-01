import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { api } from "@/api";
import { cn } from "@/lib/utils";

interface Spending {
  id: string;
  amount: number;
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
  const categoryData = spendings.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category_name);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category_name, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  const totalAmount = spendings.reduce((sum, s) => sum + s.amount, 0);
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
          <h2 className="text-lg font-semibold mb-6">Spendings by Category</h2>
          {loading ? (
             <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
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
