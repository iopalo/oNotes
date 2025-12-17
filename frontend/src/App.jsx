import React, { useMemo, useState } from 'react';
import NoteForm from './components/NoteForm.jsx';
import NotesList from './components/NotesList.jsx';
import { NotesProvider, useNotes } from './state/NotesContext.jsx';
import { useReminderNotifications } from './hooks/useReminderNotifications.js';

const formatDate = (value) => new Date(value).toLocaleString();

const AppShell = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedNoteId), [
    notes,
    selectedNoteId,
  ]);

  const { notifications, dismissNotification, clearAll } = useReminderNotifications(notes);

  const handleSave = (note) => {
    if (selectedNoteId) {
      updateNote(note);
    } else {
      addNote(note);
    }
    setSelectedNoteId(null);
  };

  const handleDelete = (id) => {
    deleteNote(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  return (
    <div className="layout">
      <header>
        <div>
          <p className="muted">oNotes</p>
          <h1>Notas con recordatorios</h1>
          <p className="muted">
            Guarda notas, programa recordatorios locales y recibe avisos en cuanto llegue la hora.
          </p>
        </div>
        <div className="notifications">
          <div className="notification-header">
            <h3>Recordatorios activos</h3>
            {notifications.length > 0 && (
              <button type="button" className="ghost" onClick={clearAll}>
                Limpiar todos
              </button>
            )}
          </div>
          {notifications.length === 0 && <p className="muted">Sin recordatorios disparados.</p>}
          {notifications.length > 0 && (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className="notification">
                  <div>
                    <strong>{notification.noteTitle}</strong>
                    <div className="muted">{formatDate(notification.scheduledFor)}</div>
                  </div>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    Cerrar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <main>
        <NoteForm
          selectedNote={selectedNote}
          onSave={handleSave}
          onCancel={() => setSelectedNoteId(null)}
        />
        <NotesList notes={notes} onEdit={(note) => setSelectedNoteId(note.id)} onDelete={handleDelete} />
      </main>
    </div>
  );
};

const App = () => (
  <NotesProvider>
    <AppShell />
  </NotesProvider>
);

export default App;
