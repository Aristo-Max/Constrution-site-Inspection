import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function OnboardingScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>Welcome!</Text>
      <Text style={{ textAlign: "center", marginBottom: 20 }}>
        This app helps you perform inspections using photos, voice notes, and location data.
      </Text>
      <Button title="Next" onPress={() => navigation.navigate("PermissionIntro" as never)} />
    </View>
  );
}
