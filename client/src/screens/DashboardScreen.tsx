import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/color';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type DashboardProps = {
  navigation: DashboardScreenNavigationProp;
};

// Define a type for our inspection objects and EXPORT it
export type Inspection = {
  id: string;
  name: string;
  address: string;
  inspector: string;
  status: string;
  date: string;
};

const DashboardScreen = ({ navigation }: DashboardProps) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const isFocused = useIsFocused();

  const loadInspections = async () => {
    try {
      const savedInspections = await AsyncStorage.getItem('inspections');
      if (savedInspections !== null) {
        setInspections(JSON.parse(savedInspections));
      } else {
        setInspections([]);
      }
    } catch (error) {
      console.error('Failed to load inspections.', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadInspections();
    }
  }, [isFocused]);

  const handleDelete = (inspectionId: string) => {
    Alert.alert(
      'Delete Inspection',
      'Are you sure you want to delete this inspection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            const updatedInspections = inspections.filter(
              item => item.id !== inspectionId,
            );
            setInspections(updatedInspections);
            await AsyncStorage.setItem(
              'inspections',
              JSON.stringify(updatedInspections),
            );
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>InspectVoice Pro</Text>
        <Text style={styles.headerSubtitle}>
          Professional property inspections with voice-to-text technology
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{inspections.length}</Text>
          <Text style={styles.statLabel}>Total Inspections</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {inspections.filter(item => item.status === 'In Progress').length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
      </View>

      {/* Recent Inspections - NOW DYNAMIC */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Inspections</Text>
        </View>

        {inspections.length > 0 ? (
          inspections.map(item => (
            <View key={item.id} style={styles.inspectionCard}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('InspectionForm', { inspection: item })
                }
              >
                <Text style={styles.inspectionTitle}>
                  {item.name}{' '}
                  <Text style={styles.inProgress}>{item.status}</Text>
                </Text>
                <Text style={styles.inspectionDate}>{item.date}</Text>
                <Text style={styles.meta}>{item.address}</Text>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('InspectionForm', { inspection: item })
                  }
                >
                  <Text style={styles.viewDetails}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noInspectionsText}>
            No inspections found. Create one to get started!
          </Text>
        )}
      </View>

      {/* Create Inspection Report Button */}
      <TouchableOpacity
        style={styles.newReportButton}
        onPress={() => navigation.navigate('NewInspection')}
      >
        <Text style={styles.newReportButtonText}>Create Inspection Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 10,
  },
  header: {
    backgroundColor: colors.secondary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E6E6E6',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statBox: {
    backgroundColor: colors.white,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  statLabel: {
    marginTop: 5,
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  inspectionCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  inspectionTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inProgress: {
    color: 'orange',
    fontWeight: '600',
  },
  inspectionDate: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.primary,
    marginVertical: 4,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  viewDetails: {
    color: colors.secondary,
    fontWeight: '600',
  },
  deleteText: {
    color: colors.error,
    fontWeight: '600',
  },
  newReportButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 3,
  },
  newReportButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noInspectionsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20,
    fontStyle: 'italic',
  },
});
