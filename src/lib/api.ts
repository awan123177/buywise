import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export async function searchProducts(query: string) {
  const response = await api.get("/search", { params: { q: query } });
  return response.data;
}

export async function fetchAdminStats() {
  const response = await api.get("/admin/stats");
  return response.data;
}
