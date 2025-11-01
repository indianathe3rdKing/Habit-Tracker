import { View } from "react-native";
import { Text, TextInput } from "react-native-paper";

export default function StreaksScreen() {
  return (
    <View>
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
      <TextInput label={"Email"} mode="outlined" />
    </View>
  );
}
