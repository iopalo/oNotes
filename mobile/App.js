import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NotesProvider, useNotes } from './src/state/NotesContext';
import NoteForm from './src/components/NoteForm';
import NotesList from './src/components/NotesList';
import { useReminderNotifications } from './src/hooks/useReminderNotifications';

function AlertsPanel({ alerts, onDismiss, onClear }) {
  if (!alerts.length) return null;
  return (
    <View style={styles.alertsContainer}>
      <View style={styles.alertsHeader}>
        <Text style={styles.sectionTitle}>Recordatorios activos</Text>
        <Text style={styles.clearText} onPress={onClear}>
          Limpiar todos
        </Text>
      </View>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alert}>
          <View>
            <Text style={styles.alertTitle}>{alert.title || 'Sin título'}</Text>
            <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleString()}</Text>
          </View>
          <Text style={styles.dismissText} onPress={() => onDismiss(alert.id)}>
            Cerrar
          </Text>
        </View>
      ))}
    </View>
  );
}

function NotesScreen() {
  const { notes, hydrated, addNote, updateNote, deleteNote } = useNotes();
  const [editingNote, setEditingNote] = useState(null);
  const { alerts, dismissAlert, clearAlerts } = useReminderNotifications(hydrated ? notes : []);

  const handleSubmit = (note) => {
    if (note.id) {
      updateNote(note);
      setEditingNote(null);
      return;
    }
    const noteId = addNote(note);
    setEditingNote(null);
    return noteId;
  };

  const memoizedNotes = useMemo(() => notes, [notes]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <NoteForm
        initialNote={editingNote}
        onSubmit={handleSubmit}
        onCancelEdit={() => setEditingNote(null)}
      />

      <AlertsPanel alerts={alerts} onDismiss={dismissAlert} onClear={clearAlerts} />

      <NotesList notes={memoizedNotes} onEdit={setEditingNote} onDelete={deleteNote} />
    </ScrollView>
  );
}

export default function App() {
  return (
    <NotesProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>oNotes</Text>
          <Text style={styles.subtitle}>Notas con recordatorios locales para Android</Text>
        </View>
        <NotesScreen />
      </SafeAreaView>
    </NotesProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  alertsContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#312e81',
  },
  clearText: {
    color: '#4338ca',
    fontWeight: '700',
  },
  alert: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d2fe',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertTitle: {
    fontWeight: '700',
    color: '#1f2937',
  },
  alertTime: {
    color: '#4b5563',
  },
  dismissText: {
    color: '#4338ca',
    fontWeight: '700',
  },
});
