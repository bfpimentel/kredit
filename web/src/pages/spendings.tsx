import { format } from "date-fns";
import { Check, X } from "lucide-react";

import { useEffect, useState } from "react";

import { api } from "@/api";

interface Spending {
  id: string;
  name: string;
  date: string;
  amount: number;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function SpendingsPage() {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    setSelectedIds(new Set()); // Reset selection on fetch
    try {
      const [spendingsRes, categoriesRes] = await Promise.all([
        api.get(`/api/spendings?month=${selectedMonth}`),
        api.get("/api/categories"),
      ]);
      setSpendings(spendingsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(spendings.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkUpdate = async () => {
    if (!bulkCategory || selectedIds.size === 0) return;

    try {
      await api.patch("/api/spendings", {
        spending_ids: Array.from(selectedIds),
        category_name: bulkCategory,
      });

      // Optimistic Update
      setSpendings((prev) => prev.map((s) => (selectedIds.has(s.id) ? { ...s, category_name: bulkCategory } : s)));

      // Reset
      setSelectedIds(new Set());
      setBulkCategory("");
    } catch (error) {
      console.error("Error bulk updating:", error);
      fetchData(); // Revert on error
    }
  };

  const totalAmount = spendings.reduce((sum, s) => sum + s.amount, 0);
  const isAllSelected = spendings.length > 0 && selectedIds.size === spendings.length;

  return (
    <div className="max-w-5xl mx-auto pb-10">
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <span className="font-medium">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="bg-gray-800 border-none text-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-white"
            >
              <option value="">Move to...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkCategory}
              className="p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-5 h-5 text-green-400" />
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

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
                  <th className="px-6 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendings.map((spending) => (
                  <tr
                    key={spending.id}
                    className={`hover:bg-gray-50 ${selectedIds.has(spending.id) ? "bg-indigo-50/50" : ""}`}
                    onClick={(e) => {
                      // Toggle selection on row click if not clicking interactive elements
                      if ((e.target as HTMLElement).closest('input[type="checkbox"], select')) return;
                      handleSelectOne(spending.id, !selectedIds.has(spending.id));
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(spending.id)}
                        onChange={(e) => handleSelectOne(spending.id, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
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
