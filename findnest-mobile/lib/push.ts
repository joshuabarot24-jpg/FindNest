import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import api from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerPushToken() {
  try {
    if (Platform.OS !== "android" || !Device.isDevice) return;

    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return;

    // Native FCM token, because the backend sends through Firebase directly
    const t = await Notifications.getDevicePushTokenAsync();
    await api.post("/fcm/update-token", { fcm_token: String(t.data) });
  } catch (e) {
    console.log("Push registration failed", e);
  }
}