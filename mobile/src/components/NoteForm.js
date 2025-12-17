import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ReminderScheduler from './ReminderScheduler';

export default function NoteForm({ onSubmit, onCancelEdit, initialNote }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reminders, setReminders] = useState([]);
  const [showReminders, setShowReminders] = useState(false);
  const [todos, setTodos] = useState([]);
  const [todoDraft, setTodoDraft] = useState('');
  const [folder, setFolder] = useState('General');
  const [size, setSize] = useState('m');
  const [todos, setTodos] = useState([]);
  const [todoDraft, setTodoDraft] = useState('');

  const isEditing = useMemo(() => Boolean(initialNote), [initialNote]);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setBody(initialNote.body || '');
      setReminders(initialNote.reminders || []);
      setShowReminders(Boolean(initialNote.reminders?.length));
      setTodos(initialNote.todos || []);
      setFolder(initialNote.folder || 'General');
      setSize(initialNote.size || 'm');
      setTodos(initialNote.todos || []);
    } else {
      setTitle('');
      setBody('');
      setReminders([]);
      setShowReminders(false);
      setTodos([]);
      setFolder('General');
      setSize('m');
      setTodos([]);
    }
  }, [initialNote]);

  const handleSubmit = () => {
    if (!title.trim() && !body.trim()) return;
    onSubmit({
      id: initialNote?.id,
      title,
      body,
      reminders: showReminders ? reminders : [],
      todos,
      folder,
      size,
      createdAt: initialNote?.createdAt,
      reminders,
      todos,
    });
    if (!isEditing) {
      setTitle('');
      setBody('');
      setReminders([]);
    }
  };

  const handleAddTodo = () => {
    if (!todoDraft.trim()) return;
    setTodos([...todos, { id: `${Date.now()}`, text: todoDraft.trim(), done: false }]);
    setTodoDraft('');
  };

  const toggleTodo = (todoId) => {
    setTodos((prev) => prev.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)));
  };

  const deleteTodo = (todoId) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
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

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Carpeta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Trabajo, Casa, Ideas"
              value={folder}
              onChangeText={setFolder}
            />
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Tamaño</Text>
            <View style={styles.sizeRow}>
              {[
                { key: 's', label: 'Pequeña' },
                { key: 'm', label: 'Media' },
                { key: 'l', label: 'Grande' },
              ].map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[styles.chip, size === opt.key && styles.chipActive]}
                  onPress={() => setSize(opt.key)}
                >
                  <Text style={[styles.chipText, size === opt.key && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.todoSection}>
          <View style={styles.todoHeader}>
            <Text style={styles.todoTitle}>Lista de tareas</Text>
            <Pressable style={styles.todoAddButton} onPress={handleAddTodo}>
              <Text style={styles.todoAddText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.todoRow}>
            <TextInput
              style={[styles.input, styles.todoInput]}
              placeholder="Nueva tarea"
              value={todoDraft}
              onChangeText={setTodoDraft}
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
            />
          </View>
          {todos.length === 0 ? (
            <Text style={styles.emptyTodo}>Agrega tareas para esta nota.</Text>
          ) : (
            todos.map((todo) => (
              <View key={todo.id} style={styles.todoItem}>
                <Pressable style={styles.checkbox} onPress={() => toggleTodo(todo.id)}>
                  <Text style={styles.checkboxMark}>{todo.done ? '✔' : ''}</Text>
                </Pressable>
                <Text style={[styles.todoText, todo.done && styles.todoDone]}>{todo.text}</Text>
                <Pressable onPress={() => deleteTodo(todo.id)} style={styles.todoDelete}>
                  <Text style={styles.todoDeleteText}>Eliminar</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={styles.reminderToggle}>
          <Text style={styles.metaLabel}>Añadir recordatorio a la nota</Text>
          <Pressable
            style={[styles.chip, showReminders && styles.chipActive]}
            onPress={() => setShowReminders((prev) => !prev)}
          >
            <Text style={[styles.chipText, showReminders && styles.chipTextActive]}>
              {showReminders ? 'Quitar recordatorios' : 'Mostrar opciones'}
            </Text>
          </Pressable>
        </View>

        {showReminders ? <ReminderScheduler reminders={reminders} onChange={setReminders} /> : null}
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
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    color: '#111827',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  todoSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 6,
    gap: 8,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0f172a',
  },
  todoAddButton: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoAddText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todoInput: {
    flex: 1,
    marginBottom: 0,
  },
  emptyTodo: {
    color: '#6b7280',
    fontSize: 14,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: {
    color: '#2563eb',
    fontWeight: '800',
  },
  todoText: {
    flex: 1,
    color: '#111827',
  },
  todoDone: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  todoDelete: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  todoDeleteText: {
    color: '#b91c1c',
    fontWeight: '700',
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
