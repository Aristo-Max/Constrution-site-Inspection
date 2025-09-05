import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the path as necessary
import colors from "../constants/color";  

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

type SplashScreenProps = {
  navigation: SplashScreenNavigationProp;
   onFinish: () => void;
};



const SplashScreen = ({ navigation, onFinish }: SplashScreenProps) => {

//     useEffect(() => {
//   setTimeout(() => {
//     onFinish(); // call the prop
//   }, 2000); // wait 2 sec
// }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Site Inspection App</Text>
      <Text style={styles.subtitle}>
        We need access to your camera & microphone to capture inspection photos
        and notes.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onFinish}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 40 },
  button: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 18 },
});
