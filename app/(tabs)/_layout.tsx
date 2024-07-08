import { Link, Tabs } from "expo-router";
import { Button, useTheme } from "tamagui";
import { AudioWaveform, Map } from "@tamagui/lucide-icons";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Map color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Tab Two",
          tabBarIcon: ({ color }) => <AudioWaveform color={color} />,
        }}
      />
    </Tabs>
  );
}
