import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString();

const palette = ['#fef3c7', '#e0f2fe', '#e0f7f4', '#fce7f3', '#e5e7eb'];

const sizeHeights = {
  s: 140,
  m: 200,
  l: 260,
};

export default function NotesList({
  note,
  onEdit,
  onDelete,
  onToggleTodo,
  onResize,
  onDrag,
  customMode = false,
  isActive = false,
  index,
  colors,
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;

  const backgroundColor = useMemo(() => {
    const value = (note.folder || '') + note.id + index;
    const codePoint = value.charCodeAt(0) || 0;
    return palette[codePoint % palette.length];
  }, [note.folder, note.id, index]);

  const sizeHeight = sizeHeights[note.size] || sizeHeights.m;

  const handlePinchEvent = Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true });

  const handlePinchStateChange = (event) => {
    if (!onResize) return;
    if (event.nativeEvent.state !== State.END) return;
    const gestureScale = event.nativeEvent.scale;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    if (gestureScale > 1.12) {
      onResize(note.id, 'increase');
    } else if (gestureScale < 0.9) {
      onResize(note.id, 'decrease');
    }
  };

  return (
    <PinchGestureHandler
      enabled={Boolean(customMode && onResize)}
      onGestureEvent={handlePinchEvent}
      onHandlerStateChange={handlePinchStateChange}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor, minHeight: sizeHeight, transform: [{ scale }] },
          customMode && isActive ? styles.dragging : null,
        ]}
      >
        <Pressable
          style={styles.cardContent}
          onPress={() => onEdit(note)}
          onLongPress={customMode && onDrag ? onDrag : undefined}
          delayLongPress={120}
        >
          <View style={styles.cardHeader}>
            <View style={styles.folderPill}>
              <Text style={styles.folderText}>{note.folder || 'General'}</Text>
            </View>
            <Pressable onPress={() => onDelete(note.id)} style={styles.iconButton} accessibilityLabel="Eliminar nota">
              <Text style={styles.iconText}>🗑</Text>
            </Pressable>
          </View>

          <Text style={styles.cardTitle}>{note.title || 'Sin título'}</Text>
          {note.body ? <Text style={styles.body}>{note.body}</Text> : null}

          {note.todos?.length ? (
            <View style={styles.todos}>
              {note.todos.map((todo) => (
                <Pressable key={todo.id} style={styles.todoRow} onPress={() => onToggleTodo(note.id, todo.id)}>
                  <Text style={[styles.checkboxMark, todo.done && styles.checkboxDone]}>{todo.done ? '☑' : '☐'}</Text>
                  <Text style={[styles.todoText, todo.done && styles.todoDone]}>{todo.text}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {note.reminders?.length ? (
            <View style={styles.reminders}>
              {note.reminders
                .slice()
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((reminder) => (
                  <Text key={reminder.id} style={styles.reminderItem}>
                    🔔 {formatDate(reminder.timestamp)}
                  </Text>
                ))}
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <Text style={styles.dateText}>{formatDate(note.createdAt || Date.now())}</Text>
            <Pressable onPress={() => onEdit(note)} style={styles.iconButton} accessibilityLabel="Editar nota">
              <Text style={styles.iconText}>✏️</Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </PinchGestureHandler>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 0,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
      flex: 1,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 14,
      flex: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    folderPill: {
      backgroundColor: 'rgba(0,0,0,0.06)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    folderText: {
      fontWeight: '700',
      color: colors.text,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    body: {
      color: colors.text,
      marginBottom: 8,
      fontSize: 15,
    },
    reminders: {
      marginTop: 4,
      gap: 4,
    },
    reminderItem: {
      color: colors.text,
      fontWeight: '700',
    },
    todos: {
      gap: 8,
      marginTop: 4,
    },
    todoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    checkboxMark: {
      fontSize: 18,
      color: colors.text,
    },
    checkboxDone: {
      color: colors.accent,
    },
    todoText: {
      color: colors.text,
      flex: 1,
    },
    todoDone: {
      textDecorationLine: 'line-through',
      color: colors.muted,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    dateText: {
      color: colors.secondaryText,
      fontWeight: '600',
    },
    iconButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.chip,
    },
    iconText: {
      fontSize: 16,
      color: colors.text,
    },
    dragging: {
      opacity: 0.92,
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });
