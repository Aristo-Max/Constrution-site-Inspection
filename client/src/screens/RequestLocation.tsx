import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Platform, PermissionsAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";

async function requestLocationPermission() {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "We need access to your location to show nearby inspections.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS handled via Info.plist
}

export default function RequestLocation() {
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      if (granted) {
        navigation.navigate("Login" as never);
      } else {
        navigation.navigate("Login" as never); // fallback
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Requesting Location Permission...</Text>
      <ActivityIndicator style={{ marginTop: 10 }} />
    </View>
  );
}
