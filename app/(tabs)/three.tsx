import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  YStack,
  Card,
  XStack,
  TextArea,
} from "tamagui";
import { busRoutes } from "data/busRoutes"; // Adjust the import path accordingly
import { Bus } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";

// Example custom Divider component
const Divider = () => (
  <View
    style={{
      height: 1,
      backgroundColor: "#034",
      width: "100%",
      marginVertical: 10,
    }}
  />
);

export default function BusScheduleScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoutes = busRoutes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View flex={1}>
          <TextArea
            placeholder="Search for a route"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              margin: 10,
              padding: 10,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 5,
            }}
          />
          <ScrollView
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 90, // Adjust the padding bottom to fit the tab bar
            }}
          >
            <YStack space={10}>
              {filteredRoutes.map((route) => (
                <Card
                  key={route.id}
                  padding={10}
                  borderRadius={10}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <YStack space={5} alignItems="center">
                    <XStack space={10} ai={"center"}>
                      <Bus size={35} color="$green10" />
                      <Text fontSize={20} color="$blue10">
                        {route.name}
                      </Text>
                    </XStack>
                    <Divider />
                    <YStack space={5} alignItems="flex-start">
                      {route.schedule && route.schedule.length > 0 ? (
                        route.schedule.map((time, index) => (
                          <Text key={index} fontSize={16} color="$green10">
                            {time}
                          </Text>
                        ))
                      ) : (
                        <Text fontSize={16} color="$red10">
                          No schedule available
                        </Text>
                      )}
                    </YStack>
                  </YStack>
                </Card>
              ))}
            </YStack>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
