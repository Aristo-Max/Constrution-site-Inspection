import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  Pressable,
  PermissionsAndroid,
  PanResponder,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import colors from '../constants/color';
import Voice from '@react-native-voice/voice';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
  useProperty,
  NoteItem,
  Inspection,
} from '../components/PropertyContext';

type InspectionFormProps = NativeStackScreenProps<
  RootStackParamList,
  'InspectionForm'
>;

export default function InspectionForm({
  navigation,
  route,
}: InspectionFormProps) {
  const propertyId = route.params?.propertyId;
  const { inspections, updateInspection, updateNote, deleteNote } =
    useProperty();
  const [property, setProperty] = useState<Inspection | undefined>(undefined);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const [isNotesVisible, setIsNotesVisible] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [inputHeight, setInputHeight] = useState(100);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const newHeight = inputHeight + gestureState.dy;
        const clampedHeight = Math.max(100, Math.min(300, newHeight));
        setInputHeight(clampedHeight);
      },
    }),
  ).current;

  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  useEffect(() => {
    const foundProperty = inspections.find(p => p.id === propertyId);
    setProperty(foundProperty);
  }, [propertyId, inspections]);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechResults = event => {
      const results = event.value;
      if (results && results.length > 0) {
        setNoteText(prev => (prev ? prev + ' ' : '') + results[0]);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleEditNote = (note: NoteItem) => {
    setEditingNote(note);
    setNoteText(note.description);
    setPhotos(note.photos || []);
    setIsNotesVisible(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setNoteText('');
    setPhotos([]);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!propertyId) return;
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(propertyId, noteId),
      },
    ]);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !property) return;
    if (editingNote) {
      const updatedNote = { ...editingNote, description: noteText, photos };
      await updateNote(property.id, updatedNote);
    } else {
      const newNote: NoteItem = {
        id: Date.now().toString(),
        description: noteText,
        inspector: property.inspector,
        photos: [...photos],
      };
      const updatedProperty = {
        ...property,
        notes: [...property.notes, newNote],
      };
      await updateInspection(updatedProperty);
    }
    cancelEdit();
  };

  const handleTakePhoto = async () => {
    if (!cameraActive) {
      const cameraPermission = await Camera.requestCameraPermission();
      if (cameraPermission !== 'granted')
        return Alert.alert('Camera permission denied');
      setCameraActive(true);
      setIsNotesVisible(false); // Close notes when camera opens
      return;
    }
    if (!camera.current) return;
    try {
      const photo = await camera.current.takePhoto();
      setPhotos(prev => [...prev, 'file://' + photo.path]);
    } catch (e) {
      console.error(e);
    } finally {
      setCameraActive(false);
    }
  };

  const startRecording = async () => {
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };
  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };
  const handleCompleteInspection = async () => {
    if (!property) return;
    const updatedProperty = { ...property, status: 'Completed' as const };
    await updateInspection(updatedProperty);
    Alert.alert('Inspection Completed');
    navigation.goBack();
  };

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setIsNotesVisible(!isNotesVisible)}
        >
          <Text style={styles.label}>
            Existing Notes ({property.notes.length})
          </Text>
          <Text style={styles.arrow}>{isNotesVisible ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isNotesVisible && (
          <View style={styles.notesContainer}>
            {property.notes.length > 0 ? (
              property.notes.map((n: NoteItem) => (
                <View key={n.id} style={styles.noteCard}>
                  <Text style={styles.noteDesc}>{n.description}</Text>
                  {n.photos && n.photos.length > 0 && (
                    <View style={styles.notePhotosRow}>
                      {n.photos.map((p, i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => setZoomImage(p)}
                        >
                          <Image source={{ uri: p }} style={styles.notePhoto} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={styles.noteActions}>
                    <TouchableOpacity onPress={() => handleEditNote(n)}>
                      <Text style={styles.editNoteText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteNote(n.id)}>
                      <Text style={styles.deleteNoteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noNotesText}>
                No notes have been added yet.
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </Text>
        <TouchableOpacity
          style={styles.recordBtn}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordIcon}>{isRecording ? '■' : '🎤'}</Text>
        </TouchableOpacity>

        <View style={styles.resizableInputContainer}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            placeholder="Type notes or use voice-to-text..."
            multiline
            value={noteText}
            onChangeText={setNoteText}
            onFocus={() => setIsNotesVisible(false)}
            scrollEnabled={true}
          />
          <View
            style={styles.dragHandleContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandle} />
          </View>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <Text style={styles.subLabel}>Photos ({photos.length})</Text>
          </View>
          {cameraActive && device != null ? (
            <Camera
              ref={camera}
              style={styles.cameraPreview}
              device={device}
              isActive={true}
              photo={true}
            />
          ) : (
            <View style={styles.photoRow}>
              {photos.map((p, i) => (
                <View key={i}>
                  <Image source={{ uri: p }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setPhotos(photos.filter(ph => ph !== p))}
                  >
                    <Text style={styles.removePhotoText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
            <Text style={styles.photoBtnText}>
              {cameraActive ? '📸 Capture Now' : 'Open Camera'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formActions}>
          {editingNote && (
            <TouchableOpacity
              style={[styles.addBtn, styles.cancelBtn]}
              onPress={cancelEdit}
            >
              <Text style={styles.addBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addBtn} onPress={handleSaveNote}>
            <Text style={styles.addBtnText}>
              {editingNote ? 'Update Note' : 'Save Note'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleCompleteInspection}
      >
        <Text style={styles.saveBtnText}>Complete Inspection</Text>
      </TouchableOpacity>

      <Modal
        visible={!!zoomImage}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomImage(null)}
      >
        <Pressable style={styles.modalBg} onPress={() => setZoomImage(null)}>
          <Image source={{ uri: zoomImage! }} style={styles.zoom} />
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 10 },
  card: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  subLabel: { fontSize: 14, fontWeight: '600', color: colors.primary },
  arrow: { fontSize: 18, color: colors.primary },
  notesContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  noteDesc: { fontSize: 14, color: '#333', marginBottom: 8 },
  notePhotosRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  notePhoto: { width: 50, height: 50, borderRadius: 6, marginRight: 6 },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 4,
  },
  editNoteText: { color: colors.primary, fontWeight: '600' },
  deleteNoteText: { color: colors.error, fontWeight: '600' },
  noNotesText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginVertical: 10,
  },
  recordBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  recordIcon: { fontSize: 24, color: colors.white },
  resizableInputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  dragHandleContainer: {
    height: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.tertiary,
  },
  photoSection: { marginTop: 15 },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -5,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: { color: 'white', fontWeight: 'bold' },
  cameraPreview: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: colors.tertiary,
    marginBottom: 10,
  },
  photoBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  photoBtnText: { color: colors.white, fontWeight: '600' },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
  },
  addBtn: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  cancelBtn: { backgroundColor: colors.textSecondary },
  saveBtn: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoom: { width: '90%', height: '70%', resizeMode: 'contain' },
});
