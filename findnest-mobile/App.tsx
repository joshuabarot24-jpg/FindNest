import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "./screens/LandingScreen";
import StudentLoginScreen from "./screens/StudentLoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SupportScreen from "./screens/SupportScreen";
import BrowseScreen from "./screens/BrowseScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ReportLostScreen from "./screens/ReportLostScreen";
import ReportFoundScreen from "./screens/ReportFoundScreen";
import ClaimStatusScreen from "./screens/ClaimStatusScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Browse" component={BrowseScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ReportLost" component={ReportLostScreen} />
        <Stack.Screen name="ReportFound" component={ReportFoundScreen} />
        <Stack.Screen name="ClaimStatus" component={ClaimStatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}