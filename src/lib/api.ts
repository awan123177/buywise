import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: "/api",
});

export async function searchProducts(query: string, originalUrl?: string) {
  try {
    const response = await api.get("/search", { params: { q: query, originalUrl } });
    return response.data;
  } catch (error: any) {
    console.error("API search error:", error);
    toast.error(error?.response?.data?.error || "Network error. Failed to retrieve market data.");
    throw error;
  }
}

export async function fetchAdminStats() {
  try {
    const response = await api.get("/admin/stats");
    return response.data;
  } catch (error: any) {
    console.error("API admin stats error:", error);
    toast.error("Failed to load admin statistics.");
    throw error;
  }
}
