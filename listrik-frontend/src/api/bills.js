import { http } from "./http";

export const billsApi = {
  list: () => http.get("/api/bills"),
  create: (data) => http.post("/api/bills", data),
  update: (id, data) => http.put(`/api/bills/${id}`, data),
  remove: (id) => http.delete(`/api/bills/${id}`),
  togglePaid: (id) => http.patch(`/api/bills/${id}/toggle-paid`),
  show: (id) => http.get(`/api/bills/${id}`),
};
