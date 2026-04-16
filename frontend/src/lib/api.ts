import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://edunxues-school-production.up.railway.app/api",
  withCredentials: true,
});
