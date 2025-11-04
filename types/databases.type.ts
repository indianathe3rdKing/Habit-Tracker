import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
  User_Id: string;
  Title: string;
  Description: string;
  Frequency: string;
  Streak_Count: number;
  Last_Completed: string;
  created_at: string;
}
