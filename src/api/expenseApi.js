import API from "./api";

export const fetchExpenses = (tripId) => {
  return API.get(`/expenses/${tripId}`);
};

export const createExpense = (expense) => {
  return API.post("/expenses", expense);
};

export const removeExpense = (id) => {
  return API.delete(`/expenses/${id}`);
};

export const updateExpense = (id, expense) => {
  return API.put(`/expenses/${id}`, expense);
};
