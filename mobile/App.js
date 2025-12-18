import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable, FlatList, Switch } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { NotesProvider, useNotes } from './src/state/NotesContext';
import { ThemeProvider, useThemeMode } from './src/state/ThemeContext';
import NoteForm from './src/components/NoteForm';
import NotesList from './src/components/NotesList';
import StandaloneReminderForm from './src/components/StandaloneReminderForm';
import { useReminderNotifications } from './src/hooks/useReminderNotifications';

function AlertsPanel({ alerts, onDismiss, onClear, styles }) {
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

function NotesScreen({ onShowComposer, styles, colors }) {
  const { notes, reminders, hydrated, addNote, updateNote, deleteNote, toggleTodo, customOrder, setCustomOrder } =
    useNotes();
  const [editingNote, setEditingNote] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [sortMode, setSortMode] = useState('created');
  const [folderFilter, setFolderFilter] = useState('all');
  const { alerts, dismissAlert, clearAlerts } = useReminderNotifications(
    hydrated ? notes : [],
    hydrated ? reminders : []
  );

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

  const folders = useMemo(() => {
    const set = new Set(notes.map((n) => n.folder || 'General'));
    return ['all', ...Array.from(set)];
  }, [notes]);

  const normalizedNotes = useMemo(
    () => notes.map((n) => ({ ...n, createdAt: n.createdAt || Date.now() })),
    [notes]
  );

  const filteredNotes = useMemo(
    () =>
      folderFilter === 'all'
        ? normalizedNotes
        : normalizedNotes.filter((n) => (n.folder || 'General') === folderFilter),
    [folderFilter, normalizedNotes]
  );

  const memoizedNotes = useMemo(() => {
    if (sortMode === 'alpha' || sortMode === 'created') {
      const sorter =
        sortMode === 'alpha'
          ? (a, b) => (a.title || '').localeCompare(b.title || '')
          : (a, b) => (a.createdAt || 0) - (b.createdAt || 0);
      return filteredNotes.slice().sort(sorter);
    }

    const map = new Map(filteredNotes.map((note) => [note.id, note]));
    const baseOrder = (customOrder && customOrder.length ? customOrder : normalizedNotes.map((n) => n.id)).filter((
      id
    ) => map.has(id));
    const ordered = [];

    baseOrder.forEach((id) => {
      const note = map.get(id);
      if (!note) return;
      ordered.push(note);
      map.delete(id);
    });

    map.forEach((note) => ordered.push(note));
    return ordered;
  }, [customOrder, filteredNotes, normalizedNotes, sortMode]);

  const handleCustomOrder = (orderedVisible) => {
    const visibleIds = orderedVisible.map((item) => item.id);
    const replacementQueue = [...visibleIds];
    const visibleSet = new Set(visibleIds);

    const merged = (customOrder.length ? customOrder : normalizedNotes.map((note) => note.id)).map((id) =>
      visibleSet.has(id) ? replacementQueue.shift() : id
    );

    normalizedNotes.forEach((note) => {
      if (!merged.includes(note.id)) merged.push(note.id);
    });

    setCustomOrder(merged);
  };

  const handleResize = (noteId, direction) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const sizes = ['s', 'm', 'l'];
    const currentIndex = sizes.indexOf(note.size || 'm');
    const nextIndex = direction === 'increase' ? Math.min(currentIndex + 1, sizes.length - 1) : Math.max(currentIndex - 1, 0);
    if (currentIndex === nextIndex) return;
    updateNote({ ...note, size: sizes[nextIndex] });
  };

  const renderHeader = () => (
    <View style={styles.listHeaderGap}>
      <View style={styles.filterRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Ordenar</Text>
          <View style={styles.filterChips}>
            {[
              { key: 'created', label: 'Creación' },
              { key: 'alpha', label: 'A-Z' },
              { key: 'custom', label: 'Personalizado' },
            ].map((opt) => (
              <Pressable
                key={opt.key}
                style={[styles.chip, sortMode === opt.key && styles.chipActive]}
                onPress={() => setSortMode(opt.key)}
              >
                <Text style={[styles.chipText, sortMode === opt.key && styles.chipTextActive]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Carpeta</Text>
          <View style={styles.filterChips}>
            {folders.map((folder) => (
              <Pressable
                key={folder}
                style={[styles.chip, folderFilter === folder && styles.chipActive]}
                onPress={() => setFolderFilter(folder)}
              >
                <Text style={[styles.chipText, folderFilter === folder && styles.chipTextActive]}>
                  {folder === 'all' ? 'Todas' : folder}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {showComposer || editingNote ? (
        <NoteForm
          initialNote={editingNote}
          onSubmit={handleSubmit}
          onCancelEdit={() => {
            setEditingNote(null);
            setShowComposer(false);
          }}
          colors={colors}
        />
      ) : null}

      <AlertsPanel alerts={alerts} onDismiss={dismissAlert} onClear={clearAlerts} styles={styles} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleMain}>Notas</Text>
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
  );

  return (
    <View style={styles.tabContent}>
      {sortMode === 'custom' ? (
        <DraggableFlatList
          data={memoizedNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.masonryRow}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index, drag, isActive }) => (
            <NotesList
              note={item}
              index={index}
              onEdit={(note) => {
                setEditingNote(note);
                setShowComposer(true);
              }}
              onDelete={deleteNote}
              onToggleTodo={toggleTodo}
              colors={colors}
              onResize={handleResize}
              onDrag={drag}
              customMode
              isActive={isActive}
            />
          )}
          onDragEnd={({ data }) => handleCustomOrder(data)}
          ListEmptyComponent={() => (
            <Text style={styles.emptyMessage}>Aún no hay notas. Crea la primera para comenzar.</Text>
          )}
        />
      ) : (
        <FlatList
          data={memoizedNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.masonryRow}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <NotesList
              note={item}
              index={index}
              onEdit={(note) => {
                setEditingNote(note);
                setShowComposer(true);
              }}
              onDelete={deleteNote}
              onToggleTodo={toggleTodo}
              colors={colors}
              onResize={handleResize}
            />
          )}
          ListEmptyComponent={() => (
            <Text style={styles.emptyMessage}>Aún no hay notas. Crea la primera para comenzar.</Text>
          )}
        />
      )}
    </View>
  );
}

function RemindersScreen({ styles, colors }) {
  const { notes, reminders, addReminder, deleteReminder, updateNote } = useNotes();
  const [showComposer, setShowComposer] = useState(false);

  const reminderItems = useMemo(() => {
    const noteReminders = notes.flatMap((note) =>
      (note.reminders || []).map((reminder) => ({
        ...reminder,
        type: 'note',
        note,
        id: reminder.id,
        title: note.title,
      }))
    );

    const standalone = reminders.map((reminder) => ({
      ...reminder,
      type: 'standalone',
    }));

    return [...standalone, ...noteReminders].sort((a, b) => a.timestamp - b.timestamp);
  }, [notes, reminders]);

  const removeReminder = (item) => {
    if (item.type === 'standalone') {
      deleteReminder(item.id);
      return;
    }

    const target = notes.find((note) => note.id === item.note?.id);
    if (!target) return;
    updateNote({ ...target, reminders: (target.reminders || []).filter((r) => r.id !== item.id) });
  };

  return (
    <View style={styles.tabContent}>
      <FlatList
        data={reminderItems}
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
              <StandaloneReminderForm
                onSubmit={(reminder) => {
                  addReminder(reminder);
                  setShowComposer(false);
                }}
                colors={colors}
              />
            ) : null}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.reminderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title || 'Sin título'}</Text>
              <Text style={styles.reminderTime}>{new Date(item.timestamp).toLocaleString()}</Text>
              {item.body ? <Text style={styles.reminderNote}>{item.body}</Text> : null}
              {item.type === 'note' && item.note?.title ? (
                <Text style={styles.reminderNote}>Nota: {item.note.title}</Text>
              ) : null}
            </View>
            <Pressable
              style={[styles.actionButton, styles.danger]}
              onPress={() => removeReminder(item)}
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

function TabBar({ activeTab, onChange, styles }) {
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

function SettingsDrawer({ visible, onClose, onToggleTheme, theme, styles }) {
  if (!visible) return null;
  return (
    <Pressable style={styles.drawerOverlay} onPress={onClose}>
      <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation?.()}>
        <Text style={styles.drawerTitle}>Menú</Text>
        <View style={styles.drawerItem}>
          <Text style={styles.drawerLabel}>Settings</Text>
        </View>
        <View style={styles.drawerItem}>
          <Text style={styles.drawerLabel}>Modo oscuro</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={onToggleTheme}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor={theme === 'dark' ? '#0b1221' : '#ffffff'}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('notes');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors, theme, toggleTheme } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleBackgroundPress = () => {
    if (drawerOpen) setDrawerOpen(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <Pressable style={styles.appShell} onPress={handleBackgroundPress} disabled={!drawerOpen}>
        <View style={styles.headerRow}>
          <Pressable style={styles.menuButton} onPress={() => setDrawerOpen(true)}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>oNotes</Text>
            <Text style={styles.subtitle}>Notas con recordatorios locales para Android</Text>
          </View>
        </View>
        <TabBar
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setDrawerOpen(false);
          }}
          styles={styles}
        />
        {activeTab === 'notes' ? (
          <NotesScreen styles={styles} colors={colors} />
        ) : (
          <RemindersScreen styles={styles} colors={colors} />
        )}
      </Pressable>
      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onToggleTheme={toggleTheme}
        theme={theme}
        styles={styles}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotesProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </NotesProvider>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    appShell: {
      flex: 1,
    },
    headerRow: {
      paddingHorizontal: 16,
      paddingTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTextWrap: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 2,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuLine: {
      width: 24,
      height: 3,
      borderRadius: 12,
      backgroundColor: colors.text,
    },
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 12,
      backgroundColor: colors.tabBg,
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
      backgroundColor: colors.tabActiveBg,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    tabText: {
      color: colors.tabText,
      fontWeight: '700',
    },
    tabTextActive: {
      color: colors.text,
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
    masonryRow: {
      justifyContent: 'space-between',
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
      color: colors.text,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    filterGroup: {
      gap: 6,
      minWidth: 160,
      flex: 1,
    },
    filterLabel: {
      fontWeight: '700',
      color: colors.text,
    },
    filterChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.chip,
    },
    chipActive: {
      backgroundColor: colors.accent,
    },
    chipText: {
      color: colors.chipText,
      fontWeight: '700',
    },
    chipTextActive: {
      color: colors.chipActiveText,
    },
    emptyMessage: {
      color: colors.muted,
      fontSize: 14,
      marginTop: 8,
    },
    alertsContainer: {
      backgroundColor: colors.alertBg,
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
      color: colors.alertTitle,
    },
    clearText: {
      color: colors.accent,
      fontWeight: '700',
    },
    alert: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    alertTitle: {
      fontWeight: '700',
      color: colors.text,
    },
    alertTime: {
      color: colors.alertTime,
    },
    dismissText: {
      color: colors.accent,
      fontWeight: '700',
    },
    reminderCard: {
      backgroundColor: colors.card,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: '800',
      fontSize: 16,
    },
    reminderTime: {
      color: colors.secondaryText,
      marginTop: 4,
    },
    reminderNote: {
      color: colors.muted,
      marginTop: 4,
    },
    fabInline: {
      backgroundColor: colors.accent,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabInlineText: {
      color: colors.accentText,
      fontSize: 22,
      fontWeight: '800',
      marginTop: -2,
    },
    actionButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    danger: {
      backgroundColor: colors.dangerBg,
    },
    actionText: {
      fontWeight: '600',
      color: colors.text,
    },
    dangerText: {
      color: colors.dangerText,
    },
    drawerOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: colors.overlayBackdrop,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    drawer: {
      width: '70%',
      maxWidth: 320,
      backgroundColor: colors.card,
      padding: 16,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    drawerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    drawerLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
  });
