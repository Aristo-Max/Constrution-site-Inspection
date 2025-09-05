// // ReportScreen.tsx
// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";

// import RNHTMLtoPDF from "react-native-html-to-pdf";
// import RNFS from "react-native-fs";
// import Share from "react-native-share";
// import colors from "../constants/color";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from '../App'; // Adjust the path as necessary
// // import { Inspection } from "src/components/PropertyContext";
// import { NoteItem, Inspection } from "../components/PropertyContext";

// type ReportScreenProps = NativeStackScreenProps<
//   RootStackParamList,
//   "ReportScreen"
// >;

// // type NoteItem = {
// //   id: number;
// //   description: string;
// //   inspector: string;
// //   photos: string[];
// // };

// // type PropertyDetails = {
// //   name: string;
// //   address?: string;
// //   projectId?: string;
// //   date?: string; // ISO or display string
// //   inspector?: string; // falls back to each note's inspector if not provided
// // };


// export default function ReportScreen({ navigation, route }: ReportScreenProps) {
//   const { property, notes } = route.params;
//   const [zoomImage, setZoomImage] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);

//   const displayDate = useMemo(() => {
//     if (property?.date) return property.date;
//     const d = new Date();
//     return d.toLocaleString();
//   }, [property?.date]);

//   const onSharePdf = async (pdfPath: string) => {
//     try {
//       await Share.open({
//         title: "Share Inspection Report",
//         message: "Inspection Report",
//         url: "file://" + pdfPath,
//         type: "application/pdf",
//         failOnCancel: false,
//       });
//     } catch (e) {
//       // user canceled or share failed
//     }
//   };

//   const toBase64IfNeeded = async (uri: string) => {
//     // react-native-html-to-pdf usually works with file:// too,
//     // but base64 is most reliable across devices.
//     try {
//       const path = uri.replace("file://", "");
//       const b64 = await RNFS.readFile(path, "base64");
//       return `data:image/jpeg;base64,${b64}`;
//     } catch {
//       // fallback: try to pass the uri directly
//       return uri;
//     }
//   };

//   const buildHtml = (p: Inspection, ns: NoteItem[], imageMap: Record<string, string>) => {
//     // Simple, print-friendly CSS
//     const css = `
//       body { font-family: -apple-system, Roboto, Arial, sans-serif; color: #0D1B2A; }
//       .header { background: ${colors.primary}; color: ${colors.white}; padding: 16px; border-radius: 12px; }
//       .title { font-size: 20px; font-weight: 700; margin: 0; }
//       .subtitle { margin: 8px 0 0 0; font-size: 12px; opacity: 0.9; }
//       .section { background:#fff; border-radius: 12px; padding: 14px; margin-top: 14px; border: 1px solid #E5E7EB; }
//       .row { display:flex; gap: 12px; flex-wrap: wrap; }
//       .label { color:${colors.primary}; font-weight:600; font-size: 13px; margin-bottom: 8px; }
//       .detail { font-size: 13px; }
//       .noteCard { border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
//       .noteHead { display:flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
//       .noteInspector { color:${colors.primary}; font-weight:700; font-size: 12px; }
//       .noteDesc { font-size: 13px; margin: 6px 0 10px 0; }
//       .thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; }
//       .metaItem { margin-right: 16px; font-size: 12px; opacity: 0.9; }
//       .badge { background:${colors.secondary}; color:#fff; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
//       .grid { display:flex; gap:8px; flex-wrap: wrap; }
//     `;

//     const propertyHtml = `
//       <div class="section">
//         <div class="label">Property Details</div>
//         <div class="row">
//           <div class="detail"><strong>Name:</strong> ${p?.name || "-"}</div>
         
//           <div class="detail"><strong>Date:</strong> ${displayDate}</div>
//         </div>
//         ${p?.address ? `<div class="detail" style="margin-top:8px;"><strong>Address:</strong> ${p.address}</div>` : ""}
//       </div>
//     `;

//     const notesHtml = ns
//       .map((n, idx) => {
//         const imgs = (n.photos || [])
//           .map((u:any) => `<img class="thumb" src="${imageMap[u] || u}" />`)
//           .join("");
//         return `
//           <div class="noteCard">
//             <div class="noteHead">
//               <div class="noteInspector">👤 ${n.inspector || "Inspector"}</div>
//               <div class="badge">Note #${ns.length - idx}</div>
//             </div>
//             <div class="noteDesc">${escapeHtml(n.description || "")}</div>
//             ${imgs
//             ? `<div><div class="label" style="margin-bottom:6px;">Photos</div><div class="grid">${imgs}</div></div>`
//             : ""
//           }
//           </div>
//         `;
//       })
//       .join("");

