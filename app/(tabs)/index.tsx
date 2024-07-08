import React, { useState } from "react";
import { Activity, ExternalLink, ChevronUp } from "@tamagui/lucide-icons";
import {
  Anchor,
  Button,
  H2,
  Paragraph,
  XStack,
  YStack,
  Sheet,
  ScrollView,
  Text,
} from "tamagui";
import { ToastControl } from "app/CurrentToast";
import MapView, { Polygon } from "react-native-maps";
import { busRoutes } from "data/busRoutes";

export default function TabOneScreen() {
  const [open, setOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  return (
    <YStack f={1} ai="center">
      <MapView
        style={{ flex: 1, width: "100%", height: "100%" }}
        initialRegion={{
          latitude: 14.586022298685563,
          longitude: 100.45175049559951,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {selectedRoute && (
          <Polygon
            coordinates={selectedRoute.coordinates}
            strokeColor="rgba(0,0,255,0.5)"
            strokeWidth={2}
            fillColor="rgba(0,0,255,0.2)"
          />
        )}
      </MapView>

      <Button
        icon={ChevronUp}
        size="$6"
        circular
        onPress={() => setOpen(true)}
        style={{ position: "absolute", bottom: 20, alignSelf: "center" }}
      />

      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[50, 90]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <H2 pb="$4">Select a Route</H2>
          <ScrollView style={{ width: "100%", maxHeight: "80%" }}>
            {busRoutes.map((route, index) => (
              <Button
                key={index}
                size="$4"
                theme={selectedRoute === route ? "active" : "gray"}
                onPress={() => {
                  setSelectedRoute(route);
                  setOpen(false);
                }}
                style={{ marginBottom: 10 }}
              >
                {route.name}
              </Button>
            ))}
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
