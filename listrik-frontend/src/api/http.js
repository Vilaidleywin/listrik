import axios from "axios";

export const http = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 8000, // 8 detik, biar kalau backend ngadat ketauan
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
