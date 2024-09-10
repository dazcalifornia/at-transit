import React, { useCallback, useEffect, useState } from "react";
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
import { KeyboardAvoidingView, Platform, RefreshControl } from "react-native";

import PocketBase from "pocketbase";
import { useTranslation } from "app/hooks/useTranslation";

const pb = new PocketBase("http://141.98.17.52");

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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [busRoutes, setBusRoutes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getData = async () => {
    const routeData = await pb.collection("busRoutes").getFullList({
      requestKey: null,
    });

    setBusRoutes(routeData);
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredRoutes = busRoutes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, [getData]);

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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
                          {t("noschedule")}
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
