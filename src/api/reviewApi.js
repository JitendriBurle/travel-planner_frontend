import API from "./api";

export const fetchReviews = (tripId) => {
  return API.get(`/reviews/${tripId}`);
};

export const createReview = (data) => {
  return API.post("/reviews", data);
};

export const deleteReview = (id) => {
  return API.delete(`/reviews/${id}`);
};