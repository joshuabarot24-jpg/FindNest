import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LandingScreen from "./screens/LandingScreen";
import StudentLoginScreen from "./screens/StudentLoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SupportScreen from "./screens/SupportScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ReportLostScreen from "./screens/ReportLostScreen";
import ReportFoundScreen from "./screens/ReportFoundScreen";
import ClaimStatusScreen from "./screens/ClaimStatusScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="Support" component={SupportScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="ReportLost" component={ReportLostScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="ReportFound" component={ReportFoundScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="ClaimStatus" component={ClaimStatusScreen} options={{ animation: "fade" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}