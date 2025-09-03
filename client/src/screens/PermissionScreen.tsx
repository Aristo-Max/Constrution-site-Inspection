import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,Platform, Alert } from "react-native";
import { PERMISSIONS, request, check, RESULTS } from "react-native-permissions";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the path as necessary

type PermissionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Permissions'>;

type PermissionScreenProps = {
  navigation: PermissionScreenNavigationProp;
  onPermissionsGranted: () => void;
};

const PermissionScreen = ({ navigation, onPermissionsGranted }: PermissionScreenProps) => {
  const requestPermissions = async () => {
    try {
      // Camera
      const cameraStatus = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA
      );

      // Microphone
      const micStatus = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.MICROPHONE
          : PERMISSIONS.ANDROID.RECORD_AUDIO
      );

      // Location
      const locationStatus = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );

      console.log("Camera:", cameraStatus);
      console.log("Mic:", micStatus);
      console.log("Location:", locationStatus);

      // ✅ If granted → go to Login
      if (
        cameraStatus === RESULTS.GRANTED &&
        micStatus === RESULTS.GRANTED &&
        locationStatus === RESULTS.GRANTED
      ) {
          onPermissionsGranted();
        // navigation.replace("Login"); // Or Home if already logged in
      } else {
        Alert.alert("Please allow all permissions to continue.");
      }
    } catch (err) {
      console.error("Permission error:", err);
    }
    //  onPermissionsGranted();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions Required</Text>
      <Text style={styles.subtitle}>We need these permissions:</Text>

      <Text style={styles.item}>📷 Camera - Capture inspection photos</Text>
      <Text style={styles.item}>🎤 Microphone - Record voice notes</Text>
      <Text style={styles.item}>📍 Location - Tag inspection location</Text>

      <TouchableOpacity style={styles.button} onPress={requestPermissions}>
        <Text style={styles.buttonText}>Allow Permissions</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PermissionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  item: { fontSize: 16, marginBottom: 10 },
  button: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 18 },
});
