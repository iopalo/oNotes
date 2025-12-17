import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

export default function NotesList({ note, onEdit, onDelete, onToggleTodo }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{note.title || 'Sin título'}</Text>
        <View style={styles.cardActions}>
          <Pressable onPress={() => onEdit(note)} style={[styles.actionButton, styles.link]}>
            <Text style={styles.actionText}>Editar</Text>
          </Pressable>
          <Pressable onPress={() => onDelete(note.id)} style={[styles.actionButton, styles.danger]}>
            <Text style={[styles.actionText, styles.dangerText]}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
      {note.body ? <Text style={styles.body}>{note.body}</Text> : null}

      {note.todos?.length ? (
        <View style={styles.todos}>
          <Text style={styles.reminderLabel}>To-do:</Text>
          {note.todos.map((todo) => (
            <View key={todo.id} style={styles.todoRow}>
              <Pressable style={styles.checkbox} onPress={() => onToggleTodo(note.id, todo.id)}>
                <Text style={styles.checkboxMark}>{todo.done ? '✔' : ''}</Text>
              </Pressable>
              <Text style={[styles.todoText, todo.done && styles.todoDone]}>{todo.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {note.reminders?.length ? (
        <View style={styles.reminders}>
          <Text style={styles.reminderLabel}>Recordatorios:</Text>
          {note.reminders
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((reminder) => (
              <Text key={reminder.id} style={styles.reminderItem}>
                • {formatDate(reminder.timestamp)}
              </Text>
            ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
    color: '#0f172a',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  link: {
    backgroundColor: '#e5e7eb',
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
  body: {
    color: '#1f2937',
    marginBottom: 6,
  },
  reminders: {
    marginTop: 6,
  },
  reminderLabel: {
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  reminderItem: {
    color: '#111827',
  },
  todos: {
    marginTop: 6,
    gap: 6,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
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
    color: '#111827',
    flex: 1,
  },
  todoDone: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
});
