import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import colors from "../constants/color";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the path as necessary
import { useProperty } from "../components/PropertyContext";

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type DashboardProps = {
  navigation: DashboardScreenNavigationProp;
};

// export type NoteItem = {
//   id: number;
//   description: string;
//   inspector: string;
//   photos: string[];
// };

// export type PropertyDetails = {
//   id: string;
//   code: string;
//   name: string;
//   address?: string;
//   status: "completed" | "in progress";
//   date: string;
//   notes: NoteItem[];
// };

const DashboardScreen = ({ navigation }: DashboardProps) => {
  //   const route = useRoute<RouteProp<RootStackParamList, "Dashboard">>(); // 👈 define route here

  // const { properties, setProperties } = useProperty();

    const { inspections, loading } = useProperty();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
//   useEffect(() => {
//   if (route.params?.updatedNote && route.params?.propertyId) {
//     const { updatedNote, propertyId } = route.params;

//     setProperties(prev =>
//       prev.map(p =>
//         p.id === propertyId
//           ? { ...p, notes: [...p.notes, updatedNote] } // ✅ updatedNote is guaranteed
//           : p
//       )
//     );
//   }
// }, [route.params]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>InspectVoice Pro</Text>
        <Text style={styles.headerSubtitle}>
          Professional property inspections with voice-to-text technology
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('NewInspection')}>
          <Text style={styles.startButtonText}>+ Start New Inspection</Text>
        </TouchableOpacity>
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
          inspections.map((item)  => (
          <View style={styles.inspectionCard}>
            <Text style={styles.inspectionTitle}>
              {item.name} <Text style={item.status === 'Completed' ? styles.completed : styles.inProgress}>
                {item.status}
              </Text>
            </Text>
            <Text style={styles.inspectionDate}>{item.date}</Text>
              <Text>
        {item.notes?.length ?? 0} notes •{" "}
        {item.notes?.reduce((acc, note) => acc + (note.photos?.length ?? 0), 0) ?? 0} photos
      </Text>
             <TouchableOpacity onPress={() => navigation.replace("InspectionForm", {
              propertyId: item.id,
              properties: inspections,
            })}>
              <Text style={styles.viewDetails}>View / Add Notes</Text>
            </TouchableOpacity>

            
        {/* Show Generate Report button ONLY for completed */}
        {item.status === 'Completed' && (
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => navigation.navigate("ReportScreen", {
                  property: item,
                  notes:  item.notes ?? [],
                })}
          >
            <Text style={styles.reportText}>Generate Report</Text>
          </TouchableOpacity>
        )}
          </View>
        ))
        ) : null}
     
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
   reportBtn: {
    backgroundColor: '#FF8C00',
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  reportText: { color: 'white', fontWeight: 'bold' },
});
