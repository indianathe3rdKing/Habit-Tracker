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
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabit] = useState<Habit[]>();
  const [habitCompletion, setHabitCompletion] = useState<HabitCompletion[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

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

    fetchData();
    fetchCompletionData();

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

      setHabitCompletion(response.documents.map((doc) => doc));
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreaks = (habitId: string): StreakData => {
    const completedHabits = habitCompletion
      ?.filter((c) => c.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );
    if (completedHabits?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    //build streak logic here
    let streak = 0;
    let bestStreak = 0;
    let total = completedHabits.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    completedHabits?.forEach((c) => {
      const date = new Date(c.completed_at);
      if (lastDate) {
        const diff =
          date.getTime() - lastDate.getTime() / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        streak = currentStreak;
        lastDate = date;
      }
    });
    return { streak, bestStreak, total };
  };

  const habitStreaks = habits?.map((habit) => {
    const { streak, bestStreak, total } = getStreaks(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks?.sort(
    (a, b) => a.bestStreak - b.bestStreak
  );

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  return (
    <View>
      <Text variant="headlineSmall" style={styles.title}>
        Habit Streaks
      </Text>

      {rankedHabits && rankedHabits?.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🏅 Top Streaks</Text>
          {rankedHabits?.slice(0, 3).map((item, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key]]}>
                <Text style={styles.rankingBadgeText}>{key + 1}</Text>
              </View>
              <Text style={styles.rankingHabitText}>{item.habit.Title}</Text>
              <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View>
            <Text>No Habits yet. Add your first Habit</Text>
          </View>
        ) : (
          rankedHabits?.map(({ habit, streak, bestStreak, total }, key) => (
            <Card
              style={[styles.card, key === 0 && styles.firstCard]}
              key={key}
            >
              <Card.Content style={styles.container}>
                <Text style={styles.cardTitle}>{habit.Title}</Text>
                <Text style={styles.cardDescription}>{habit.Description}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statsBadge}>
                    <Text style={styles.statBadgeText}>🔥 {streak}</Text>
                    <Text style={styles.statLabel}>Current</Text>
                  </View>
                  <View style={styles.statsBadgeGreen}>
                    <Text style={styles.statBadgeText}>🏆 {bestStreak}</Text>
                    <Text style={styles.statLabel}>Best</Text>
                  </View>
                  <View style={styles.statsBadgeGold}>
                    <Text style={styles.statBadgeText}>☯️ {total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    marginTop: 8,

    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 18,
  },
  cardDescription: {
    color: "#6c6c80",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    marginBottom: 10,
  },
  statsBadge: {
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 72,
  },
  statsBadgeGreen: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 72,
  },
  statsBadgeGold: {
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 72,
  },
  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "600",
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  card: {
    marginBottom: 18,
    marginHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,

    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  rankingContainer: {
    marginBottom: 28,
    marginHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },

  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1: { backgroundColor: "#ffd700" }, //Gold
  badge2: { backgroundColor: "#c0c0c0" }, //Silver
  badge3: { backgroundColor: "#cd7f32" }, //Bronze
  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },
  rankingHabitText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "bold",
  },
  rankingStreak: {
    fontSize: 15,
    color: "#7c4dff",
    fontWeight: "bold",
  },
});
