
// InspectionForm.tsx
import { useState, useRef, useEffect } from "react";
import { View, Text, PermissionsAndroid, Platform, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the path as necessary
import colors from "../constants/color";
import Voice from '@react-native-voice/voice';
import { Camera, useCameraDevice } from "react-native-vision-camera";

type InspectionFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

type InspectionFormProps = {
  navigation: InspectionFormScreenNavigationProp;
};

export default function InspectionForm({ }: InspectionFormProps) {
  const camera = useRef<Camera>(null);
// const devices = useCameraDevices();
const device = useCameraDevice("back");
  const [propertyName, setPropertyName] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const setupPermissionsAndVoice = async () => {
      // Camera permission
      const cameraStatus = await Camera.requestCameraPermission();
      setHasCameraPermission(cameraStatus === "granted");

      // Mic permission
      if (Platform.OS === "android") {
        const micStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone to record speech.",
            buttonPositive: "OK",
          }
        );
        setHasMicPermission(micStatus === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasMicPermission(true);
      }    
    };
    setupPermissionsAndVoice();
     const initializeVoice = async () => {
    try {
      // Attempt to initialize Voice (if required by the library)
      // await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure native module is ready
      Voice.onSpeechStart = onSpeechStart
      Voice.onSpeechEnd = onSpeechEnd
      Voice.onSpeechResults = (event) => {
        const results = event.value;
        console.log("SSSS")
        console.log("AAAA", event?.value?.[0]);
        if (results && results.length > 0) {
          setNote((prev) => prev + " " + results[0]);
        }
      };
      Voice.onSpeechPartialResults = (event) => {
        console.log("Partial results:");
        const results = event.value;
        if (results && results.length > 0) {
          console.log("Partial speech:", results[0]);
        }
      };
      Voice.onSpeechError = (e) => {
        console.error('Speech error:', e);
        setIsRecording(false);
      };
    } catch (e) {
      console.error('Voice initialization error:', e);
    }
  };
  initializeVoice();
    

    // ✅ Cleanup listeners
    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
    };
  }, []);

const onSpeechStart = () => {
  console.log("Speech started");
  setIsRecording(true);
};

const onSpeechEnd = () => {
  console.log("Speech ended");
  setIsRecording(false);
};

const startRecording = async () => {
  try {
     if (!hasMicPermission) {
        Alert.alert("Microphone permission denied");
        return;
      }
    if (!Voice) {
      console.error('Voice module is null, retrying initialization...');
      // await new Promise((resolve) => setTimeout(resolve, 500)); // Wait and retry
      if (!Voice) {
        Alert.alert('Voice module failed to load');
        return;
      }
    }
    if (!Voice.start) {
      Alert.alert('Voice.start method not available');
      return;
    }

    setIsRecording(true); 
    await Voice.start('en-US');
  } catch (e) {
    console.error('Voice start error:', e);
    setIsRecording(false);
  }
};

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
     finally {
    setIsRecording(false); // ✅ reset state here
  }
  };

const handleTakePhoto = async () => {
  if (!cameraActive) {
    // First tap → activate camera preview
    setCameraActive(true);
    return;
  }

  if (camera.current == null) return;

  try {
    const photo = await camera.current.takePhoto({
      flash: "off",
      enableShutterSound: true,
    });
    setPhotos((prev) => [...prev, "file://" + photo.path]);
  } catch (e) {
    console.error("Photo capture failed:", e);
  } finally {
    // After photo, stop preview
    setCameraActive(false);
  }
};


  const handleSave = () => {
    Alert.alert("Inspection saved!");
  };

    // Permission checks
  if (!hasCameraPermission || !hasMicPermission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.primary }}>
          Waiting for camera & microphone permissions...
        </Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      {/* Property Details */}
      <View style={styles.card}>
        <Text style={styles.label}>Property Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., PROP-2024-001"
          value={propertyName}
          onChangeText={setPropertyName}
        />

        {/* <Text style={styles.label}>Inspector Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f1f1f1", color: "#555" }]}
          value={"Mr. Smith"}
          editable={false}
        /> */}
      </View>

      {/* Voice Recording */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.recordBtn} onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.recordIcon}>{isRecording ? "Stop" : "🎤"}</Text>
        </TouchableOpacity>
        <Text style={styles.recordText}>Tap to {isRecording ? "stop" : "start"} recording</Text>
        <Text style={styles.hint}>
          Voice commands: "Start inspection", "Add note", "Complete inspection"
        </Text>
      </View>

      {/* Text Note Backup */}
      <View style={styles.card}>
        <Text style={styles.label}>Text Note Backup</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Type additional notes or corrections here..."
          multiline
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Capture */}
      {/* <View style={styles.card}>
        <View style={styles.photoHeader}>
          <Text style={styles.label}>Photo Capture</Text>
          <Text style={styles.photoCount}>{photos.length} photos</Text>
        </View>
        <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
          <Text style={styles.photoBtnText}>📷 Take Photo</Text>
        </TouchableOpacity>
        <View style={styles.photoRow}>
          {photos.map((p, i) => (
            <Image key={i} source={{ uri: p }} style={styles.photo} />
          ))}
        </View>
      </View> */}

      <View style={styles.card}>
  <View style={styles.photoHeader}>
    <Text style={styles.label}>Photo Capture</Text>
    <Text style={styles.photoCount}>{photos.length} photos</Text>
  </View>

  {cameraActive && device != null ? (
    <Camera
      ref={camera}
      style={styles.cameraPreview}
      device={device}
      isActive={cameraActive}
      photo={true}
      video={false}
      audio={false} // ✅ no mic conflict
    />
  ) : (
    <Text style={{ textAlign: "center", color: colors.textSecondary }}>
      Camera inactive
    </Text>
  )}

  <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
    <Text style={styles.photoBtnText}>
      {cameraActive ? "📷 Capture Now" : "Open Camera"}
    </Text>
  </TouchableOpacity>

  <View style={styles.photoRow}>
    {photos.map((p, i) => (
      <Image key={i} source={{ uri: p }} style={styles.photo} />
    ))}
  </View>
</View>


      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Inspection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", padding: 20, paddingTop: 40},

  card: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: colors.primary },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },

  recordBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  recordIcon: { fontSize: 28, color: colors.primary },
  recordText: { textAlign: "center", fontWeight: "600", marginBottom: 5, color: colors.primary },
  hint: { fontSize: 12, color: colors.textSecondary, textAlign: "center" },

  addBtn: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addBtnText: { color: colors.white, fontWeight: "600" },

  photoHeader: { flexDirection: "row", justifyContent: "space-between" },
  photoCount: { fontSize: 12, color: colors.primary },
  photoBtn: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  photoBtnText: { color: colors.white, fontWeight: "600" },
  photoRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  photo: { width: 80, height: 80, borderRadius: 6, marginRight: 8, marginBottom: 8 },

  saveBtn: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  cameraPreview: {
  width: "100%",
  height: 200,
  borderRadius: 10,
  marginBottom: 10,
},
center: { flex: 1, alignItems: "center", justifyContent: "center" },
});

