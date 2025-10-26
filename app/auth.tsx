import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const handleSwitchMode = () => {
    setIsSignUp((prev: boolean) => !prev);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.Title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome back!"}
        </Text>

        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Password"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Password"
          mode="outlined"
          style={styles.input}
        />
        <Button mode="contained" style={styles.button}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button
          mode="text"
          onPress={handleSwitchMode}
          style={styles.switchModeButton}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  Title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 30,
    // fontWeight: "bold",
    color: "rgba(30, 0, 51, 1)",
  },
  input: { marginBottom: 24 },
  button: {
    textAlign: "center",
    marginBottom: 12,
  },
  switchModeButton: {},
});
