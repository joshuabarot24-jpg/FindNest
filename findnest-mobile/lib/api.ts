import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: 'https://findnest-backend.onrender.com/api',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("findnest_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/");

    if (error.response?.status === 401 && !isLoginRequest) {
      await AsyncStorage.removeItem("findnest_token");
      await AsyncStorage.removeItem("findnest_user");
    }
    return Promise.reject(error);
  }
);

export default api;