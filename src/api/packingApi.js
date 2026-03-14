import API from "./api";

export const fetchPackingLists = (tripId) => {
  return API.get(`/packing/${tripId}`);
};

export const fetchPackingItems = (listId) => {
  return API.get(`/packing/items/${listId}`);
};

export const createPackingList = (data) => {
  return API.post("/packing", data);
};

export const addPackingItems = (items) => {
  return API.post("/packing/items", items);
};

export const togglePackingItem = (id, packed) => {
  return API.patch(`/packing/items/${id}`, { packed });
};

export const addCustomItem = (data) => {
  return API.post("/packing/items/custom", data);
};

export const deletePackingList = (id) => {
  return API.delete(`/packing/list/${id}`);
};

export const deletePackingItem = (id) => {
  return API.delete(`/packing/items/${id}`);
};