import React, { useState, useEffect, useContext } from "react";
import {
  ChevronRight,
  Bell,
  Info,
  MapPin,
  Moon,
  Sun,
} from "@tamagui/lucide-icons";
import {
  YStack,
  H2,
  ListItem,
  Switch,
  SizableText,
  Separator,
  XStack,
  Button,
  Text,
  useTheme,
} from "tamagui";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

import PocketBase from "pocketbase";
import { useTranslation } from "../hooks/useTranslation";
import { LanguageSelector } from "../components/LanguageSelector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const pb = new PocketBase("http://141.98.17.52");

export default function NewsFeedScreen() {
  const { t } = useTranslation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  useEffect(() => {
    const loadLanguageSetting = async () => {
      try {
        const value = await AsyncStorage.getItem("selectedLanguage");
        if (value !== null) {
          //setSelectedLanguage(value);
        }
      } catch (e) {
        console.error("Error loading language setting:", e);
      }
    };
    loadLanguageSetting();
  }, []);

  useEffect(() => {
    const loadLocationSetting = async () => {
      try {
        const value = await AsyncStorage.getItem("locationEnabled");
        if (value !== null) {
          setLocationEnabled(JSON.parse(value));
        }
      } catch (e) {
        console.error("Error loading location setting:", e);
      }
    };
    loadLocationSetting();
  }, []);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const handleLocationToggle = async () => {
    try {
      if (locationEnabled) {
        // Disable location
        await Location.requestForegroundPermissionsAsync();
        await Location.stopLocationUpdatesAsync("location-task");
      } else {
        // Enable location
        await Location.requestForegroundPermissionsAsync();
        await Location.startLocationUpdatesAsync("location-task", {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 60000,
        });
      }
      await AsyncStorage.setItem(
        "locationEnabled",
        JSON.stringify(!locationEnabled)
      );
      setLocationEnabled(!locationEnabled);
    } catch (e) {
      console.error("Error toggling location setting:", e);
    }
  };
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

  return (
    <YStack f={1} p="$4" space="$4" pt="$10" backgroundColor="$background">
      <H2 textAlign="center">{t("settings")}</H2>
      <Separator />
      <YStack space="$2">
        <SizableText size="$6" fontWeight="bold">
          {t("preferences")}
        </SizableText>
        <ListItem
          title={t("notification")}
          subTitle={notificationsEnabled ? `${t("enable")}` : `${t("disable")}`}
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
        <ListItem
          title={t("location")}
          subTitle={locationEnabled ? `${t("enable")}` : `${t("disable")}`}
          icon={<MapPin />}
          backgroundColor="$backgroundStrong"
          iconAfter={
            <XStack alignItems="center">
              <Switch
                checked={locationEnabled}
                onCheckedChange={handleLocationToggle}
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
          {t("about")}
        </SizableText>
        <ListItem
          title="App Version"
          subTitle="1.0.0"
          icon={<Info />}
          backgroundColor="$backgroundStrong"
        />
        <Text>{t("changeLanguage")}</Text>
        <LanguageSelector />
      </YStack>
    </YStack>
  );
}
