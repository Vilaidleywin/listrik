import { http } from "./http";

export const authApi = {
  login: (email, password) => http.post("/api/login", { email, password }),
  me: () => http.get("/api/me"),
  logout: () => http.post("/api/logout"),
};
