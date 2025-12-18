import React, { useState } from 'react';
import { createId } from '../utils/ids.js';

const ReminderScheduler = ({ reminders, onAddReminder, onRemoveReminder }) => {
  const [when, setWhen] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    if (!when) return;
    const reminder = {
      id: createId(),
      when,
      label: label.trim() || 'Recordatorio',
    };
    onAddReminder(reminder);
    setWhen('');
    setLabel('');
  };

  return (
    <div className="reminder-scheduler">
      <div className="reminder-form">
        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          />
        </label>
        <label>
          Etiqueta (opcional)
          <input
            type="text"
            placeholder="Revisión, llamada, etc."
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        <button type="button" onClick={handleAdd} disabled={!when}>
          Añadir recordatorio
        </button>
      </div>

      <ul className="reminder-list">
        {reminders.length === 0 && <li className="muted">Sin recordatorios</li>}
        {reminders.map((reminder) => (
          <li key={reminder.id}>
            <div>
              <strong>{reminder.label}</strong>
              <div className="muted">{new Date(reminder.when).toLocaleString()}</div>
            </div>
            <button type="button" className="ghost" onClick={() => onRemoveReminder(reminder.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReminderScheduler;
