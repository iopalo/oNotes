import React from 'react';

const NotesList = ({ notes, onEdit, onDelete }) => (
  <div className="notes-list">
    {notes.length === 0 && <p className="muted">Añade tu primera nota para comenzar.</p>}
    {notes.map((note) => (
      <article key={note.id} className="card">
        <header className="card-header">
          <div>
            <p className="muted">Nota</p>
            <h3>{note.title}</h3>
          </div>
          <div className="actions">
            <button type="button" onClick={() => onEdit(note)}>
              Editar
            </button>
            <button type="button" className="ghost" onClick={() => onDelete(note.id)}>
              Eliminar
            </button>
          </div>
        </header>
        {note.content && <p className="content">{note.content}</p>}

        <div className="reminders">
          <h4>Recordatorios</h4>
          {note.reminders.length === 0 && <p className="muted">Sin recordatorios</p>}
          {note.reminders.length > 0 && (
            <ul>
              {note.reminders.map((reminder) => (
                <li key={reminder.id}>
                  <span className="tag">{reminder.label}</span>
                  <span className="muted">{new Date(reminder.when).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    ))}
  </div>
);

export default NotesList;
