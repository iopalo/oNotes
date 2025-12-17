import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
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

function NotesScreen({ onShowComposer }) {
  const { notes, hydrated, addNote, updateNote, deleteNote, toggleTodo } = useNotes();
  const [editingNote, setEditingNote] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const { alerts, dismissAlert, clearAlerts } = useReminderNotifications(hydrated ? notes : []);

  const handleSubmit = (note) => {
    if (note.id) {
      updateNote(note);
      setEditingNote(null);
      setShowComposer(false);
      return;
    }
    const noteId = addNote(note);
    setEditingNote(null);
    setShowComposer(false);
    return noteId;
  };

  const memoizedNotes = useMemo(() => notes, [notes]);

  return (
    <View style={styles.tabContent}>
      <FlatList
        data={memoizedNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.listHeaderGap}>
            {showComposer || editingNote ? (
              <NoteForm
                initialNote={editingNote}
                onSubmit={handleSubmit}
                onCancelEdit={() => {
                  setEditingNote(null);
                  setShowComposer(false);
                }}
              />
            ) : null}

            <AlertsPanel alerts={alerts} onDismiss={dismissAlert} onClear={clearAlerts} />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleMain}>Notas guardadas</Text>
              <Pressable
                accessibilityLabel="Crear nota"
                style={styles.fabInline}
                onPress={() => {
                  setEditingNote(null);
                  setShowComposer(true);
                  onShowComposer?.();
                }}
              >
                <Text style={styles.fabInlineText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <NotesList
            note={item}
            onEdit={(note) => {
              setEditingNote(note);
              setShowComposer(true);
            }}
            onDelete={deleteNote}
            onToggleTodo={toggleTodo}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyMessage}>Aún no hay notas. Crea la primera para comenzar.</Text>
        )}
      />
    </View>
  );
}

function RemindersScreen() {
  const { notes, updateNote, addNote } = useNotes();
  const [showComposer, setShowComposer] = useState(false);

  const reminders = useMemo(() => {
    return notes
      .flatMap((note) => (note.reminders || []).map((reminder) => ({ ...reminder, note })))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [notes]);

  const removeReminder = (noteId, reminderId) => {
    const target = notes.find((note) => note.id === noteId);
    if (!target) return;
    updateNote({ ...target, reminders: (target.reminders || []).filter((r) => r.id !== reminderId) });
  };

  return (
    <View style={styles.tabContent}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.listHeaderGap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleMain}>Recordatorios</Text>
              <Pressable
                accessibilityLabel="Agregar recordatorio"
                style={styles.fabInline}
                onPress={() => setShowComposer((prev) => !prev)}
              >
                <Text style={styles.fabInlineText}>+</Text>
              </Pressable>
            </View>
            {showComposer ? (
              <NoteForm
                onSubmit={(note) => {
                  addNote(note);
                  setShowComposer(false);
                }}
                onCancelEdit={() => setShowComposer(false)}
              />
            ) : null}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.reminderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.note?.title || 'Sin título'}</Text>
              <Text style={styles.reminderTime}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <Pressable
              style={[styles.actionButton, styles.danger]}
              onPress={() => removeReminder(item.note.id, item.id)}
            >
              <Text style={[styles.actionText, styles.dangerText]}>Eliminar</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyMessage}>Sin recordatorios programados. Usa el botón + para añadir.</Text>
        )}
      />
    </View>
  );
}

function TabBar({ activeTab, onChange }) {
  return (
    <View style={styles.tabBar}>
      {[
        { key: 'notes', label: 'Notas' },
        { key: 'reminders', label: 'Recordatorios' },
      ].map((tab) => (
        <Pressable
          key={tab.key}
          style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>oNotes</Text>
        <Text style={styles.subtitle}>Notas con recordatorios locales para Android</Text>
      </View>
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'notes' ? <NotesScreen /> : <RemindersScreen />}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NotesProvider>
      <MainApp />
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    color: '#4b5563',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#111827',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 32,
    gap: 8,
  },
  listHeaderGap: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyMessage: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
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
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderTime: {
    color: '#4b5563',
    marginTop: 4,
  },
  fabInline: {
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabInlineText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: -2,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    maxHeight: '90%',
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    color: '#0f172a',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  danger: {
    backgroundColor: '#fee2e2',
  },
  actionText: {
    fontWeight: '600',
    color: '#0f172a',
  },
  dangerText: {
    color: '#b91c1c',
  },
});
