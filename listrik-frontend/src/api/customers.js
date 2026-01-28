import { http } from "./http";

export const customersApi = {
  list: () => http.get("/api/customers"),
  create: (data) => http.post("/api/customers", data),
  update: (id, data) => http.put(`/api/customers/${id}`, data),
  remove: (id) => http.delete(`/api/customers/${id}`),
};
