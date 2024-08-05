import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  CalendarCheck2,
  Map,
  Newspaper,
  Settings,
  Table,
  User,
} from "@tamagui/lucide-icons";
import CustomTabBar from "../components/CustomTabBar";

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
        tabBarStyle: { display: "none" }, // Hide the default tab bar
        contentStyle: { paddingBottom: 80 }, // Add padding to content to accommodate the custom tab bar
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Map color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Incoming Buses",
          tabBarIcon: ({ color }) => <CalendarCheck2 color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => <Table color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => <Newspaper color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="five"
        options={{
          title: "Setting",
          tabBarIcon: ({ color }) => <Settings color={color} />,
          headerShown: false,
        }}
      />

      {/* Add more screens as needed */}
    </Tabs>
  );
}