//     return `
//       <html>
//         <head>
//           <meta name="viewport" content="width=device-width, initial-scale=1" />
//           <style>${css}</style>
//         </head>
//         <body>
//           <div class="header">
//             <h1 class="title">Inspection Report</h1>
//             <p class="subtitle">Generated on ${displayDate}</p>
//           </div>
//           ${propertyHtml}
//           <div class="section">
//             <div class="label">Notes</div>
//             ${notesHtml || `<div class="detail">No notes added.</div>`}
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const generatePdf = async () => {
//     try {
//       if (!property?.name) {
//         Alert.alert("Missing property name", "Please provide property name before generating PDF.");
//         return;
//       }
//       setBusy(true);

//       // Convert each photo to base64 for reliable embedding
//       const imageMap: Record<string, string> = {};
//       const allPhotos = notes.flatMap((n) => n.photos || []);
//       await Promise.all(
//         allPhotos.map(async (uri) => {
//           imageMap[uri] = await toBase64IfNeeded(uri);
//         })
//       );

//       const html = buildHtml(property, notes, imageMap);

//       const fileNameSafe = (property.name || "inspection_report")
//         .replace(/[^a-z0-9\-]+/gi, "_")
//         .toLowerCase();

//       const opts = {
//         html,
//         fileName: `${fileNameSafe}_${Date.now()}`,
//         directory: "Documents", // Android: /storage/emulated/0/Documents ; iOS: Files app
//       };

//       const pdf = await RNHTMLtoPDF.convert(opts);


//       if (!pdf.filePath) {
//         Alert.alert("Failed", "Could not create PDF.");
//         return;
//       }
//       if (pdf.filePath) {
//         // 👇 Move to Downloads for Android
//         const destPath =
//           RNFS.DownloadDirectoryPath + `/${property.name || "inspection"}_${Date.now()}.pdf`;

//         await RNFS.copyFile(pdf.filePath, destPath);

//         Alert.alert("PDF Saved", `Saved to Downloads:\n${destPath}`);
//         // await onSharePdf(destPath); // optional: open share sheet
//       }

//       // Alert.alert("PDF Generated", `Saved to:\n${pdf.filePath}`);
//       // await onSharePdf(pdf.filePath);
//     } catch (e: any) {
//       Alert.alert("PDF Error", e?.message || "Something went wrong while generating the PDF.");
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Inspection Report</Text>
//           <Text style={styles.subtitle}>Generated on {displayDate}</Text>
//         </View>

//         {/* Property block */}
//         <View style={styles.card}>
//           <Text style={styles.label}>Property Details</Text>
//           <View style={styles.row}>
//             <Detail label="Name" value={property?.name || "-"} />
//             {/* <Detail label="Project ID" value={property?.projectId || "-"} /> */}
//           </View>
//           {/* <View style={styles.row}>
//             <Detail label="Inspector" value={property?.inspector || "-"} />
//             <Detail label="Date" value={displayDate} />
//           </View> */}
//           {!!property?.address && (
//             <View style={{ marginTop: 8 }}>
//               <Detail label="Address" value={property.address} full />
//             </View>
//           )}
//         </View>

//         {/* Notes list */}
//         <View style={styles.card}>
//           <Text style={styles.label}>All Notes</Text>
//           {notes.length === 0 ? (
//             <Text style={styles.empty}>No notes added.</Text>
//           ) : (
//             notes.map((n, idx) => (
//               <View style={styles.noteCard}>
//                 <View style={styles.noteHead}>
//                   <Text style={styles.noteInspector}>👤 {n.inspector || "Inspector"}</Text>
//                   {/* <Text style={styles.noteBadge}>Note #{notes.length - idx}</Text> */}
//                 </View>
//                 <Text style={styles.noteDesc}>{n.description}</Text>

//                 {n.photos?.length ? (
//                   <>
//                     <Text style={[styles.label, { marginTop: 8 }]}>Photos</Text>
//                     <View style={styles.photoRow}>
//                       {n.photos.map((p, i) => (
//                         <TouchableOpacity key={i} onPress={() => setZoomImage(p)} activeOpacity={0.8}>
//                           <Image source={{ uri: p }} style={styles.thumb} />
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   </>
//                 ) : null}
//               </View>
//             ))
//           )}
//         </View>
//       </ScrollView>

//       {/* Generate PDF button */}
//       <TouchableOpacity style={styles.button} onPress={generatePdf} disabled={busy}>
//         {busy ? <ActivityIndicator /> : <Text style={styles.buttonText}>Download PDF</Text>}
//       </TouchableOpacity>

//       {/* Zoom Modal */}
//       <Modal visible={!!zoomImage} transparent animationType="fade">
//         <Pressable style={styles.modalBg} onPress={() => setZoomImage(null)}>
//           <Image
//             source={{ uri: zoomImage! }}
//             style={styles.zoom}
//           />
//         </Pressable>
//       </Modal>
//     </View>
//   );
// }

// function Detail({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
//   return (
//     <View style={[styles.detail, full && { flexBasis: "100%" }]}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{value}</Text>
//     </View>
//   );
// }

// function escapeHtml(s: string) {
//   return s
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FA" },

//   header: {
//     width: "100%",
//     backgroundColor: colors.primary,
//     padding: 16,
//     borderRadius: 12,
//     // margin: 16,
//   },
//   title: { color: colors.white, fontWeight: "800", fontSize: 18 },
//   subtitle: { color: colors.white, opacity: 0.9, marginTop: 4, fontSize: 12 },

//   card: {
//     width: "100%",
//     backgroundColor: colors.white,
//     // marginHorizontal: 16,
//     marginTop: 12,
//     borderRadius: 12,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   row: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
//   label: { color: colors.primary, fontWeight: "700", marginBottom: 6 },

//   detail: { flexGrow: 1, flexBasis: "48%" },
//   detailLabel: { color: colors.primary, fontWeight: "600", fontSize: 12 },
//   detailValue: { color: "#111", marginTop: 2, fontSize: 13 },

//   empty: { color: "#6B7280", fontSize: 13 },

//   // Note cards
//   noteCard: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 10,
//   },
//   noteHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   noteInspector: { color: colors.primary, fontWeight: "700", fontSize: 12 },
//   noteBadge: {
//     backgroundColor: colors.secondary,
//     color: "#fff",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 999,
//     fontSize: 11,
//     overflow: "hidden",
//   },
//   noteDesc: { color: "#222", marginTop: 6, fontSize: 13 },

//   // Photos
//   photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
//   thumb: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" },

//   // FAB
//   button: {
//     position: "absolute",
//     bottom: 24,
//     left: 16,
//     right: 16,
//     backgroundColor: colors.secondary,
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: "center",
//     elevation: 3,
//   },
//   buttonText: { color: colors.white, fontWeight: "800", fontSize: 16 },

//   // Zoom modal
//   modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
//   zoom: { width: "90%", height: "70%", resizeMode: "contain" },
// });


import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import colors from "../constants/color";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../App';
import { NoteItem, Inspection } from "../components/PropertyContext"; // CORRECTED PATH
type ReportScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ReportScreen"
>;
export default function ReportScreen({ navigation, route }: ReportScreenProps) {
  const { property } = route.params; // The entire inspection object
  const { notes } = property; // Get notes from the property
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const displayDate = useMemo(() => {
    if (property?.date) return new Date(property.date).toLocaleString();
    return new Date().toLocaleString();
  }, [property?.date]);
  // The rest of the file remains the same as your teammate's version
  // ... (buildHtml, generatePdf, etc.)
  const toBase64IfNeeded = async (uri: string) => {
    try {
      const path = uri.replace("file://", "");
      const b64 = await RNFS.readFile(path, "base64");
      return `data:image/jpeg;base64,${b64}`;
    } catch {
      return uri;
    }
  };
  const buildHtml = (p: Inspection, ns: NoteItem[], imageMap: Record<string, string>) => {
    const css = `
      body { font-family: -apple-system, Roboto, Arial, sans-serif; color: #0D1B2A; }
      .header { background: ${colors.primary}; color: ${colors.white}; padding: 16px; border-radius: 12px; }
      .title { font-size: 20px; font-weight: 700; margin: 0; }
      .subtitle { margin: 8px 0 0 0; font-size: 12px; opacity: 0.9; }
      .section { background:#fff; border-radius: 12px; padding: 14px; margin-top: 14px; border: 1px solid #E5E7EB; }
      .label { color:${colors.primary}; font-weight:600; font-size: 13px; margin-bottom: 8px; }
      .detail { font-size: 13px; }
      .noteCard { border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
      .noteHead { display:flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .noteInspector { color:${colors.primary}; font-weight:700; font-size: 12px; }
      .noteDesc { font-size: 13px; margin: 6px 0 10px 0; }
      .thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; }
      .grid { display:flex; gap:8px; flex-wrap: wrap; }
    `;
    const propertyHtml = `
      <div class="section">
        <div class="label">Property Details</div>
        <div class="detail"><strong>Name:</strong> ${p?.name || "-"}</div>
        <div class="detail"><strong>Date:</strong> ${displayDate}</div>
        ${p?.address ? `<div class="detail" style="margin-top:8px;"><strong>Address:</strong> ${p.address}</div>` : ""}
      </div>
    `;
    const notesHtml = ns
      .map((n, idx) => {
        const imgs = (n.photos || [])
          .map((u:any) => `<img class="thumb" src="${imageMap[u] || u}" />`)
          .join("");
        return `
          <div class="noteCard">
            <div class="noteHead">
              <div class="noteInspector">:silhouette: ${n.inspector || "Inspector"}</div>
            </div>
            <div class="noteDesc">${n.description || ""}</div>
            ${imgs ? `<div class="grid">${imgs}</div>` : ""}
          </div>
        `;
      })
      .join("");
    return `
      <html><head><style>${css}</style></head><body>
      <div class="header"><h1 class="title">Inspection Report</h1><p class="subtitle">Generated on ${displayDate}</p></div>
      ${propertyHtml}
      <div class="section"><div class="label">Notes</div>${notesHtml || `<div class="detail">No notes added.</div>`}</div>
      </body></html>
    `;
  };
  const generatePdf = async () => {
    try {
      if (!property?.name) return Alert.alert("Missing property name");
      setBusy(true);
      const imageMap: Record<string, string> = {};
      const allPhotos = notes?.flatMap((n) => n.photos || []) ?? [];
      await Promise.all(allPhotos.map(async (uri) => {
          imageMap[uri] = await toBase64IfNeeded(uri);
      }));
      const html = buildHtml(property, notes || [], imageMap);
      const fileNameSafe = property.name.replace(/[^a-z0-9\-]+/gi, "_").toLowerCase();
      const opts = { html, fileName: `${fileNameSafe}_${Date.now()}`, directory: "Documents" };
      const pdf = await RNHTMLtoPDF.convert(opts);
      if (!pdf.filePath) return Alert.alert("Failed", "Could not create PDF.");
      const destPath = RNFS.DownloadDirectoryPath + `/${property.name || "inspection"}_${Date.now()}.pdf`;
      await RNFS.copyFile(pdf.filePath, destPath);
      Alert.alert("PDF Saved", `Saved to Downloads:\n${destPath}`);
    } catch (e: any) {
      Alert.alert("PDF Error", e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Inspection Report</Text>
          <Text style={styles.subtitle}>Generated on {displayDate}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Property Details</Text>
          <Detail label="Name" value={property?.name || "-"} />
          {!!property?.address && <Detail label="Address" value={property.address} full />}
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>All Notes</Text>
          {notes?.length === 0 ? (
            <Text style={styles.empty}>No notes added.</Text>
          ) : (
            notes?.map((n, idx) => (
              <View  style={styles.noteCard}>
                <View style={styles.noteHead}>
                  <Text style={styles.noteInspector}>:silhouette: {n.inspector || "Inspector"}</Text>
                </View>
                <Text style={styles.noteDesc}>{n.description}</Text>
                {n.photos?.length ? (
                  <View style={styles.photoRow}>
                    {n.photos.map((p, i) => (
                      <TouchableOpacity key={i} onPress={() => setZoomImage(p)} activeOpacity={0.8}>
                        <Image source={{ uri: p }} style={styles.thumb} />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={generatePdf} disabled={busy}>
        {busy ? <ActivityIndicator /> : <Text style={styles.buttonText}>Download PDF</Text>}
      </TouchableOpacity>
      <Modal visible={!!zoomImage} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setZoomImage(null)}>
          <Image source={{ uri: zoomImage! }} style={styles.zoom} />
        </Pressable>
      </Modal>
    </View>
  );
}
function Detail({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <View style={[styles.detail, full && { flexBasis: "100%" }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  title: { color: colors.white, fontWeight: "800", fontSize: 18 },
  subtitle: { color: colors.white, opacity: 0.9, marginTop: 4, fontSize: 12 },
  card: {
    backgroundColor: colors.white,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: { color: colors.primary, fontWeight: "700", marginBottom: 6 },
  detail: { flexGrow: 1, flexBasis: "48%", marginBottom: 8 },
  detailLabel: { color: colors.primary, fontWeight: "600", fontSize: 12 },
  detailValue: { color: "#111", marginTop: 2, fontSize: 13 },
  empty: { color: "#6B7280", fontSize: 13 },
  noteCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  noteHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  noteInspector: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  noteDesc: { color: "#222", marginTop: 6, fontSize: 13 },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  thumb: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  button: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  zoom: { width: "90%", height: "70%", resizeMode: "contain" },
});