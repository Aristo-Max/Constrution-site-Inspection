import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
// A single, consistent type for our inspections
export type NoteItem = {
  id: string; // Changed to string for consistency
  description: string;
  inspector: string;
  photos?: string[]; // optional array of image URIs
};
export type Inspection = {
  id: string;
  name: string;
  address: string;
  inspector: string;
  status: 'In Progress' | 'Completed' | 'in progress';
  date: string; // ISO Date string
  notes: NoteItem[]; // Notes array should not be optional
  code?: string;
};
type PropertyContextType = {
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id' | 'date' | 'status' | 'notes'>) => Promise<void>;
  updateInspection: (updatedInspection: Inspection) => Promise<void>;
  loading: boolean;
};
const PropertyContext = createContext<PropertyContextType | undefined>(undefined);
export const PropertyProvider = ({ children }: { children: React.ReactNode }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadInspectionsFromStorage = async () => {
      try {
        const savedInspections = await AsyncStorage.getItem('inspections');
        if (savedInspections !== null) {
          setInspections(JSON.parse(savedInspections));
        }
      } catch (e) {
        console.error("Failed to load inspections from storage", e);
      } finally {
        setLoading(false);
      }
    };
    loadInspectionsFromStorage();
  }, []);
  const saveToStorage = async (data: Inspection[]) => {
    await AsyncStorage.setItem('inspections', JSON.stringify(data));
  };
  const addInspection = async (newInspectionData: Omit<Inspection, 'id' | 'date' | 'status' | 'notes'>) => {
    const newInspection: Inspection = {
      ...newInspectionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'in progress',
      notes: [],
    };
    const updatedInspections = [...inspections, newInspection];
    setInspections(updatedInspections);
    await saveToStorage(updatedInspections);
  };
  const updateInspection = async (updatedInspection: Inspection) => {
    const updatedInspections = inspections.map(insp =>
      insp.id === updatedInspection.id ? updatedInspection : insp
    );
    setInspections(updatedInspections);
    await saveToStorage(updatedInspections);
  };
  return (
    <PropertyContext.Provider value={{ inspections, addInspection, updateInspection, loading }}>
      {children}
    </PropertyContext.Provider>
  );
};
export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};