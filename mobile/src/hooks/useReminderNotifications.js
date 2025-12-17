import { useEffect, useMemo, useRef, useState } from 'react';

export function useReminderNotifications(notes) {
  const [alerts, setAlerts] = useState([]);
  const scheduled = useRef(new Map());

  const hydratedNotes = useMemo(() => notes || [], [notes]);

  useEffect(() => {
    const now = Date.now();
    const activeReminderIds = new Set();

    hydratedNotes.forEach((note) => {
      (note.reminders || []).forEach((reminder) => {
        const reminderTime = reminder.timestamp;
        activeReminderIds.add(reminder.id);

        if (reminderTime <= now) {
          setAlerts((prev) =>
            prev.some((alert) => alert.reminderId === reminder.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: `${reminder.id}-alert`,
                    noteId: note.id,
                    title: note.title,
                    reminderId: reminder.id,
                    timestamp: reminderTime,
                  },
                ]
          );
          return;
        }

        if (scheduled.current.has(reminder.id)) return;

        const delay = reminderTime - now;
        const timeout = setTimeout(() => {
          setAlerts((prev) => [
            ...prev,
            {
              id: `${reminder.id}-${Date.now()}`,
              noteId: note.id,
              title: note.title,
              reminderId: reminder.id,
              timestamp: reminderTime,
            },
          ]);
          scheduled.current.delete(reminder.id);
        }, delay);

        scheduled.current.set(reminder.id, timeout);
      });
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
  }, [hydratedNotes]);

  const dismissAlert = (id) => setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  const clearAlerts = () => setAlerts([]);

  return { alerts, dismissAlert, clearAlerts };
}
