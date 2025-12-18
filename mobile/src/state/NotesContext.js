import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createId } from '../utils/ids';

const STORAGE_KEY = 'onotes.data';

const initialState = {
  notes: [],
  reminders: [],
};

const normalizeNote = (note) => ({
  id: note.id || createId(),
  title: note.title || 'Sin título',
  body: note.body || '',
  reminders: (note.reminders || []).map((reminder) => ({
    ...reminder,
    id: reminder.id || createId(),
    timestamp: Number(reminder.timestamp) || Date.now(),
  })),
  todos: (note.todos || []).map((todo) => ({ ...todo, id: todo.id || createId() })),
  createdAt: Number(note.createdAt) || Date.now(),
  folder: note.folder || 'General',
  size: note.size || 'm',
});

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) => (note.id === action.payload.id ? action.payload : note)),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((note) => note.id !== action.payload) };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.payload };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((reminder) =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter((reminder) => reminder.id !== action.payload) };
    default:
      return state;
  }
}

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
};

export function NotesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const legacyNotes = await AsyncStorage.getItem('onotes.notes');
        if (stored) {
          const parsed = JSON.parse(stored);

          const parsedNotes = Array.isArray(parsed) ? parsed : parsed.notes || [];
          const parsedReminders = Array.isArray(parsed) ? [] : parsed.reminders || [];
          const normalizedNotes = (parsedNotes || []).map(normalizeNote);

          dispatch({
            type: 'HYDRATE',
            payload: { notes: normalizedNotes, reminders: parsedReminders },
          });
        } else if (legacyNotes) {
          const normalizedNotes = JSON.parse(legacyNotes || '[]').map(normalizeNote);
          dispatch({ type: 'HYDRATE', payload: { notes: normalizedNotes, reminders: [] } });
        }
      } catch (error) {
        console.warn('No se pudieron cargar las notas almacenadas', error);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) =>
      console.warn('No se pudieron guardar las notas', error)
    );
  }, [state, hydrated]);

  const actions = useMemo(
    () => ({
      addNote: ({ title, body, reminders, todos, folder, size, createdAt }) => {
        const note = normalizeNote({
          id: createId(),
          title: title?.trim() || 'Sin título',
          body: body?.trim() || '',
          reminders: reminders || [],
          todos: todos || [],
          folder: folder?.trim() || 'General',
          size: size || 'm',
          createdAt: createdAt || Date.now(),
        });
        dispatch({ type: 'ADD_NOTE', payload: note });
        return note.id;
      },
      updateNote: (note) =>
        dispatch({
          type: 'UPDATE_NOTE',
          payload: normalizeNote({
            ...note,
            createdAt: note.createdAt || Date.now(),
          }),
        }),
      deleteNote: (noteId) => dispatch({ type: 'DELETE_NOTE', payload: noteId }),
      toggleTodo: (noteId, todoId) => {
        const note = state.notes.find((n) => n.id === noteId);
        if (!note) return;
        const updated = {
          ...note,
          todos: (note.todos || []).map((todo) =>
            todo.id === todoId ? { ...todo, done: !todo.done } : todo
          ),
        };
        dispatch({ type: 'UPDATE_NOTE', payload: updated });
      },
      addReminder: ({ title, body, timestamp, targetDate }) => {
        const reminder = {
          id: createId(),
          title: title?.trim() || 'Recordatorio',
          body: body?.trim() || '',
          timestamp,
          targetDate,
        };
        dispatch({ type: 'ADD_REMINDER', payload: reminder });
        return reminder.id;
      },
      updateReminder: (reminder) =>
        dispatch({
          type: 'UPDATE_REMINDER',
          payload: { ...reminder, id: reminder.id || createId() },
        }),
      deleteReminder: (reminderId) => dispatch({ type: 'DELETE_REMINDER', payload: reminderId }),
    }),
    [state.notes, state.reminders]
  );

  const value = useMemo(
    () => ({
      notes: state.notes,
      reminders: state.reminders,
      hydrated,
      ...actions,
    }),
    [state.notes, state.reminders, hydrated, actions]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
