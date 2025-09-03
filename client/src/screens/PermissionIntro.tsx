import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PermissionIntro() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Allow Location</Text>
      <Text style={{ textAlign: "center", marginBottom: 20 }}>
        We use your location to suggest nearby inspection sites.
      </Text>
      <Button title="Allow Location" onPress={() => navigation.navigate("RequestLocation" as never)} />
    </View>
  );
}
