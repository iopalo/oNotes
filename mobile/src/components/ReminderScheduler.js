import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createId } from '../utils/ids';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

const OPTIONS = [
  { key: 'week', label: '1 semana antes', offset: 7 * 24 * 60 * 60 * 1000 },
  { key: 'day', label: '1 día antes', offset: 24 * 60 * 60 * 1000 },
  { key: 'event', label: 'A la hora del evento', offset: 0 },
  { key: 'custom', label: 'Otra', offset: null },
];

export default function ReminderScheduler({ reminders = [], onChange }) {
  const [pickerMode, setPickerMode] = useState(null);
  const [eventDate, setEventDate] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [customReminder, setCustomReminder] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [selectedOffsets, setSelectedOffsets] = useState(new Set(['event']));

  const sortedReminders = useMemo(
    () => [...(reminders || [])].sort((a, b) => a.timestamp - b.timestamp),
    [reminders]
  );

  const toggleOption = (key) => {
    setSelectedOffsets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const onDateTimeChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }

    const current = selectedDate || eventDate;

    if (pickerMode === 'date') {
      const updated = new Date(current);
      updated.setHours(eventDate.getHours());
      updated.setMinutes(eventDate.getMinutes());
      setEventDate(updated);
      setPickerMode('time');
      return;
    }

    if (pickerMode === 'time') {
      const updated = new Date(eventDate);
      updated.setHours(current.getHours());
      updated.setMinutes(current.getMinutes());
      setEventDate(updated);
      setPickerMode(null);
      return;
    }

    if (pickerMode === 'customDate') {
      const updated = new Date(current);
      updated.setHours(customReminder.getHours());
      updated.setMinutes(customReminder.getMinutes());
      setCustomReminder(updated);
      setPickerMode('customTime');
      return;
    }

    if (pickerMode === 'customTime') {
      const updated = new Date(customReminder);
      updated.setHours(current.getHours());
      updated.setMinutes(current.getMinutes());
      setCustomReminder(updated);
      setPickerMode(null);
    }
  };

  const generateReminders = () => {
    const now = Date.now();
    const additions = OPTIONS.filter((opt) => selectedOffsets.has(opt.key))
      .map((opt) => {
        if (opt.key === 'custom') {
          return customReminder.getTime();
        }
        if (opt.key === 'event') {
          return eventDate.getTime();
        }
        return eventDate.getTime() - opt.offset;
      })
      .filter((timestamp) => timestamp > now)
      .map((timestamp) => ({ id: createId(), timestamp }));

    if (!additions.length) return;
    const merged = [...reminders, ...additions].sort((a, b) => a.timestamp - b.timestamp);
    onChange(merged);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Recordatorios</Text>
        <Pressable style={styles.addButton} onPress={() => setPickerMode('date')}>
          <Text style={styles.addButtonText}>Elegir fecha</Text>
        </Pressable>
      </View>

      <Text style={styles.selectedDate}>Evento: {formatDate(eventDate.getTime())}</Text>
      <Text style={styles.selectedDate}>Personalizado: {formatDate(customReminder.getTime())}</Text>

      <View style={styles.optionsRow}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.optionChip, selectedOffsets.has(opt.key) && styles.optionChipActive]}
            onPress={() => {
              toggleOption(opt.key);
              if (opt.key === 'custom') {
                setPickerMode('customDate');
              }
            }}
          >
            <Text
              style={[styles.optionText, selectedOffsets.has(opt.key) && styles.optionTextActive]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.addButton, styles.generateButton]} onPress={generateReminders}>
        <Text style={styles.addButtonText}>Añadir recordatorios</Text>
      </Pressable>

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
          value={pickerMode?.startsWith('custom') ? customReminder : eventDate}
          mode={pickerMode?.includes('time') ? 'time' : 'date'}
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
  selectedDate: {
    marginTop: 8,
    color: '#1f2937',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
  },
  optionChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    color: '#111827',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  generateButton: {
    marginTop: 10,
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
