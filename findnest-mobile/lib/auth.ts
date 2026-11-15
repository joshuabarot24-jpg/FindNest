import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushToken } from "./push";

export async function setAuth(token: string, user: any) {
  await AsyncStorage.setItem("findnest_token", token);
  await AsyncStorage.setItem("findnest_user", JSON.stringify(user));
  if (user?.role === "student") registerPushToken();
}

export async function getAuth() {
  const token = await AsyncStorage.getItem("findnest_token");
  const userStr = await AsyncStorage.getItem("findnest_user");
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
}

export async function clearAuth() {
  await AsyncStorage.removeItem("findnest_token");
  await AsyncStorage.removeItem("findnest_user");
}