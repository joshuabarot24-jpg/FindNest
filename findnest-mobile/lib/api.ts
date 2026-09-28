import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "./navigation";

const api = axios.create({
  baseURL: 'https://findnest-backend.onrender.com/api',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let redirectingToLogin = false;

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

      if (!redirectingToLogin && navigationRef.isReady()) {
        redirectingToLogin = true;
        navigationRef.reset({ index: 0, routes: [{ name: "Landing" }] });
        setTimeout(() => { redirectingToLogin = false; }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;