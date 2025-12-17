import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createId } from '../utils/ids';

const STORAGE_KEY = 'onotes.notes';

const initialState = {
  notes: [],
};

function reducer(state, action) {
  switch (action.type) {
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
        if (stored) {
          dispatch({ type: 'SET_NOTES', payload: JSON.parse(stored) });
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes)).catch((error) =>
      console.warn('No se pudieron guardar las notas', error)
    );
  }, [state.notes, hydrated]);

  const actions = useMemo(
    () => ({
      addNote: ({ title, body, reminders, todos }) => {
        const note = {
          id: createId(),
          title: title.trim() || 'Sin título',
          body: body.trim(),
          reminders: (reminders || []).map((reminder) => ({ ...reminder, id: reminder.id || createId() })),
          todos: (todos || []).map((todo) => ({ ...todo, id: todo.id || createId() })),
        };
        dispatch({ type: 'ADD_NOTE', payload: note });
        return note.id;
      },
      updateNote: (note) =>
        dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            ...note,
            reminders: (note.reminders || []).map((reminder) => ({
              ...reminder,
              id: reminder.id || createId(),
            })),
            todos: (note.todos || []).map((todo) => ({ ...todo, id: todo.id || createId() })),
          },
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
    }),
    [state.notes]
  );

  const value = useMemo(
    () => ({
      notes: state.notes,
      hydrated,
      ...actions,
    }),
    [state.notes, hydrated, actions]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
