// app/services/allApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token"); // or whatever key you use
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const login = async (credentials: { email: string; password: string }) => {
  const res = await API.post("/master/auth/login", credentials);
  return res.data;
};

export const isVerify = async () => {
 
  const res = await API.get("/master/auth/tokenCheck");
  return res.data;
};

export const companyList = async () => {
  const res = await API.get("/master/company/list_company");
  return res.data;
};

export const companyById = async (id: string) => {
  const res = await API.get(`/master/company/${id}`);
  return res.data;
};

export const addCompany = async (data: object) => {
  const res = await API.post("/master/company/add_company", data);
  return res.data;
};

export const updateCompany = async (id: string, data: object) => {
  const res = await API.put(`/master/company/${id}`, data);
  return res.data;
};

export const deleteCompany = async (id: string) => {
  const res = await API.delete(`/master/company/${id}`);
  return res.data;
};



