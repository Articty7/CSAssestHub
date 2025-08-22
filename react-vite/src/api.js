import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const listAssets = (params = {}) => api.get("/assets", { params }).then(r => r.data);
export const createAsset = (data) => api.post("/assets", data).then(r => r.data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`).then(r => r.data);

export const listTags = () => api.get("/tags").then(r => r.data);
export const createTag = (name) => api.post("/tags", { name }).then(r => r.data);
