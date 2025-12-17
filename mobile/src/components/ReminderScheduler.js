import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createId } from '../utils/ids';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

export default function ReminderScheduler({ reminders, onChange }) {
  const [pickerMode, setPickerMode] = useState(null);
  const [draftDate, setDraftDate] = useState(() => new Date(Date.now() + 15 * 60 * 1000));

  const sortedReminders = useMemo(
    () => [...reminders].sort((a, b) => a.timestamp - b.timestamp),
    [reminders]
  );

  const onDateTimeChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }

    const current = selectedDate || draftDate;

    if (pickerMode === 'date') {
      const updated = new Date(current);
      updated.setHours(draftDate.getHours());
      updated.setMinutes(draftDate.getMinutes());
      setDraftDate(updated);
      setPickerMode('time');
      return;
    }

    if (pickerMode === 'time') {
      const updated = new Date(draftDate);
      updated.setHours(current.getHours());
      updated.setMinutes(current.getMinutes());

      const reminder = { id: createId(), timestamp: updated.getTime() };
      onChange([...reminders, reminder]);
      setDraftDate(new Date(Date.now() + 15 * 60 * 1000));
      setPickerMode(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Recordatorios</Text>
        <Pressable style={styles.addButton} onPress={() => setPickerMode('date')}>
          <Text style={styles.addButtonText}>Añadir</Text>
        </Pressable>
      </View>

      {sortedReminders.length === 0 ? (
        <Text style={styles.empty}>Sin recordatorios programados.</Text>
      ) : (
        sortedReminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderRow}>
            <Text style={styles.reminderText}>{formatDate(reminder.timestamp)}</Text>
            <Pressable
              style={styles.deleteButton}
              onPress={() => onChange(reminders.filter((r) => r.id !== reminder.id))}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </Pressable>
          </View>
        ))
      )}

      {pickerMode && (
        <DateTimePicker
          value={draftDate}
          mode={pickerMode}
          is24Hour
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onDateTimeChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  reminderText: {
    flex: 1,
    color: '#111827',
  },
  deleteButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
