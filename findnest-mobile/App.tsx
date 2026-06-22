import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentLoginScreen from "./screens/StudentLoginScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StudentLogin" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}