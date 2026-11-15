import { Alert, Platform } from "react-native";
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
    if (Platform.OS !== "android") return;
    if (!Device.isDevice) {
      Alert.alert("Push", "Not a real device");
      return;
    }

    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") {
      Alert.alert("Push", "Permission: " + status);
      return;
    }

    // Native FCM token, because the backend sends through Firebase directly
    const t = await Notifications.getDevicePushTokenAsync();
    await api.post("/fcm/update-token", { fcm_token: String(t.data) });
    Alert.alert("Push", "Token saved");
  } catch (e: any) {
    Alert.alert("Push error", String(e?.response?.data?.message || e?.message || e));
  }
}