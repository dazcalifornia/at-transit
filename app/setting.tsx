import React, { useState } from "react";
import { ChevronRight, Bell, Info } from "@tamagui/lucide-icons";
import {
  YStack,
  H2,
  ListItem,
  Switch,
  SizableText,
  Separator,
  XStack,
} from "tamagui";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <YStack f={1} p="$4" space="$4" backgroundColor="$background">
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
                onCheckedChange={() =>
                  setNotificationsEnabled(!notificationsEnabled)
                }
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
    </YStack>
  );
}
