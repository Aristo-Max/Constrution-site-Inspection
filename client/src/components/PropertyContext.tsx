// src/components/PropertyContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NoteItem = {
  id: string;
  description: string;
  inspector: string;
  photos?: string[];
};

export type Inspection = {
  id: string;
  name: string;
  address: string;
  inspector: string;
  status: 'In Progress' | 'Completed' | 'in progress';
  date: string;
  notes: NoteItem[];
  code?: string;
};

type PropertyContextType = {
  inspections: Inspection[];
  addInspection: (
    inspection: Omit<Inspection, 'id' | 'date' | 'status' | 'notes'>,
  ) => Promise<void>;
  updateInspection: (updatedInspection: Inspection) => Promise<void>;
  deleteInspection: (inspectionId: string) => Promise<void>;
  updateNote: (inspectionId: string, updatedNote: NoteItem) => Promise<void>; // ✅ ADDED
  deleteNote: (inspectionId: string, noteId: string) => Promise<void>; // ✅ ADDED
  loading: boolean;
};

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined,
);

export const PropertyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
        console.error('Failed to load inspections from storage', e);
      } finally {
        setLoading(false);
      }
    };
    loadInspectionsFromStorage();
  }, []);

  const saveToStorage = async (data: Inspection[]) => {
    await AsyncStorage.setItem('inspections', JSON.stringify(data));
  };

  const addInspection = async (
    newInspectionData: Omit<Inspection, 'id' | 'date' | 'status' | 'notes'>,
  ) => {
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
      insp.id === updatedInspection.id ? updatedInspection : insp,
    );
    setInspections(updatedInspections);
    await saveToStorage(updatedInspections);
  };

  const deleteInspection = async (inspectionId: string) => {
    const updatedInspections = inspections.filter(
      inspection => inspection.id !== inspectionId,
    );
    setInspections(updatedInspections);
    await saveToStorage(updatedInspections);
  };

  // ✅ NEW FUNCTION TO UPDATE A SINGLE NOTE
  const updateNote = async (inspectionId: string, updatedNote: NoteItem) => {
    const updatedInspections = inspections.map(inspection => {
      if (inspection.id === inspectionId) {
        const updatedNotes = inspection.notes.map(note =>
          note.id === updatedNote.id ? updatedNote : note,
        );
        return { ...inspection, notes: updatedNotes };
      }
      return inspection;
    });
    setInspections(updatedInspections);
    await saveToStorage(updatedInspections);
  };

  // ✅ NEW FUNCTION TO DELETE A SINGLE NOTE
  const deleteNote = async (inspectionId: string, noteId: string) => {
    const updatedInspections = inspections.map(inspection => {
      if (inspection.id === inspectionId) {
        const filteredNotes = inspection.notes.filter(
          note => note.id !== noteId,
        );
        return { ...inspection, notes: filteredNotes };
      }
      return inspection;
    });
    setInspections(updatedInspections);
    await saveToStorage(updatedInspections);
  };

  return (
    <PropertyContext.Provider
      value={{
        inspections,
        addInspection,
        updateInspection,
        deleteInspection,
        updateNote,
        deleteNote,
        loading,
      }}
    >
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
