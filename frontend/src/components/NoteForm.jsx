import React, { useEffect, useState } from 'react';
import ReminderScheduler from './ReminderScheduler.jsx';
import { createId } from '../utils/ids.js';

const emptyNote = { title: '', content: '', reminders: [] };

const NoteForm = ({ onSave, selectedNote, onCancel }) => {
  const [noteDraft, setNoteDraft] = useState(emptyNote);

  useEffect(() => {
    if (selectedNote) {
      setNoteDraft(selectedNote);
    } else {
      setNoteDraft(emptyNote);
    }
  }, [selectedNote]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!noteDraft.title.trim()) return;

    const noteToSave = { ...noteDraft };
    if (!noteToSave.id) {
      noteToSave.id = createId();
    }

    onSave(noteToSave);
    setNoteDraft(emptyNote);
  };

  const handleAddReminder = (reminder) => {
    setNoteDraft((prev) => ({ ...prev, reminders: [...prev.reminders, reminder] }));
  };

  const handleRemoveReminder = (reminderId) => {
    setNoteDraft((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((reminder) => reminder.id !== reminderId),
    }));
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <p className="muted">{selectedNote ? 'Editar nota' : 'Nueva nota'}</p>
          <h2>{selectedNote ? 'Actualizar' : 'Crear'} nota</h2>
        </div>
        {selectedNote && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancelar edición
          </button>
        )}
      </div>

      <label>
        Título
        <input
          type="text"
          value={noteDraft.title}
          onChange={(event) => setNoteDraft((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Reunión de proyecto, Ideas de producto..."
          required
        />
      </label>

      <label>
        Contenido
        <textarea
          value={noteDraft.content}
          onChange={(event) => setNoteDraft((prev) => ({ ...prev, content: event.target.value }))}
          rows={4}
          placeholder="Detalles de la nota"
        />
      </label>

      <div className="section">
        <h3>Recordatorios</h3>
        <p className="muted">
          Programa tantos recordatorios como necesites; la aplicación los activará localmente en tu
          navegador.
        </p>
        <ReminderScheduler
          reminders={noteDraft.reminders}
          onAddReminder={handleAddReminder}
          onRemoveReminder={handleRemoveReminder}
        />
      </div>

      <div className="actions">
        <button type="submit">{selectedNote ? 'Guardar cambios' : 'Crear nota'}</button>
        {selectedNote && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default NoteForm;
