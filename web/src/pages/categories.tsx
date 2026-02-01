import { useState, useEffect } from 'react';
import { api } from '../api';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await api.post('/api/categories', { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

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
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No categories found. Add one above!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="p-4 hover:bg-gray-50">
                {category.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
