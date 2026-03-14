import API from "./api";

export const loginUser = (email, password) =>
  API.post("/auth/login", { email, password });

export const signupUser = (name, email, password) =>
  API.post("/auth/signup", { name, email, password });

export const getProfile = () =>
  API.get("/auth/me");

export const updateProfile = (data) =>
  API.put("/auth/update-profile", data);