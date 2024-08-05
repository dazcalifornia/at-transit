import React, { useEffect, useState } from "react";
import { Text, View, Card, YStack, XStack, Button } from "tamagui";
import * as Location from "expo-location";
import { busRoutes } from "data/busRoutes";
import { busStops } from "data/busStops";
import { Bus } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Platform, RefreshControl } from "react-native";
import * as Notifications from "expo-notifications";
import { ScrollView } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

import PocketBase from "pocketbase";

const pb = new PocketBase("http://141.98.17.52");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function TabTwoScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyBusStops, setNearbyBusStops] = useState([]);
  const [incomingBuses, setIncomingBuses] = useState([]);
  const [noNearbyStops, setNoNearbyStops] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState({});
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
      console.log("stopData🐳:", stopData);
      setBusStops(stopData);
    };
    getData();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        setErrorMsg("Failed to get push token for push notification!");
        return;
      }

      // Get the project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        setErrorMsg(
          "Failed to get project ID. Make sure it's set in app.json or app.config.js"
        );
        return;
      }

      // Get the token with the project ID
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;

      console.log("Expo push token:", token);
    } else {
      setErrorMsg("Must use physical device for Push Notifications");
    }

    console.log("token", token);

    return token;
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Register for push notifications
      const token = await registerForPushNotificationsAsync();
      if (token) console.log("Expo push token:", token);

      // Set up notification listeners
      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("Notification received:", notification);
        });

      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("Notification response:", response);
        });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    })();
  }, []);

  useEffect(() => {
    if (location) {
      findNearbyBusStops(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  useEffect(() => {
    incomingBuses.forEach((bus) => {
      scheduleNotification(bus);
    });

    // Clear scheduled notifications when component unmounts
    return () => {
      Notifications.cancelAllScheduledNotificationsAsync();
    };
  }, [incomingBuses]);

  useEffect(() => {
    const intervalId = setInterval(checkAndTriggerNotifications, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [incomingBuses]);

  const clearNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setScheduledNotifications({});
  };

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
    console.log("Searching for incoming buses...");
    console.log("Nearby stops:", stops);

    const currentTime = new Date();
    console.log("Current time:", currentTime);

    const incoming = busRoutes.filter((route) => {
      console.log("Checking route:", route.name);

      // Check if any of the route's coordinates are close to our nearby stops
      const isNearby = route.coordinates.some((coord) =>
        stops.some((stop) => {
          const distance = getDistanceFromLatLonInKm(
            stop.latitude,
            stop.longitude,
            coord.latitude,
            coord.longitude
          );
          console.log(`Distance to stop: ${distance} km`);
          return distance <= 0.5;
        })
      );

      console.log("Is route nearby?", isNearby);

      if (isNearby) {
        // Find the next arrival time
        const nextArrival = route.schedule.find((time) => {
          const [hours, minutes, period] = time
            .match(/(\d+):(\d+) (AM|PM)/)
            .slice(1);
          let arrivalTime = new Date(currentTime);
          arrivalTime.setHours(
            period === "PM" && hours !== "12"
              ? parseInt(hours) + 12
              : parseInt(hours),
            parseInt(minutes),
            0,
            0
          );
          console.log("Checking arrival time:", arrivalTime);
          return arrivalTime > currentTime;
        });

        if (nextArrival) {
          const [hours, minutes, period] = nextArrival
            .match(/(\d+):(\d+) (AM|PM)/)
            .slice(1);
          let arrivalTime = new Date(currentTime);
          arrivalTime.setHours(
            period === "PM" && hours !== "12"
              ? parseInt(hours) + 12
              : parseInt(hours),
            parseInt(minutes),
            0,
            0
          );
          const minutesUntilArrival = Math.round(
            (arrivalTime - currentTime) / 60000
          );
          console.log("Minutes until arrival:", minutesUntilArrival);

          return minutesUntilArrival <= 40;
        }
      }
      return false;
    });

    // console.log("Incoming buses:", incoming);

    setIncomingBuses(
      incoming.map((bus) => ({
        ...bus,
        arrivalTime: findNextArrivalTime(bus.schedule),
      }))
    );
  };

  const scheduleNotification = async (bus) => {
    const notificationKey = `${bus.name}-${bus.arrivalTime}`;

    if (scheduledNotifications[notificationKey]) {
      console.log(`Notification for ${bus.name} already scheduled`);
      return;
    }

    const currentTime = new Date().getTime();
    const arrivalTime = new Date(
      currentTime + bus.arrivalTime * 60000
    ).getTime();

    const thirtyMinTrigger = Math.max(
      0,
      (arrivalTime - currentTime - 30 * 60000) / 1000
    );
    const tenMinTrigger = Math.max(
      0,
      (arrivalTime - currentTime - 10 * 60000) / 1000
    );

    let thirtyMinNotificationId, tenMinNotificationId;

    if (thirtyMinTrigger > 0) {
      thirtyMinNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bus Arriving Soon",
          body: `${bus.name} will arrive in 30 minutes`,
          data: { busName: bus.name, arrivalTime: bus.arrivalTime },
        },
        trigger: { seconds: thirtyMinTrigger },
      });
      console.log(
        `Scheduled 30-min notification for ${bus.name}: ${thirtyMinNotificationId}`
      );
    }

    if (tenMinTrigger > 0) {
      tenMinNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bus Arriving Very Soon",
          body: `${bus.name} will arrive in 10 minutes`,
          data: { busName: bus.name, arrivalTime: bus.arrivalTime },
        },
        trigger: { seconds: tenMinTrigger },
      });
      console.log(
        `Scheduled 10-min notification for ${bus.name}: ${tenMinNotificationId}`
      );
    }

    setScheduledNotifications((prev) => ({
      ...prev,
      [notificationKey]: { thirtyMinNotificationId, tenMinNotificationId },
    }));

    console.log("schedule🐳:", scheduledNotifications);

    return { thirtyMinNotificationId, tenMinNotificationId };
  };

  const checkAndTriggerNotifications = async () => {
    const currentTime = new Date().getTime();

    for (const bus of incomingBuses) {
      const arrivalTime = new Date(
        currentTime + bus.arrivalTime * 60000
      ).getTime();
      const timeUntilArrival = (arrivalTime - currentTime) / 60000; // in minutes

      if (timeUntilArrival <= 30 && timeUntilArrival > 29) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Bus Arriving Soon",
            body: `${bus.name} will arrive in 30 minutes`,
            data: { busName: bus.name, arrivalTime: bus.arrivalTime },
          },
          trigger: null, // trigger immediately
        });
      } else if (timeUntilArrival <= 10 && timeUntilArrival > 9) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Bus Arriving Very Soon",
            body: `${bus.name} will arrive in 10 minutes`,
            data: { busName: bus.name, arrivalTime: bus.arrivalTime },
          },
          trigger: null, // trigger immediately
        });
      }
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await clearNotifications();
    if (location) {
      findNearbyBusStops(location.coords.latitude, location.coords.longitude);
    }
    setRefreshing(false);
  }, [location]);

  const findNextArrivalTime = (schedule) => {
    const currentTime = new Date();
    const nextArrival = schedule.find((time) => {
      const [hours, minutes, period] = time
        .match(/(\d+):(\d+) (AM|PM)/)
        .slice(1);
      let arrivalTime = new Date(currentTime);
      arrivalTime.setHours(
        period === "PM" && hours !== "12"
          ? parseInt(hours) + 12
          : parseInt(hours),
        parseInt(minutes),
        0,
        0
      );
      return arrivalTime > currentTime;
    });

    if (nextArrival) {
      const [hours, minutes, period] = nextArrival
        .match(/(\d+):(\d+) (AM|PM)/)
        .slice(1);
      let arrivalTime = new Date(currentTime);
      arrivalTime.setHours(
        period === "PM" && hours !== "12"
          ? parseInt(hours) + 12
          : parseInt(hours),
        parseInt(minutes),
        0,
        0
      );
      return Math.round((arrivalTime - currentTime) / 60000);
    }

    return null;
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

  const scheduleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification for the bus app",
        data: { test: "data" },
      },
      trigger: { seconds: 2 }, // null means the notification will fire immediately
    });

    console.log("busRoutes:", busRoutes);
    console.log("BusStops:", busStops);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                        Route: {bus.name}
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
      </ScrollView>
    </SafeAreaView>
  );
}
