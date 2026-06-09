import axios from "axios";

// Backend API base URL
const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      localStorage.removeItem("token");
      localStorage.removeItem("business_nexus_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password, role = "user") =>
    api.post("/auth/register", { name, email, password, role })
};

// Meeting APIs
export const meetingApi = {
  create: (meetingData) => api.post("/meetings", meetingData),
  getAll: (params = {}) => api.get("/meetings", { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  updateStatus: (id, status) => api.put(`/meetings/${id}/status`, { status }),
  update: (id, meetingData) => api.put(`/meetings/${id}`, meetingData),
  delete: (id) => api.delete(`/meetings/${id}`),
  getByUser: (userId) => api.get(`/meetings/user/${userId}`)
};

// Document APIs
export const documentApi = {
  upload: (file, meetingId = null, tags = [], notes = "") => {
    const formData = new FormData();
    formData.append("document", file);
    if (meetingId) formData.append("meetingId", meetingId);
    if (tags.length) formData.append("tags", JSON.stringify(tags));
    if (notes) formData.append("notes", notes);
    return api.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  getAll: (params = {}) => api.get("/documents", { params }),
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  sign: (id, signatureData) => api.post(`/documents/${id}/sign`, signatureData),
  getByMeeting: (meetingId) => api.get(`/documents/meeting/${meetingId}`)
};

// Payment APIs
export const paymentApi = {
  deposit: (amount, paymentMethodId, description = "") =>
    api.post("/payments/deposit", { amount, paymentMethodId, description }),
  transfer: (recipientId, amount, description = "") =>
    api.post("/payments/transfer", { recipientId, amount, description }),
  getHistory: (params = {}) => api.get("/payments/history", { params }),
  getById: (id) => api.get(`/payments/${id}`)
};

// Socket.IO connection
export const initSocket = () => {
  const socket = require("socket.io-client").socket(API_URL);
  return socket;
};

export default api;
