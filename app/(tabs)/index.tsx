import { useAuth } from "@/lib/auth-context";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  const { signOut } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/dex.tsx to edit this screen.</Text>
      <Button mode="outlined" icon={"logout"} onPress={signOut}>
        Sign Out
      </Button>
    </View>
  );
}
