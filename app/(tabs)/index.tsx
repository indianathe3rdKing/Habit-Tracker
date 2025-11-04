import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/databases.type";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_TABLE_ID,
        [Query.equal("User_Id", user?.$id ?? "")]
      );
      console.log(response.documents);
      setHabits(response.documents.map((doc) => doc as unknown as Habit));
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

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
