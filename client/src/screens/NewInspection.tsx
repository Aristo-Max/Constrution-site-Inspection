import React, { useState } from 'react';
import {
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
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- 1. IMPORT ASYNCSTORAGE

// Define the navigation props for this screen
type NewInspectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NewInspection'
>;

type Props = {
  navigation: NewInspectionScreenNavigationProp;
};

const NewInspectionScreen = ({ navigation }: Props) => {
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [siteInspector, setSiteInspector] = useState('');

  // 2. MAKE THE FUNCTION ASYNC
  const handleSaveInspection = async () => {
    // Basic validation
    if (!propertyName || !propertyAddress || !siteInspector) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    const newInspection = {
      id: Date.now().toString(), // A simple unique ID
      name: propertyName,
      address: propertyAddress,
      inspector: siteInspector,
      status: 'In Progress', // A more descriptive status
      date: new Date().toLocaleDateString(), // Capture the creation date
    };

    // 3. ADD THE SAVE LOGIC
    try {
      // First, get the existing inspections
      const existingInspections = await AsyncStorage.getItem('inspections');

      // If there are existing inspections, parse them. Otherwise, start with an empty array.
      const inspections = existingInspections
        ? JSON.parse(existingInspections)
        : [];

      // Add our new inspection to the list
      inspections.push(newInspection);

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem('inspections', JSON.stringify(inspections));

      Alert.alert('Success', 'Inspection has been saved.');

      // 4. NAVIGATE BACK TO THE DASHBOARD
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save inspection:', error);
      Alert.alert('Error', 'Failed to save the inspection.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Start New Inspection</Text>
        <Text style={styles.subtitle}>
          Enter the details below to create a new inspection report.
        </Text>

        {/* Property Name Input */}
        <Text style={styles.label}>Property Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Maple Street Lot 4B"
          placeholderTextColor={colors.textSecondary}
          value={propertyName}
          onChangeText={setPropertyName}
        />

        {/* Property Address Input */}
        <Text style={styles.label}>Property Address / Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 123 Maple St, Anytown"
          placeholderTextColor={colors.textSecondary}
          value={propertyAddress}
          onChangeText={setPropertyAddress}
        />

        {/* Site Inspector Input */}
        <Text style={styles.label}>Site Inspector</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., John Doe"
          placeholderTextColor={colors.textSecondary}
          value={siteInspector}
          onChangeText={setSiteInspector}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleSaveInspection}>
          <Text style={styles.buttonText}>Save Inspection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.primary,
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
    backgroundColor: '#f9f9f9',
    color: colors.primary,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary, // Changed to primary for consistency
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
});

export default NewInspectionScreen;
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../App'; // Adjust the path as necessary
// import colors from '../constants/color';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Define the navigation props for this screen
// type NewInspectionScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'NewInspection'
// >;

// type Props = {
//   navigation: NewInspectionScreenNavigationProp;
// };

// const NewInspectionScreen = ({ }: Props) => {
//   const [propertyName, setPropertyName] = useState('');
//   const [propertyAddress, setPropertyAddress] = useState('');
//   const [siteInspector, setSiteInspector] = useState('');

//   const handleSaveInspection = () => {
//     // Basic validation
//     if (!propertyName || !propertyAddress || !siteInspector) {
//       Alert.alert('Missing Information', 'Please fill out all fields.');
//       return;
//     }

//     const inspectionData = {
//       id: Date.now().toString(), // A simple unique ID
//       name: propertyName,
//       address: propertyAddress,
//       inspector: siteInspector,
//       status: 'pending',
//     };

//     console.log('Saving Inspection Data:', inspectionData);
//     // In a future step, we will save this data to AsyncStorage here.

//     // For now, just navigate back to the dashboard
//     // navigation.goBack();
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.title}>Start New Inspection</Text>
//         <Text style={styles.subtitle}>
//           Enter the details below to create a new inspection report.
//         </Text>

//         {/* Property Name Input */}
//         <Text style={styles.label}>Property Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g., Maple Street Lot 4B"
//           placeholderTextColor={colors.textSecondary}
//           value={propertyName}
//           onChangeText={setPropertyName}
//         />

//         {/* Property Address Input */}
//         <Text style={styles.label}>Property Address / Location</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g., 123 Maple St, Anytown"
//           placeholderTextColor={colors.textSecondary}
//           value={propertyAddress}
//           onChangeText={setPropertyAddress}
//         />

//         {/* Site Inspector Input */}
//         <Text style={styles.label}>Site Inspector</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="e.g., John Doe"
//           placeholderTextColor={colors.textSecondary}
//           value={siteInspector}
//           onChangeText={setSiteInspector}
//         />

//         {/* Save Button */}
//         <TouchableOpacity style={styles.button} onPress={handleSaveInspection}>
//           <Text style={styles.buttonText}>Save Inspection</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   container: {
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//     color: colors.primary,
//   },
//   subtitle: {
//     textAlign: 'center',
//     color: colors.textSecondary,
//     marginBottom: 30,
//     fontSize: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: colors.primary,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 20,
//     backgroundColor: '#f9f9f9',
//     color: colors.primary,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: colors.secondary,
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   buttonText: {
//     color: colors.white,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default NewInspectionScreen;
