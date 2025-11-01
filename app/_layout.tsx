import AuthProvider, { useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const segment = useSegments();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const inAuthRoute = segment[0] === "auth";
    if (!user && !isLoading && !inAuthRoute) {
      router.replace("/auth");
    } else if (user && !isLoading && inAuthRoute) {
      router.replace("/");
    }
  }, [user, segment]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RouteGuard>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, headerTitleAlign: "center" }}
            />
          </Stack>
        </RouteGuard>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
