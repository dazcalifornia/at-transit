import React, { useState, useEffect } from "react";
import { ChevronRight, Bell, Info } from "@tamagui/lucide-icons";
import {
  YStack,
  H2,
  ListItem,
  Switch,
  SizableText,
  Separator,
  XStack,
  Button,
} from "tamagui";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import { busStops } from "data/busStops";

import PocketBase from "pocketbase";

const pb = new PocketBase("http://141.98.17.52");

export default function NewsFeedScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === "granted");
  };

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      // If notifications are currently enabled, we'll disable them
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      setNotificationsEnabled(false);
    } else {
      // If notifications are currently disabled, we'll request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
        setNotificationsEnabled(true);
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive updates.",
          [{ text: "OK" }]
        );
      }
    }
  };

  async function insertBusStops(busStops) {
    for (const stop of busStops) {
      const data = {
        highway_name: stop.highway_name,
        position_km: stop.position_km,
        latitude: stop.latitude,
        longitude: stop.longitude,
      };
      const reqData = {
        busStopData: data,
      };

      try {
        const record = await pb.collection("busStops").create(data);
        console.log("Inserted record:", record);
      } catch (error) {
        console.error("Error inserting record:", error);
      }
    }
  }

  return (
    <YStack f={1} p="$4" space="$4" pt="$10" backgroundColor="$background">
      <H2 textAlign="center">Settings</H2>
      <Separator />
      <YStack space="$2">
        <SizableText size="$6" fontWeight="bold">
          Preferences
        </SizableText>
        <ListItem
          title="Notifications"
          subTitle={notificationsEnabled ? "Enabled" : "Disabled"}
          icon={<Bell />}
          backgroundColor="$backgroundStrong"
          iconAfter={
            <XStack alignItems="center">
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              >
                <Switch.Thumb animation="bouncy" />
              </Switch>
            </XStack>
          }
        />
      </YStack>
      <Separator />
      <YStack space="$2">
        <SizableText size="$6" fontWeight="bold">
          About
        </SizableText>
        <ListItem
          title="App Version"
          subTitle="1.0.0"
          icon={<Info />}
          backgroundColor="$backgroundStrong"
        />
      </YStack>
      <Button
        onPress={() => {
          insertBusStops(busStops);
        }}
      >
        create bus stop
      </Button>
      <Button onPress={checkNotificationPermissions}>
        Check Notification Permissions
      </Button>
    </YStack>
  );
}
