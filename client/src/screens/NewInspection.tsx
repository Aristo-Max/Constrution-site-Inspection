// src/screens/NewInspection.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import colors from '../constants/color';
import { useProperty } from '../components/PropertyContext';

type Props = NativeStackScreenProps<RootStackParamList, 'NewInspection'>;

const NewInspectionScreen = ({ navigation, route }: Props) => {
  // ✅ CHECK FOR ID TO DETERMINE MODE (CREATE OR EDIT)
  const inspectionId = route.params?.inspectionId;
  const isEditMode = !!inspectionId;

  const { addInspection, updateInspection, inspections } = useProperty();

  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [siteInspector, setSiteInspector] = useState('');

  // ✅ IF IN EDIT MODE, LOAD THE EXISTING INSPECTION DATA
  useEffect(() => {
    if (isEditMode) {
      const existingInspection = inspections.find(
        insp => insp.id === inspectionId,
      );
      if (existingInspection) {
        setPropertyName(existingInspection.name);
        setPropertyAddress(existingInspection.address);
        setSiteInspector(existingInspection.inspector);
        navigation.setOptions({ title: 'Edit Inspection' }); // Update header title
      }
    } else {
      navigation.setOptions({ title: 'Start New Inspection' });
    }
  }, [inspectionId, inspections, navigation, isEditMode]);

  const isFormValid = useMemo(() => {
    return (
      propertyName.trim() !== '' &&
      propertyAddress.trim() !== '' &&
      siteInspector.trim() !== ''
    );
  }, [propertyName, propertyAddress, siteInspector]);

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    try {
      if (isEditMode) {
        // Find original inspection to preserve other details like notes and status
        const originalInspection = inspections.find(
          insp => insp.id === inspectionId,
        );
        if (originalInspection) {
          const updatedData = {
            ...originalInspection,
            name: propertyName,
            address: propertyAddress,
            inspector: siteInspector,
          };
          await updateInspection(updatedData);
          Alert.alert('Success', 'Inspection has been updated.');
        }
      } else {
        const newInspectionData = {
          name: propertyName,
          address: propertyAddress,
          inspector: siteInspector,
        };
        await addInspection(newInspectionData);
        Alert.alert('Success', 'Inspection has been saved.');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save inspection:', error);
      Alert.alert('Error', 'Failed to save the inspection.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.label}>Property Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Maple Street Lot 4B"
        placeholderTextColor={colors.textSecondary}
        value={propertyName}
        onChangeText={setPropertyName}
      />

      <Text style={styles.label}>Property Address / Location *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 123 Maple St, Anytown"
        placeholderTextColor={colors.textSecondary}
        value={propertyAddress}
        onChangeText={setPropertyAddress}
      />

      <Text style={styles.label}>Site Inspector *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., John Doe"
        placeholderTextColor={colors.textSecondary}
        value={siteInspector}
        onChangeText={setSiteInspector}
      />

      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!isFormValid}
      >
        {/* ✅ DYNAMIC BUTTON TEXT */}
        <Text style={styles.buttonText}>
          {isEditMode ? 'Update Inspection' : 'Save Inspection'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles have been slightly adjusted for better layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: colors.tertiary,
    color: colors.primary,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a9a9a9',
  },
});

export default NewInspectionScreen;
