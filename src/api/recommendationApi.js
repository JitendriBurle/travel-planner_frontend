import API from "./api";

export const fetchRecommendations = (data) =>
  API.post("/recommendations", data);
