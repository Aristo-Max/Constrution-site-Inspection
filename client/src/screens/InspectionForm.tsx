// // MicDebug.tsx
// import React, { useEffect, useState } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, Alert } from "react-native";
// import Voice from "@react-native-voice/voice";

// export default function InspectionForm() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [partial, setPartial] = useState<string>("");
//   const [finalText, setFinalText] = useState<string>("---");
//   const [status, setStatus] = useState<string>("Idle");

//   // Handlers
//   const onStart = () => { console.log("🎙️ onSpeechStart"); setStatus("Started"); };
//   const onEnd = () => { console.log("🛑 onSpeechEnd"); setStatus("Ended"); };
//   const onPartial = (e: any) => {
//     console.log("⌛ onSpeechPartialResults:", e?.value);
//     if (e?.value?.[0]) setPartial(e.value[0]);
//   };
//   const onResults = (e: any) => {
//     console.log("✅ onSpeechResults:", e?.value);
//     if (e?.value?.[0]) setFinalText(e.value[0]);
//   };
//   const onError = (e: any) => {
//     console.error("❌ onSpeechError:", e);
//     setStatus(`Error: ${e?.error?.message || "Unknown"}`);
//     setIsRecording(false);
//   };

//   // Attach listeners (supports both APIs)
//   // useEffect(() => {
//   //   console.log("Voice module available?", !!Voice);

//   //   let removers: Array<{ remove: () => void }> = [];

//   //   if ((Voice as any)?.addListener) {
//   //     // Newer style
//   //     removers = [
//   //       (Voice as any).addListener("onSpeechStart", onStart),
//   //       (Voice as any).addListener("onSpeechEnd", onEnd),
//   //       (Voice as any).addListener("onSpeechPartialResults", onPartial),
//   //       (Voice as any).addListener("onSpeechResults", onResults),
//   //       (Voice as any).addListener("onSpeechError", onError),
//   //     ];
//   //   } else {
//   //     // Legacy style
//   //     (Voice as any).onSpeechStart = onStart;
//   //     (Voice as any).onSpeechEnd = onEnd;
//   //     (Voice as any).onSpeechPartialResults = onPartial;
//   //     (Voice as any).onSpeechResults = onResults;
//   //     (Voice as any).onSpeechError = onError;
//   //   }

//   //   return () => {
//   //     // Clean up both styles
//   //     try {
//   //       removers.forEach(r => r?.remove?.());
//   //     } catch {}
//   //     Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
//   //   };
//   // }, []);

// useEffect(() => {
//   console.log("🔗 Setting up voice listeners...");

//   // Correct handlers assigned
//   Voice.onSpeechStart = (e: any) => {
//     console.log("🎙️ onSpeechStart", e);
//     setStatus("Started");
//   };

//   Voice.onSpeechEnd = (e: any) => {
//     console.log("🛑 onSpeechEnd", e);
//     setStatus("Ended");
//   };

//   Voice.onSpeechPartialResults = (e: any) => {
//     console.log("⌛ onSpeechPartialResults:", e?.value);
//     if (e?.value?.[0]) setPartial(e.value[0]);
//   };

//   Voice.onSpeechResults = (e: any) => {
//     console.log("✅ onSpeechResults:", e?.value);
//     if (e?.value?.[0]) setFinalText(e.value[0]);
//   };

//   Voice.onSpeechError = (e: any) => {
//     console.log("❌ onSpeechError:", e.error.message);
//     setStatus(`Error: ${e?.error?.message || "Unknown"}`);
//     setIsRecording(false);
//   };

//   // Cleanup
//   return () => {
//     console.log("🧹 Cleaning up voice listeners...");
//     Voice.destroy().then(() => Voice.removeAllListeners());
//   };
// }, []);



//   const requestMic = async () => {
//     if (Platform.OS !== "android") return true;
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       {
//         title: "Microphone Permission",
//         message: "App needs access to your microphone.",
//         buttonPositive: "OK",
//       }
//     );
//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   };

//   const start = async () => {
//     console.log("▶️ start()");
//     const ok = await requestMic();
//     if (!ok) {
//       Alert.alert("Mic permission denied");
//       return;
//     }
//     try {
//       // setPartial("");
//       setStatus("Starting…");
//       setIsRecording(true);
//       await Voice.destroy(); // clear any previous session
//       const options = {
//         EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 10000, // 10 seconds
//       };
//       await Voice.start("en-US", options);
//     } catch (e) {
//       // setPartial("");
//       setStatus("stopping...");
//       setIsRecording(false);
//       console.error("Voice.start error:", e);
//       setIsRecording(false);
//       setStatus("Start error");
//     }
//   };

//   const stop = async () => {
//     console.log("⏹️ stop()");
//     try {
//       await Voice.stop();
//     } catch (e) {
//       console.error("Voice.stop error:", e);
//     } finally {
//       setIsRecording(false);
//     }
//   };

//   return (
//     <View style={styles.root}>
//       <TouchableOpacity style={[styles.btn, isRecording && styles.btnStop]} onPress={isRecording ? stop : start}>
//         <Text style={styles.btnText}>{isRecording ? "Stop" : "Start"}</Text>
//       </TouchableOpacity>
//     {/* <Text>KKKKK</Text> */}
//       <Text style={styles.line}>Status: {status}</Text>
//       <Text style={styles.line}>Partial: {partial || "…"}</Text>
//       <Text style={styles.line}>Final: {finalText}</Text>
//       <Text style={styles.hint}>Watch Metro logs for detailed events.</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
//   btn: { backgroundColor: "#4CAF50", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999 },
//   btnStop: { backgroundColor: "#D32F2F" },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   line: { marginTop: 16, fontSize: 16 },
//   hint: { marginTop: 8, fontSize: 12, opacity: 0.7 },
// });

// InspectionForm.tsx
import React, { useState, useEffect } from "react";
import { View, Text, PermissionsAndroid, Platform, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the path as necessary
import colors from "../constants/color";
import Voice from '@react-native-voice/voice';
console.log("Voice module in InspectionForm.tsx:", Voice);

type InspectionFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

type InspectionFormProps = {
  navigation: InspectionFormScreenNavigationProp;
};

export default function InspectionForm({ navigation }: InspectionFormProps) {
  const [propertyName, setPropertyName] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
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

  return () => {
    Voice.destroy().then(Voice.removeAllListeners).catch((e) => console.error('Destroy error:', e));
  };
}, []);

const onSpeechStart = () => {
  console.log("Speech started");
  // setIsRecording(true);
};

const onSpeechEnd = () => {
  console.log("Speech ended");
  // setIsRecording(false);
};

// const onSpeechResults = (event) => {
//   const results = event.value;
//   if (results && results.length > 0) {
//     setNote((prev) => prev + " " + results[0]);
//   }
// };

    const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone to record speech.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

   const startRecording = async () => {
    console.log("Starting recording...");
  try {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.warn('Microphone permission denied');
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

  const handleTakePhoto = () => {
    // TODO: integrate with camera
    const dummyPhoto = "https://via.placeholder.com/100";
    setPhotos([...photos, dummyPhoto]);
  };

  const handleSave = () => {
    Alert.alert("Inspection saved!");
  };

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
      <View style={styles.card}>
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
});

