import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CravingsProvider } from "@/context/CravingsContext";
import { COLORS } from "@/constants/colors";

export default function RootLayout() {
  return (
    <CravingsProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="log" />
        <Stack.Screen name="hypnosis" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
        <Stack.Screen name="history" />
      </Stack>
    </CravingsProvider>
  );
}
