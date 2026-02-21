import axios from "axios";
import { getAuth } from "./auth";

export const api = axios.create({
  baseURL: "/api/v1",
});

api.interceptors.request.use((config) => {
  const { token } = getAuth();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});