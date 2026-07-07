import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";

export default function StudentLoginScreen({ navigation }: any) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!studentId.trim() || !password.trim()) {
      setError("Please enter your Student ID and Password!");
      return;
    }
    setError("");
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <View style={styles.logoBox}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Student Login</Text>
        <Text style={styles.subtitle}>Use your school credentials</Text>

        <TextInput
          style={[
            styles.input,
            error && !studentId.trim() && styles.inputError,
          ]}
          placeholder="Student ID"
          placeholderTextColor="#9ca3af"
          value={studentId}
          onChangeText={(text) => {
            setStudentId(text);
            if (error) setError("");
          }}
        />

        <TextInput
          style={[
            styles.input,
            error && !password.trim() && styles.inputError,
          ]}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError("");
          }}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a237e",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1a237e",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 14,
    color: "#374151",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    width: "100%",
    color: "#ef4444",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: -4,
  },
  button: {
    width: "100%",
    backgroundColor: "#1a237e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  forgotText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 16,
    fontWeight: "600",
  },
});