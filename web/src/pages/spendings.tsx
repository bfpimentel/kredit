import { format } from "date-fns";
import { useEffect, useState } from "react";

import { api } from "@/api";

interface Spending {
  id: string;
  name: string;
  date: string;
  amount: number;
  category_name: string;
}

export default function SpendingsPage() {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    fetchSpendings();
  }, [selectedMonth]);

  const fetchSpendings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/spendings?month=${selectedMonth}`);
      setSpendings(response.data);
    } catch (error) {
      console.error("Error fetching spendings:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = spendings.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Spendings</h1>
        <div className="flex items-center gap-2">
           <span className="text-gray-600">Filter by Month:</span>
           <input 
             type="month" 
             value={selectedMonth} 
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
           />
        </div>
      </div>
      
      <div className="grid gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500">
              <p className="text-sm text-gray-500">Total Spendings</p>
              <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading spendings...</div>
        ) : spendings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No spendings found for this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendings.map((spending) => (
                  <tr key={spending.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(spending.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spending.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {spending.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${spending.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
