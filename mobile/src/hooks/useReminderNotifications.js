import { useEffect, useMemo, useRef, useState } from 'react';

export function useReminderNotifications(notes, standaloneReminders = []) {
  const [alerts, setAlerts] = useState([]);
  const scheduled = useRef(new Map());

  const hydratedNotes = useMemo(() => notes || [], [notes]);
  const hydratedStandalone = useMemo(() => standaloneReminders || [], [standaloneReminders]);

  useEffect(() => {
    const now = Date.now();
    const activeReminderIds = new Set();

    const schedulePayloads = [];

    hydratedNotes.forEach((note) => {
      (note.reminders || []).forEach((reminder) => {
        schedulePayloads.push({
          id: reminder.id,
          reminderTime: reminder.timestamp,
          title: note.title,
          noteId: note.id,
        });
      });
    });

    hydratedStandalone.forEach((reminder) => {
      schedulePayloads.push({
        id: reminder.id,
        reminderTime: reminder.timestamp,
        title: reminder.title,
        noteId: null,
      });
    });

    schedulePayloads.forEach(({ id, reminderTime, title, noteId }) => {
      activeReminderIds.add(id);

      if (reminderTime <= now) {
        setAlerts((prev) =>
          prev.some((alert) => alert.reminderId === id)
            ? prev
            : [
                ...prev,
                {
                  id: `${id}-alert`,
                  noteId,
                  title,
                  reminderId: id,
                  timestamp: reminderTime,
                },
              ]
        );
        return;
      }

      if (scheduled.current.has(id)) return;

      const delay = reminderTime - now;
      const timeout = setTimeout(() => {
        setAlerts((prev) => [
          ...prev,
          {
            id: `${id}-${Date.now()}`,
            noteId,
            title,
            reminderId: id,
            timestamp: reminderTime,
          },
        ]);
        scheduled.current.delete(id);
      }, delay);

      scheduled.current.set(id, timeout);
    });

    scheduled.current.forEach((timeoutId, reminderId) => {
      if (!activeReminderIds.has(reminderId)) {
        clearTimeout(timeoutId);
        scheduled.current.delete(reminderId);
      }
    });

    return () => {
      scheduled.current.forEach((timeoutId) => clearTimeout(timeoutId));
      scheduled.current.clear();
    };
  }, [hydratedNotes, hydratedStandalone]);

  const dismissAlert = (id) => setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  const clearAlerts = () => setAlerts([]);

  return { alerts, dismissAlert, clearAlerts };
}
