import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth-context";
import Layout from "@/layout";
import LoginPage from "@/pages/login";
import CategoriesPage from "@/pages/categories";
import ImportPage from "@/pages/import";
import { useState, useEffect, type ReactElement } from "react";
import { api } from "@/api";
import { cn } from "@/lib/utils";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function Dashboard() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/health");
      setMessage(JSON.stringify(res.data));
    } catch (error) {
      setMessage("Backend not available");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="p-6 border rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">System Status</h2>
        <p className={cn("text-gray-600", loading && "opacity-50")}>{message || "Checking..."}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="import" element={<ImportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
