import {
  client,
  DATABASE_ID,
  databases,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/databases.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();

  const [habit, setHabit] = useState<Habit[]>();

  useEffect(() => {
    if (!user) return;
    fetchData();
    const channel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`;
    const habitsSubscription = client.subscribe(
      channel,
      (response: RealtimeResponse) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          fetchData();
        } else if (
          response.events.includes(
            "databases.*.collections.*.documents.*.updated"
          )
        ) {
          fetchData();
        } else if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          fetchData();
        }
      }
    );

    return () => {
      habitsSubscription();
    };
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_TABLE_ID,
        [Query.equal("User_Id", user?.$id ?? "")]
      );
      console.log(response.documents);
      setHabit(response.documents.map((doc) => doc as unknown as Habit));
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today's Habits
        </Text>
        <Button mode="text" onPress={signOut}>
          Sign Out
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habit?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No Habits yet.Add your first Habit
            </Text>
          </View>
        ) : (
          habit?.map((habit, key) => (
            <Surface key={key} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} variant="headlineSmall">
                  {habit.Title}
                </Text>
                <Text style={styles.cardDescription}>{habit.Description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.streakBadge}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={18}
                      color={"#ff9800"}
                    />
                    <Text style={styles.streakText}>
                      {habit.Streak_Count} Days Streak
                    </Text>
                  </View>

                  <View style={styles.frequencyBadge}>
                    <Text style={styles.frequencyText}>
                      {habit.Frequency.charAt(0).toUpperCase() +
                        habit.Frequency.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6c6c80",
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  frequencyText: {
    marginLeft: 6,
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
