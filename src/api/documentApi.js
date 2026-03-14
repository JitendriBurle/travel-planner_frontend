import API from "./api";

export const fetchDocuments = (tripId) => {
  return API.get(`/documents/${tripId}`);
};

export const createDocument = (formData) => {
  return API.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteDocument = (id) => {
  return API.delete(`/documents/${id}`);
};

export const downloadDocument = (id) => {
  return API.get(`/documents/download/${id}`, {
    responseType: "blob",
  });
};