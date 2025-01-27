import { Stack } from "expo-router";

export default function JournalTab() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="journals/[date]"
        options={({ route }) => ({
          title: route.params?.date,
        })}
      />
    </Stack>
  );
}
