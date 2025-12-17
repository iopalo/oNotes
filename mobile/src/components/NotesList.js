import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

export default function NotesList({ notes, onEdit, onDelete }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas guardadas</Text>
      {notes.length === 0 ? (
        <Text style={styles.empty}>Aún no hay notas. Crea la primera para comenzar.</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title || 'Sin título'}</Text>
                <View style={styles.cardActions}>
                  <Pressable onPress={() => onEdit(item)} style={[styles.actionButton, styles.link]}>
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => onDelete(item.id)} style={[styles.actionButton, styles.danger]}>
                    <Text style={[styles.actionText, styles.dangerText]}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
              {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
              {item.reminders?.length ? (
                <View style={styles.reminders}>
                  <Text style={styles.reminderLabel}>Recordatorios:</Text>
                  {item.reminders
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
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
  },
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
});
