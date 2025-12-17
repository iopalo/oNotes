import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const OPTIONS = [
  { key: 'week', label: '1 semana antes', offset: 7 * 24 * 60 * 60 * 1000 },
  { key: 'day', label: '1 día antes', offset: 24 * 60 * 60 * 1000 },
  { key: 'event', label: 'A la hora elegida', offset: 0 },
  { key: 'custom', label: 'Otra', offset: null },
];

const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

export default function StandaloneReminderForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetDate, setTargetDate] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [customDate, setCustomDate] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [selectedOffsets, setSelectedOffsets] = useState(new Set(['event']));
  const [pickerMode, setPickerMode] = useState(null);

  const selectedLabels = useMemo(
    () => OPTIONS.filter((opt) => selectedOffsets.has(opt.key)).map((opt) => opt.label).join(', '),
    [selectedOffsets]
  );

  const handleToggle = (key) => {
    setSelectedOffsets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    if (key === 'custom') {
      setPickerMode('customDate');
    }
  };

  const onDateChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }

    if (pickerMode === 'targetDate') {
      const next = new Date(selected || targetDate);
      next.setHours(targetDate.getHours());
      next.setMinutes(targetDate.getMinutes());
      setTargetDate(next);
      setPickerMode('targetTime');
      return;
    }

    if (pickerMode === 'targetTime') {
      const next = new Date(targetDate);
      next.setHours((selected || targetDate).getHours());
      next.setMinutes((selected || targetDate).getMinutes());
      setTargetDate(next);
      setPickerMode(null);
      return;
    }

    if (pickerMode === 'customDate') {
      const next = new Date(selected || customDate);
      next.setHours(customDate.getHours());
      next.setMinutes(customDate.getMinutes());
      setCustomDate(next);
      setPickerMode('customTime');
      return;
    }

    if (pickerMode === 'customTime') {
      const next = new Date(customDate);
      next.setHours((selected || customDate).getHours());
      next.setMinutes((selected || customDate).getMinutes());
      setCustomDate(next);
      setPickerMode(null);
    }
  };

  const handleSubmit = () => {
    const now = Date.now();
    const times = OPTIONS.filter((opt) => selectedOffsets.has(opt.key))
      .map((opt) => {
        if (opt.key === 'custom') return customDate.getTime();
        if (opt.key === 'event') return targetDate.getTime();
        return targetDate.getTime() - opt.offset;
      })
      .filter((ts) => ts > now);

    if (!times.length) return;

    times.forEach((timestamp) =>
      onSubmit({ title, body, timestamp, targetDate: targetDate.getTime() })
    );

    setTitle('');
    setBody('');
    setSelectedOffsets(new Set(['event']));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.header}>Nuevo recordatorio</Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Notas opcionales"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={3}
        />

        <View style={styles.sectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.caption}>Fecha objetivo</Text>
            <Text style={styles.value}>{formatDate(targetDate.getTime())}</Text>
          </View>
          <Pressable style={styles.chip} onPress={() => setPickerMode('targetDate')}>
            <Text style={styles.chipText}>Cambiar</Text>
          </Pressable>
        </View>

        <Text style={styles.caption}>Cuándo notificar</Text>
        <View style={styles.chipsRow}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[styles.chip, selectedOffsets.has(opt.key) && styles.chipActive]}
              onPress={() => handleToggle(opt.key)}
            >
              <Text style={[styles.chipText, selectedOffsets.has(opt.key) && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helper}>Seleccionados: {selectedLabels || 'ninguno'}</Text>

        <Pressable style={[styles.button, styles.primary]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Crear recordatorio</Text>
        </Pressable>

        {pickerMode && (
          <DateTimePicker
            value={pickerMode.startsWith('custom') ? customDate : targetDate}
            mode={pickerMode.includes('Time') ? 'time' : 'date'}
            is24Hour
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caption: {
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    color: '#0f172a',
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  chipTextActive: {
    color: '#fff',
  },
  helper: {
    color: '#6b7280',
    fontSize: 12,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
