import React, { useEffect, useState } from "react";
import { Text, View, Card, YStack, XStack } from "tamagui";
import * as Location from "expo-location";
import { busRoutes } from "data/busRoutes";
import { busStops } from "data/busStops";
import { Bus } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyBusStops, setNearbyBusStops] = useState([]);
  const [incomingBuses, setIncomingBuses] = useState([]);
  const [noNearbyStops, setNoNearbyStops] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      findNearbyBusStops(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  const findNearbyBusStops = (latitude, longitude) => {
    const nearbyStops = busStops.filter((stop) => {
      const distance = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        stop.latitude,
        stop.longitude
      );
      return distance <= 0.5; // Consider stops within 0.5 km radius
    });

    if (nearbyStops.length === 0) {
      setNoNearbyStops(true);
    } else {
      setNoNearbyStops(false);
      setNearbyBusStops(nearbyStops);
      findIncomingBuses(nearbyStops);
    }
  };

  const findIncomingBuses = (stops) => {
    const incoming = busRoutes.filter((route) => {
      const stop = stops.find((s) => s.id === route.stopId);
      return stop && route.arrivalTime <= 30;
    });
    setIncomingBuses(incoming);
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View flex={1} padding={10}>
        {errorMsg ? (
          <View flex={1} alignItems="center" justifyContent="center">
            <Text>{errorMsg}</Text>
          </View>
        ) : noNearbyStops ? (
          <View flex={1} alignItems="center" justifyContent="center">
            <Text>You are not near any bus stops or bus routes.</Text>
          </View>
        ) : incomingBuses.length > 0 ? (
          <YStack space={10}>
            {incomingBuses.map((bus, index) => (
              <Card key={index} padding={10} margin={10} borderRadius={10}>
                <XStack space={10}>
                  <Bus size={40} color="$blue10" />
                  <YStack space={10} alignItems="center">
                    <Text fontSize={18} color="$blue10">
                      Route: {bus.route}
                    </Text>
                    <Text fontSize={18} color="$green10">
                      Arriving in {bus.arrivalTime} minutes
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            ))}
          </YStack>
        ) : (
          <View flex={1} alignItems="center" justifyContent="center">
            <Text>No buses arriving within the next 30 minutes.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
