import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ReminderScheduler from './ReminderScheduler';

export default function NoteForm({ onSubmit, onCancelEdit, initialNote }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reminders, setReminders] = useState([]);

  const isEditing = useMemo(() => Boolean(initialNote), [initialNote]);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setBody(initialNote.body || '');
      setReminders(initialNote.reminders || []);
    } else {
      setTitle('');
      setBody('');
      setReminders([]);
    }
  }, [initialNote]);

  const handleSubmit = () => {
    if (!title.trim() && !body.trim()) return;
    onSubmit({
      id: initialNote?.id,
      title,
      body,
      reminders,
    });
    if (!isEditing) {
      setTitle('');
      setBody('');
      setReminders([]);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.header}>{isEditing ? 'Editar nota' : 'Nueva nota'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          autoCapitalize="sentences"
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Contenido"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <ReminderScheduler reminders={reminders} onChange={setReminders} />

        <View style={styles.actions}>
          {isEditing && (
            <Pressable style={[styles.button, styles.secondary]} onPress={onCancelEdit}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Cancelar</Text>
            </Pressable>
          )}
          <Pressable style={[styles.button, styles.primary]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{isEditing ? 'Guardar cambios' : 'Crear nota'}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#111827',
  },
});
