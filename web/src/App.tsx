import { useState, useEffect } from "react";
import { api } from "./api";
import { cn } from "@/lib/utils";

function App() {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Kredit App</h1>
      <div className="p-6 border rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Backend Status</h2>
        <p className={cn("text-gray-600", loading && "opacity-50")}>
          {message || "Checking..."}
        </p>
        <button 
          onClick={checkHealth}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Re-check
        </button>
      </div>
    </div>
  );
}

export default App;
