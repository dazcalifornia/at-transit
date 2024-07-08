import React from "react";
import { View, TouchableOpacity } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  Home,
  Grid,
  Settings,
  User,
  CalendarCheck2,
  Map,
  Table,
} from "@tamagui/lucide-icons";

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 100, // Adjust this value as needed
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <XStack
        backgroundColor="white"
        borderRadius={30}
        paddingHorizontal={20}
        paddingVertical={20}
        marginHorizontal={20}
        elevation={5}
        shadowColor="black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const IconComponent = getIconComponent(route.name);

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={{ flex: 1, alignItems: "center" }}
            >
              <YStack alignItems="center">
                <IconComponent
                  size={24}
                  color={isFocused ? "#8C1BAB" : "#000000"}
                />
              </YStack>
            </TouchableOpacity>
          );
        })}
      </XStack>
    </View>
  );
}

function getIconComponent(routeName) {
  switch (routeName) {
    case "index":
      return Map;
    case "two":
      return CalendarCheck2;
    case "three":
      return Table;
    case "four":
      return User;
    default:
      return Home;
  }
}

export default CustomTabBar;
