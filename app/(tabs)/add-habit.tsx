import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const frequencies = ["daily", "weekly", "monthly"];
type Frequency = (typeof frequencies)[number];

export default function AddHabitScreen() {
  const [Title, setTitle] = useState<string>("");
  const [Description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_TABLE_ID,
        ID.unique(),
        {
          User_Id: user.$id,
          Title,
          Description,
          Frequency: frequency,
          Streak_Count: 0,
          Last_Completed: new Date().toISOString(),
        }
      );

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("An unknown error occurred while adding the habit.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={setTitle}
        style={styles.input}
        label={"Title"}
        mode="outlined"
      />
      <TextInput
        onChangeText={setDescription}
        style={styles.input}
        label={"Description"}
        mode="outlined"
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={frequencies.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
      <Button
        style={styles.button}
        disabled={!Title || !Description}
        mode="contained"
        onPress={handleSubmit}
      >
        Add Habit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  SegmentedButtons: {
    marginBottom: 16,
  },
  button: { marginTop: 10 },
  frequencyContainer: {
    marginBottom: 24,
  },
});
