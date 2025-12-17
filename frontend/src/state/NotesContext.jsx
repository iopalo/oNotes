import React, { createContext, useContext, useEffect, useReducer } from 'react';

const NotesContext = createContext();

const initialState = {
  notes: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'hydrate':
      return { ...state, notes: action.payload };
    case 'add':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'update':
      return {
        ...state,
        notes: state.notes.map((note) => (note.id === action.payload.id ? action.payload : note)),
      };
    case 'delete':
      return { ...state, notes: state.notes.filter((note) => note.id !== action.payload) };
    default:
      return state;
  }
};

const storageKey = 'onotes:data';

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalizedNotes = (parsed.notes ?? []).map((note) => ({
          ...note,
          reminders: note.reminders ?? [],
        }));
        dispatch({ type: 'hydrate', payload: normalizedNotes });
      } catch (error) {
        console.error('Failed to parse saved notes', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const addNote = (note) => dispatch({ type: 'add', payload: note });
  const updateNote = (note) => dispatch({ type: 'update', payload: note });
  const deleteNote = (id) => dispatch({ type: 'delete', payload: id });

  return (
    <NotesContext.Provider value={{ ...state, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used inside a NotesProvider');
  }
  return context;
};
