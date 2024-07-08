import React, { useState, useEffect } from "react";
import {
  Activity,
  ExternalLink,
  ChevronUp,
  MapPin,
} from "@tamagui/lucide-icons";
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
  ListItem,
  View,
} from "tamagui";
import { ToastControl } from "app/CurrentToast";
import MapView, { Polygon, Marker, Callout } from "react-native-maps";
import { busRoutes } from "data/busRoutes";
import { busStops } from "data/busStops";

// Function to check if a point is close to a polyline
const isPointNearPolyline = (point, polyline, threshold = 0.001) => {
  for (let i = 0; i < polyline.length - 1; i++) {
    const start = polyline[i];
    const end = polyline[i + 1];
    const distance = distanceToSegment(point, start, end);
    if (distance < threshold) return true;
  }
  return false;
};

// Helper function to calculate distance from point to line segment
const distanceToSegment = (point, start, end) => {
  const { latitude: x, longitude: y } = point;
  const { latitude: x1, longitude: y1 } = start;
  const { latitude: x2, longitude: y2 } = end;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function TabOneScreen() {
  const [open, setOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);

  useEffect(() => {
    if (selectedRoute) {
      const stops = busStops.filter((stop) =>
        isPointNearPolyline(stop, selectedRoute.coordinates)
      );
      setNearbyStops(stops);
    }
  }, [selectedRoute]);

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
          />
        )}
        {nearbyStops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 5,
                borderWidth: 1,
                borderColor: "#007AFF",
              }}
            >
              <MapPin color="#007AFF" size={20} />
            </View>
            <Callout tooltip>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 10,
                  borderRadius: 6,
                  borderColor: "#ccc",
                  borderWidth: 0.5,
                  width: 200, // Adjust this width as needed
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 5,
                    textAlign: "right",
                  }}
                >
                  {stop.highway_name}
                </Text>
                <Text style={{ textAlign: "right" }}>
                  Position: {stop.position_km}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
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
        zIndex={100000}
        animation="medium"
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4" space="$5" backgroundColor="$background">
          <Sheet.Handle />
          <H2 textAlign="center" paddingBottom="$4">
            Select a Route
          </H2>
          <ScrollView
            style={{ width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
            <YStack space="$2">
              {busRoutes.map((route, index) => (
                <ListItem
                  key={index}
                  title={route.name}
                  subTitle={`Route ${route.id}`}
                  onPress={() => {
                    setSelectedRoute(route);
                    setOpen(false);
                  }}
                  backgroundColor={
                    selectedRoute === route ? "$blue100" : "$backgroundStrong"
                  }
                  pressStyle={{ backgroundColor: "$blue200" }}
                  iconAfter={
                    selectedRoute === route ? <Activity size="$1" /> : null
                  }
                />
              ))}
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
