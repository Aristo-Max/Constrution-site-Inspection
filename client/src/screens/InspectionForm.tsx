import React, { useState, useRef, useEffect } from "react";
import { View, Text, PermissionsAndroid, Platform, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Modal, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../App';
import colors from "../constants/color";
import Voice from '@react-native-voice/voice';
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { useProperty, NoteItem, Inspection } from "../components/PropertyContext"; // CORRECTED PATH
type InspectionFormProps = NativeStackScreenProps<
  RootStackParamList,
  "InspectionForm"
>;
export default function InspectionForm({ navigation, route }: InspectionFormProps) {
  const { propertyId } = route.params;
  const { inspections, updateInspection } = useProperty();
  const [property, setProperty] = useState<Inspection | undefined>(undefined);
  useEffect(() => {
    const foundProperty = inspections.find(p => p.id === propertyId);
    setProperty(foundProperty);
  }, [propertyId, inspections]);
  const camera = useRef<Camera>(null);
  const device = useCameraDevice("back");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  useEffect(() => {
    const setupPermissionsAndVoice = async () => {
      const cameraStatus = await Camera.requestCameraPermission();
      setHasCameraPermission(cameraStatus === "granted");
      if (Platform.OS === "android") {
        const micStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        setHasMicPermission(micStatus === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasMicPermission(true);
      }
    };
    setupPermissionsAndVoice();
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechResults = (event) => {
      const results = event.value;
      if (results && results.length > 0) {
        setNote((prev) => prev + " " + results[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      console.error('Speech error:', e);
      setIsRecording(false);
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
    };
  }, []);
  const startRecording = async () => {
    try {
      if (!hasMicPermission) return Alert.alert("Microphone permission denied");
      await Voice.start('en-US');
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };
  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };
  const handleTakePhoto = async () => {
    if (!cameraActive) {
      setCameraActive(true);
      return;
    }
    if (camera.current == null) return;
    try {
      const photo = await camera.current.takePhoto();
      setPhotos((prev) => [...prev, "file://" + photo.path]);
    } catch (e) {
      console.error("Photo capture failed:", e);
    } finally {
      setCameraActive(false);
    }
  };
  const handleAddNote = async () => {
    if (!note.trim()) {
      Alert.alert("Please enter a note before adding.");
      return;
    }
    if (!property) {
      Alert.alert("Error", "Property data not found.");
      return;
    }
    const newNote: NoteItem = {
      id: Date.now().toString(),
      description: note,
      inspector: property.inspector, // This can be dynamic later
      photos: [...photos],
    };
    const updatedProperty = {
      ...property,
      notes: [...property.notes, newNote],
    };
    await updateInspection(updatedProperty);
    setNote("");
    setPhotos([]);
  };
  const handleCompleteInspection = async () => {
    if (!property) return;
    const updatedProperty = {
        ...property,
        status: 'Completed' as const
    };
    await updateInspection(updatedProperty);
    Alert.alert("Inspection Completed", "The status has been updated to 'completed'.");
    navigation.navigate('Dashboard');
  };
  if (!property) {
      return (
          <View style={styles.center}><Text>Loading property...</Text></View>
      )
  }
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
                // style={styles.backButton}
                onPress={() => navigation.navigate('Dashboard')} // go home
              >
                {/* <Icon name="arrow-back" size={24} color="#fff" /> */}
                <Text style={{ color: '#000', marginLeft: 10, fontSize: 20 }}>{"<-"}</Text>
              </TouchableOpacity>
      {property.notes.map((n: NoteItem) => (
        <View key={n.id} style={styles.noteCard}>
          <Text style={styles.noteInspector}>{n.inspector}</Text>
          <Text style={styles.noteDesc}>{n.description}</Text>
          <View style={styles.notePhotosRow}>
            {n.photos?.map((p, i) => (
              <TouchableOpacity key={i} onPress={() => setZoomImage(p)}>
                <Image source={{ uri: p }} style={styles.notePhoto} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <Text style={styles.label}>Add New Note for {property.name}</Text>
     <View style={styles.card}>
        <TouchableOpacity style={styles.recordBtn} onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.recordIcon}>{isRecording ? "Stop" : "🎤"}</Text>
        </TouchableOpacity>
        <Text style={styles.recordText}>Tap to {isRecording ? "stop" : "start"} recording</Text>
        <Text style={styles.hint}>
          Voice commands: "Start inspection", "Add note", "Complete inspection"
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Text Note Backup</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Type additional notes or corrections here..."
          multiline
          value={note}
          onChangeText={setNote}
        />
      </View>
      <View style={styles.card}>
        <View style={styles.photoHeader}>
          <Text style={styles.label}>Photo Capture</Text>
          <Text style={styles.photoCount}>{photos.length} photos</Text>
        </View>
        {cameraActive && device != null ? (
          <Camera ref={camera} style={styles.cameraPreview} device={device} isActive={cameraActive} photo={true} />
        ) : (
          <Text style={{ textAlign: "center", color: colors.textSecondary }}>Camera inactive</Text>
        )}
        <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
          <Text style={styles.photoBtnText}>{cameraActive ? ":camera: Capture Now" : "Open Camera"}</Text>
        </TouchableOpacity>
        <View style={styles.photoRow}>
          {photos.map((p, i) => <Image key={i} source={{ uri: p }} style={styles.photo} />)}
        </View>
      </View>
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddNote}>
          <Text style={styles.addBtnText}>Add Note</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleCompleteInspection}>
          <Text style={styles.saveBtnText}>Complete Inspection</Text>
        </TouchableOpacity>
      </View>
      {/* <Modal visible={!!zoomImage} transparent={true}>
        <View style={styles.modalBackground}>
          <Pressable style={{ flex: 1 }} onPress={() => setZoomImage(null)} />
          {zoomImage && <Image source={{ uri: zoomImage }} style={styles.zoomImage} />}
          <Pressable style={{ flex: 1 }} onPress={() => setZoomImage(null)} />
        </View>
      </Modal> */}
      <Modal visible={!!zoomImage} transparent animationType="fade" onRequestClose={() => setZoomImage(null)}>
              <Pressable style={styles.modalBg} onPress={() => setZoomImage(null)}>
                <Image source={{ uri: zoomImage! }} style={styles.zoom} />
              </Pressable>
            </Modal>
    </ScrollView>
  );
}
// Styles from your teammate's file
const styles = StyleSheet.create({
    modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  zoom: { width: "90%", height: "70%", resizeMode: "contain" },
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
     padding: 15,
     width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
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
    width: "100%",
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
  noteCard: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginBottom: 10, elevation: 1 },
  noteInspector: { fontWeight: "600", marginBottom: 4, color: colors.primary },
  noteDesc: { fontSize: 13, marginBottom: 6, color: "#444" },
  notePhotosRow: { flexDirection: "row", flexWrap: "wrap" },
  notePhoto: { width: 60, height: 60, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  zoomImage: { width: "90%", height: "70%", resizeMode: "contain" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});