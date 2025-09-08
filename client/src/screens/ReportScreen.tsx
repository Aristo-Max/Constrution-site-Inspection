// import React, { useMemo, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   AppState,
//   // PermissionsAndroid,
//   // Platform,
// } from 'react-native';
// import * as RNHTMLtoPDF from 'react-native-html-to-pdf';
// import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
// import { WebView } from 'react-native-webview';
// import colors from '../constants/color';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../App';
// import { NoteItem, Inspection } from '../components/PropertyContext';

// type ReportScreenProps = NativeStackScreenProps<
//   RootStackParamList,
//   'ReportScreen'
// >;

// export default function ReportScreen({ route }: ReportScreenProps) {
//   const { property } = route.params;
//   const [busy, setBusy] = useState(false);

//   // ✅ NEW STATE TO HOLD THE HTML FOR THE PREVIEW
//   const [htmlContent, setHtmlContent] = useState<string>('');
//   const [isHtmlLoading, setIsHtmlLoading] = useState(true);

//   const displayDate = useMemo(() => {
//     return new Date(property.date).toLocaleString([], {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   }, [property.date]);

//   const toBase64IfNeeded = async (uri: string) => {
//     try {
//       const path = uri.replace('file://', '');
//       const b64 = await RNFS.readFile(path, 'base64');
//       return `data:image/jpeg;base64,${b64}`;
//     } catch {
//       return uri;
//     }
//   };

//   const buildHtml = React.useCallback((
//     p: Inspection,
//     ns: NoteItem[],
//     imageMap: Record<string, string>,
//   ) => {
//     const css = `
//       @page { margin: 40px; }
//       body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.6; }
//       .header { text-align: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 10px; margin-bottom: 30px; }
//       .report-title { font-size: 24pt; font-weight: bold; color: ${colors.primary}; margin: 0; }
//       .summary-section { background-color: #f7f9fc; border: 1px solid #e1e8ed; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
//       .summary-title { font-size: 16pt; font-weight: bold; color: ${colors.primary}; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e1e8ed; padding-bottom: 10px; }
//       .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
//       .detail-item strong { color: #555; }
//       .notes-title { font-size: 16pt; font-weight: bold; color: ${colors.primary}; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e1e8ed; padding-bottom: 10px; }
//       .note-card { border: 1px solid #e1e8ed; border-radius: 8px; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
//       .note-description { white-space: pre-wrap; margin-bottom: 15px; }
//       .photo-grid { display: flex; flex-wrap: wrap; gap: 10px; }
//       .thumb { width: 120px; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
//       .photo-label { font-weight: bold; color: #555; margin-bottom: 5px; }
//     `;

//     const summaryHtml = `
//       <div class="summary-section">
//         <h2 class="summary-title">Inspection Summary</h2>
//         <div class="summary-grid">
//           <div class="detail-item"><strong>Property:</strong> ${
//             p.name || '-'
//           }</div>
//           <div class="detail-item"><strong>Address:</strong> ${
//             p.address || '-'
//           }</div>
//           <div class="detail-item"><strong>Inspector:</strong> ${
//             p.inspector || '-'
//           }</div>
//           <div class="detail-item"><strong>Date:</strong> ${displayDate}</div>
//         </div>
//       </div>`;

//     const notesHtml = (p.notes || [])
//       .map((n, idx) => {
//         const imagesHtml = (n.photos || [])
//           .map(uri => `<img class="thumb" src="${imageMap[uri] || uri}" />`)
//           .join('');
//         return `
//         <div class="note-card">
//           <strong>Note #${idx + 1}</strong>
//           <p class="note-description">${n.description || ''}</p>
//           ${
//             imagesHtml
//               ? `<div><div class="photo-label">Attached Photos:</div><div class="photo-grid">${imagesHtml}</div></div>`
//               : ''
//           }
//         </div>`;
//       })
//       .join('');

//     return `<html><head><style>${css}</style></head><body><div class="header"><h1 class="report-title">Inspection Report</h1></div>${summaryHtml}<div><h2 class="notes-title">Observations & Notes</h2>${
//       notesHtml || `<p>No notes were recorded.</p>`
//     }</div></body></html>`;
//   },[displayDate]);

//   // ✅ USEEFFECT TO GENERATE THE HTML FOR PREVIEW WHEN THE SCREEN LOADS
//   useEffect(() => {
//     const generatePreview = async () => {
//       setIsHtmlLoading(true);
//       const imageMap: Record<string, string> = {};
//       const allPhotos = property.notes?.flatMap(n => n.photos || []) ?? [];
//       await Promise.all(
//         allPhotos.map(async uri => {
//           imageMap[uri] = await toBase64IfNeeded(uri);
//         }),
//       );
//       const content = buildHtml(property, property.notes || [], imageMap);
//       setHtmlContent(content);
//       setIsHtmlLoading(false);
//     };

//     generatePreview();
//   }, [buildHtml, property]);

//   // ✅ UPDATED FUNCTION TO HANDLE PDF GENERATION AND SHARING
//   const generateAndSharePdf = async () => {
//     try {
//       // if (Platform.OS === 'android') {
//       //   const granted = await PermissionsAndroid.request(
//       //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//       //     {
//       //       title: 'Storage Permission Required',
//       //       message:
//       //         'App needs access to your storage to download the PDF report.',
//       //       buttonPositive: 'OK',
//       //     },
//       //   );
//       //   if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//       //     Alert.alert(
//       //       'Permission Denied',
//       //       'Cannot save file without storage permission.',
//       //     );
//       //     return;
//       //   }
//       // }

