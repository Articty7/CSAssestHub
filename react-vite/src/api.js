import axios from "axios";

function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const needsCsrf = /^(post|put|patch|delete)$/i.test(config.method || "");
  if (needsCsrf) {
    const token = getCookie("csrf_token");
    if (token) config.headers["X-CSRFToken"] = token;
  }
  return config;
});

export const listTags   = () => api.get("/tags").then(r => r.data);
export const createTag  = (name) => api.post("/tags", { name }).then(r => r.data);

export const listAssets   = (params={}) => api.get("/assets", { params }).then(r => r.data);
export const createAsset  = (data) => api.post("/assets", data).then(r => r.data);
export const deleteAsset  = (id)   => api.delete(`/assets/${id}`).then(r => r.data);

// upload helper -> GET pre-signed URL
export const getPresign = (filename, contentType) =>
  api.get("/uploads/s3-url", { params: { filename, contentType }}).then(r => r.data);
