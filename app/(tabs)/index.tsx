import {
  client,
  COMPLETION_TABLE_ID,
  DATABASE_ID,
  databases,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/databases.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabit] = useState<Habit[]>();
  const [habitCompletion, setHabitCompletion] = useState<string[]>();

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (!user) return;
    fetchData();

    const habitChannel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`;
    const habitsSubscription = client.subscribe(
      habitChannel,
      (response: RealtimeResponse) => {
        const isCreate = response.events.some((event) =>
          event.includes("create")
        );
        const isUpdate = response.events.some((event) =>
          event.includes("update")
        );
        const isDelete = response.events.some((event) =>
          event.includes("delete")
        );

        if (isCreate || isUpdate || isDelete) {
          fetchData();
        }
      }
    );

    const completionChannel = `databases.${DATABASE_ID}.collections.${COMPLETION_TABLE_ID}.documents`;
    const habitCompletionSubscription = client.subscribe(
      completionChannel,
      (response: RealtimeResponse) => {
        const isCreate = response.events.some((event) =>
          event.includes("create")
        );

        if (isCreate) {
          fetchCompletionData();
        }
      }
    );

    fetchData();
    fetchCompletionData();

    return () => {
      habitsSubscription();
      habitCompletionSubscription();
    };
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_TABLE_ID,
        [Query.equal("User_Id", user?.$id ?? "")]
      );

      setHabit(response.documents.map((doc) => doc as unknown as Habit));
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchCompletionData = async () => {
    try {
      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID,
        COMPLETION_TABLE_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );

      setHabitCompletion(response.documents.map((doc) => doc.habit_id));
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_TABLE_ID, id);
    } catch (error) {
      console.log("Error deleting habit:", error);
    }
  };

  const handleCompletion = async (id: string) => {
    if (!user || habitCompletion?.includes(id)) return;
    const currentDate = new Date().toISOString();
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COMPLETION_TABLE_ID,
        ID.unique(),

        {
          habit_id: id,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );

      // const doc = await databases.getDocument(DATABASE_ID,COMPLETION_TABLE_ID,doc.$id)

      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;

      console.log("ID", doc.$id);
      const updateDoc = await databases.updateDocument(
        DATABASE_ID,
        HABITS_TABLE_ID,
        id,
        {
          Streak_Count: habit.Streak_Count + 1,
          Last_Completed: currentDate,
        }
      );
    } catch (error) {
      console.log("Error completing habit:", error);
    }
  };

  const isCompleted = (habitId: string) => habitCompletion?.includes(habitId);

  const renderLeftActions = () => {
    return (
      <View style={styles.swipeActionLeft}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={32}
          color={"#fff"}
        />
      </View>
    );
  };
  const renderRightActions = (habitId: string) => {
    console.log(isCompleted(habitId));
    console.log(habitId);
    return (
      <View style={styles.swipeActionRight}>
        {isCompleted(habitId) ? (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Completed!</Text>
        ) : (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={32}
            color={"#fff"}
          />
        )}
      </View>
    );
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
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No Habits yet.Add your first Habit
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={() => renderRightActions(habit.$id)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDelete(habit.$id);
                } else if (direction === "right") {
                  handleCompletion(habit.$id);
                }
                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              <Surface
                style={[
                  styles.card,
                  isCompleted(habit.$id) && styles.cardCompleted,
                ]}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} variant="headlineSmall">
                    {habit.Title}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {habit.Description}
                  </Text>
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
            </Swipeable>
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
  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#e53935",
    flex: 1,
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    paddingLeft: 26,
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "#4caf50",
    color: "#fff",
    flex: 1,
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    paddingRight: 26,
  },
  cardCompleted: {
    opacity: 0.5,
    borderColor: "#222",
  },
});
