import {
  COMPLETION_TABLE_ID,
  DATABASE_ID,
  databases,
  HABITS_TABLE_ID,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/databases.type";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Query } from "react-native-appwrite";
import { Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabit] = useState<Habit[]>();
  const [habitCompletion, setHabitCompletion] = useState<HabitCompletion[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchData();
    fetchCompletionData();
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

  return (
    <View>
      <Text>Habit Streaks</Text>
    </View>
  );
}
