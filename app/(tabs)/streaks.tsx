import { Text, View } from "react-native";

export default function StreaksScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          height: 200,
          width: 200,
          backgroundColor: "coral",
          color: "white",
          borderRadius: 100,
          textAlign: "center",
          lineHeight: 200,
        }}
      >
        Login Screen
      </Text>
    </View>
  );
}
