import React, { useState, useEffect } from "react";
import {
  Activity,
  ExternalLink,
  ChevronUp,
  MapPin,
  Check,
  Bus,
  Settings,
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
  SizableText,
  Image,
} from "tamagui";
import MapView, { Polyline, Marker, Callout } from "react-native-maps";
import { busRoutes } from "data/busRoutes";
import { busStops } from "data/busStops";

import PocketBase from "pocketbase";

const pb = new PocketBase("http://141.98.17.52");

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

// Advertisement Component
const AdComponent = () => (
  <View
    style={{
      position: "absolute",
      top: 90,
      right: 20,
      backgroundColor: "white",
      padding: 10,
      borderRadius: 8,
      borderColor: "#ccc",
      borderWidth: 0.5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}
  >
    <Image
      source={{ uri: "https://via.placeholder.com/150" }} // Replace with your ad image URL
      style={{ width: 150, height: 90, borderRadius: 8 }}
      resizeMode="contain"
    />
  </View>
);

export default function TabOneScreen() {
  const [open, setOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [busRoutes, setBusRoutes] = useState([]);
  const [busStops, setBusStops] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const routeData = await pb.collection("busRoutes").getFullList({
        sort: "-created",
      });

      setBusRoutes(routeData);

      const stopData = await pb.collection("busStops").getFullList({
        sort: "-created",
      });
      setBusStops(stopData);
    };
    getData();
  }, []);

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
          <Polyline
            coordinates={selectedRoute.coordinates}
            strokeColor="rgba(33, 150, 243 ,0.7)"
            strokeWidth={3}
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
                    color: "#007AFF",
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 5,
                    textAlign: "right",
                  }}
                >
                  {stop.highway_name}
                </Text>
                <Text style={{ textAlign: "right", color: "#007AFF" }}>
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
        style={{
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          marginBottom: 80,
        }}
      />
      <AdComponent />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[70, 80]}
        zIndex={100000}
        disableDrag
        animation="medium"
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4" space="$5" backgroundColor="$background">
          <Sheet.Handle />
          <H2 textAlign="center" paddingBottom="$4">
            Select a Route
          </H2>
          <ScrollView
            style={{ width: "auto" }}
            showsVerticalScrollIndicator={false}
          >
            <YStack space="$2" mb="$4">
              {busRoutes.map((route, index) => (
                <ListItem
                  key={index}
                  onPress={() => {
                    setSelectedRoute(route);
                    setOpen(false);
                  }}
                  backgroundColor={
                    selectedRoute === route ? "$blue100" : "$backgroundStrong"
                  }
                  pressStyle={{ backgroundColor: "$blue200" }}
                  style={{ borderRadius: 10 }}
                >
                  <XStack ai="center" space="$2">
                    <Bus size="$2" color="#007AFF" />
                    <YStack>
                      <SizableText
                        fontWeight="bold"
                        color={selectedRoute === route ? "#007AFF" : "$color"}
                      >
                        {route.name}
                      </SizableText>
                      <SizableText
                        color={selectedRoute === route ? "#007AFF" : "$color"}
                      >
                        Route {route.id}
                      </SizableText>
                    </YStack>
                    {selectedRoute === route && (
                      <Check size="$2" color="#007AFF" />
                    )}
                  </XStack>
                </ListItem>
              ))}
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