//       setBusy(true);
//       const fileNameSafe = property.name
//         .replace(/[^a-z0-9\-]+/gi, '_')
//         .toLowerCase();
//       const opts = {
//         html: htmlContent,
//         fileName: fileNameSafe,
//         directory: 'Documents',
//       };
      
//       const pdf = await RNHTMLtoPDF.default.convert(opts);
//       if (!pdf.filePath) {
//         throw new Error('Could not create PDF file.');
//       }

//       const shareOptions = {
//         title: 'Share Inspection Report',
//         message: `Here is the inspection report for ${property.name}.`,
//         url: `file://${pdf.filePath}`,
//         type: 'application/pdf',
//         failOnCancel: false,
//       };

//       await Share.open(shareOptions);
//     } catch (error: any) {
//       if (AppState.currentState === 'active') {
//         Alert.alert('Error', error.message || 'An unexpected error occurred.');
//       } else {
//         // If the app is in the background, just log the error for debugging
//         console.error(
//           'PDF generation/share error while app not active:',
//           error,
//         );
//       }
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.previewContainer}>
//         {isHtmlLoading ? (
//           <ActivityIndicator size="large" style={{ marginTop: 40 }} />
//         ) : (
//           // ✅ WEBVIEW TO RENDER THE HTML PREVIEW
//           <WebView
//             originWhitelist={['*']}
//             source={{ html: htmlContent }}
//             style={styles.webview}
//           />
//         )}
//       </View>
//       <TouchableOpacity
//         style={styles.button}
//         onPress={generateAndSharePdf}
//         disabled={busy}
//       >
//         {busy ? (
//           <ActivityIndicator color={colors.white} />
//         ) : (
//           <Text style={styles.buttonText}>Download / Share Report</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   previewContainer: {
//     flex: 1,
//     padding: 10,
//   },
//   webview: {
//     flex: 1,
//   },
//   button: {
//     backgroundColor: colors.secondary,
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//     elevation: 3,
//     margin: 16,
//   },
//   buttonText: {
//     color: colors.white,
//     fontWeight: '800',
//     fontSize: 16,
//   },
// });

// src/screens/ReportScreen.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import colors from '../constants/color';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { NoteItem, Inspection } from '../components/PropertyContext';

type ReportScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ReportScreen'
>;

export default function ReportScreen({ route }: ReportScreenProps) {
  const { property } = route.params;
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isHtmlLoading, setIsHtmlLoading] = useState(true);

  const displayDate = useMemo(
    () =>
      new Date(property.date).toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [property.date],
  );

  const toBase64IfNeeded = async (uri: string) => {
    try {
      const path = uri.replace('file://', '');
      const b64 = await RNFS.readFile(path, 'base64');
      return `data:image/jpeg;base64,${b64}`;
    } catch {
      return uri;
    }
  };

  const buildHtml = useCallback(
    (p: Inspection, ns: NoteItem[], imageMap: Record<string, string>) => {
      const css = `
        @page { margin: 20px; }
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.6; padding: 10px; }
        .header { text-align: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 10px; margin-bottom: 30px; }
        .report-title { font-size: 24pt; font-weight: bold; color: ${colors.primary}; margin: 0; }
        .summary-section { background-color: #f7f9fc; border: 1px solid #e1e8ed; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .summary-title { font-size: 16pt; font-weight: bold; color: ${colors.primary}; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e1e8ed; padding-bottom: 10px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .detail-item strong { color: #555; }
        .notes-title { font-size: 16pt; font-weight: bold; color: ${colors.primary}; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e1e8ed; padding-bottom: 10px; }
        .note-card { border: 1px solid #e1e8ed; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .note-description { white-space: pre-wrap; margin-bottom: 15px; }
        .photo-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .thumb { width: 120px; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
        .photo-label { font-weight: bold; color: #555; margin-bottom: 5px; }
      `;
      const summaryHtml = `<div class="summary-section"><h2 class="summary-title">Inspection Summary</h2><div class="summary-grid"><div class="detail-item"><strong>Property:</strong> ${
        p.name || '-'
      }</div><div class="detail-item"><strong>Address:</strong> ${
        p.address || '-'
      }</div><div class="detail-item"><strong>Inspector:</strong> ${
        p.inspector || '-'
      }</div><div class="detail-item"><strong>Date:</strong> ${displayDate}</div></div></div>`;
      const notesHtml = (ns || [])
        .map((n, idx) => {
          const imagesHtml = (n.photos || [])
            .map(uri => `<img class="thumb" src="${imageMap[uri] || uri}" />`)
            .join('');
          return `<div class="note-card"><strong>Note #${
            idx + 1
          }</strong><p class="note-description">${n.description || ''}</p>${
            imagesHtml
              ? `<div><div class="photo-label">Attached Photos:</div><div class="photo-grid">${imagesHtml}</div></div>`
              : ''
          }</div>`;
        })
        .join('');
      return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${css}</style></head><body><div class="header"><h1 class="report-title">Inspection Report</h1></div>${summaryHtml}<div><h2 class="notes-title">Observations & Notes</h2>${
        notesHtml || `<p>No notes were recorded.</p>`
      }</div></body></html>`;
    },
    [displayDate],
  );

  useEffect(() => {
    const generatePreview = async () => {
      setIsHtmlLoading(true);
      const imageMap: Record<string, string> = {};
      const allPhotos = property.notes?.flatMap(n => n.photos || []) ?? [];
      await Promise.all(
        allPhotos.map(async uri => {
          imageMap[uri] = await toBase64IfNeeded(uri);
        }),
      );
      const content = buildHtml(property, property.notes || [], imageMap);
      setHtmlContent(content);
      setIsHtmlLoading(false);
    };

    generatePreview();
  }, [property, buildHtml]);

  return (
    <View style={styles.container}>
      {isHtmlLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});