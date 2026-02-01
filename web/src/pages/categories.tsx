import { Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { api } from "@/api";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setError("");

    try {
      const response = await api.post("/api/categories", { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error adding category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure? Spendings will be moved to 'Other'.")) return;
    
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Error deleting category");
    }
  };

  // Filter out "Other" from display
  const displayedCategories = categories.filter(c => c.name !== "Other");

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category Name"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Add
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : displayedCategories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No categories found. Add one above!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {displayedCategories.map((category) => (
              <li key={category.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <span>{category.name}</span>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2 cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
