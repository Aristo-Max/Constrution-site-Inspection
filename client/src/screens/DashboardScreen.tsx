import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  FlatList,
} from 'react-native';
import colors from '../constants/color';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useProperty, Inspection } from '../components/PropertyContext';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;
type DashboardProps = { navigation: DashboardScreenNavigationProp };

const DashboardScreen = ({ navigation }: DashboardProps) => {
  const { inspections, loading, deleteInspection } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInspections = useMemo(() => {
    let filtered = inspections;
    if (statusFilter !== 'All') {
      const isInProgress = statusFilter === 'In Progress';
      filtered = filtered.filter(item =>
        isInProgress
          ? item.status === 'in progress' || item.status === 'In Progress'
          : item.status === 'Completed',
      );
    }
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [inspections, searchQuery, statusFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleDeleteInspection = (
    inspectionId: string,
    inspectionName: string,
  ) => {
    Alert.alert(
      'Delete Inspection',
      `Are you sure you want to delete "${inspectionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteInspection(inspectionId),
        },
      ],
    );
  };

  const renderFilterButton = (title: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        statusFilter === title && styles.filterButtonActive,
      ]}
      onPress={() => setStatusFilter(title)}
    >
      <Text
        style={[
          styles.filterButtonText,
          statusFilter === title && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderInspectionCard = ({ item }: { item: Inspection }) => (
    <View style={styles.inspectionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.inspectionTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('NewInspection', {
              inspectionId: item.id,
            })
          }
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.inspectionAddress} numberOfLines={1}>
        {item.address}
      </Text>
      <Text style={styles.meta}>
        Status:{' '}
        <Text
          style={
            item.status === 'Completed' ? styles.completed : styles.inProgress
          }
        >
          {item.status}
        </Text>
      </Text>
      <Text style={styles.meta}>
        {new Date(item.date).toLocaleDateString()} • {item.notes?.length ?? 0}{' '}
        notes
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('InspectionForm', {
              propertyId: item.id,
            })
          }
        >
          <Text style={styles.viewDetails}>Add / View Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteInspection(item.id, item.name)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {item.status === 'Completed' && (
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() =>
            navigation.navigate('ReportScreen', { property: item })
          }
        >
          <Text style={styles.reportText}>Generate Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* FIXED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspections</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('NewInspection')}
        >
          <Text style={styles.startButtonText}>+ New Inspection</Text>
        </TouchableOpacity>
      </View>

      {/* FIXED CONTROLS */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or address..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterGroup}>
          {renderFilterButton('All')}
          {renderFilterButton('In Progress')}
          {renderFilterButton('Completed')}
        </View>
      </View>

      {/* SCROLLABLE LIST */}
      <FlatList
        data={filteredInspections}
        renderItem={renderInspectionCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.noInspectionsText}>No inspections found.</Text>
        }
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  startButton: {
    position: 'absolute',
    right: 20,
    top: 45,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlsContainer: {
    padding: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: colors.tertiary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: colors.primary,
  },
  filterGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.tertiary,
  },
  filterButtonActive: {
    backgroundColor: colors.secondary,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: 15,
  },
  inspectionCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inspectionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  editText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  inspectionAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  inProgress: { color: colors.secondary, fontWeight: 'bold' },
  completed: { color: colors.success, fontWeight: 'bold' },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  viewDetails: { color: colors.secondary, fontWeight: 'bold', fontSize: 16 },
  deleteText: { color: colors.error, fontWeight: 'bold', fontSize: 16 },
  noInspectionsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
    fontStyle: 'italic',
  },
  reportBtn: {
    backgroundColor: colors.success,
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
