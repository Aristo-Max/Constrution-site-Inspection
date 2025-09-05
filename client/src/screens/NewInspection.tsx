import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import colors from '../constants/color';
import { useProperty } from '../components/PropertyContext';

type NewInspectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NewInspection'
>;

type Props = {
  navigation: NewInspectionScreenNavigationProp;
};

const NewInspectionScreen = ({ navigation }: Props) => {
  const { addInspection } = useProperty(); // <-- GET addInspection FROM CONTEXT
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [siteInspector, setSiteInspector] = useState('');

  const isFormValid = useMemo(() => {
    return (
      propertyName.trim() !== '' &&
      propertyAddress.trim() !== '' &&
      siteInspector.trim() !== ''
    );
  }, [propertyName, propertyAddress, siteInspector]);

  const handleSaveInspection = async () => {
    if (!isFormValid) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    try {
      // Create the data object without id, date, status
      const newInspectionData = {
        name: propertyName,
        address: propertyAddress,
        inspector: siteInspector,
      };

      // Call the context function to add and save
      await addInspection(newInspectionData);

      Alert.alert('Success', 'Inspection has been saved.');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save inspection:', error);
      Alert.alert('Error', 'Failed to save the inspection.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Start New Inspection</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Enter the details below to create a new inspection report.
        </Text>

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
          onPress={handleSaveInspection}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Save Inspection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.tertiary,
  },
  header: {
    backgroundColor: colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 30,
    fontSize: 16,
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
    backgroundColor: '#fff',
    color: colors.primary,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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