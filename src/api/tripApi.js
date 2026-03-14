import API from "./api";

// GET all trips
export const fetchTrips = () => {
  return API.get("/trips");
};

// CREATE trip
export const createTrip = (tripData) => {
  return API.post("/trips", tripData);
};

// DELETE trip
export const removeTrip = (id) => {
  return API.delete(`/trips/${id}`);
};