import { useEffect, useRef, useState } from 'react';

const createNotification = (note, reminder) => ({
  id: `${note.id}-${reminder.id}`,
  noteId: note.id,
  noteTitle: note.title || 'Untitled note',
  scheduledFor: reminder.when,
});

export const useReminderNotifications = (notes) => {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach((timerId) => clearTimeout(timerId));
    timers.current = [];

    const now = Date.now();

    notes.forEach((note) => {
      note.reminders.forEach((reminder) => {
        const dateValue = new Date(reminder.when).getTime();
        if (Number.isNaN(dateValue)) return;

        const notification = createNotification(note, reminder);
        if (dateValue <= now) {
          setNotifications((prev) => {
            if (prev.some((item) => item.id === notification.id)) return prev;
            return [...prev, notification];
          });
          return;
        }

        const delay = dateValue - now;
        const timerId = setTimeout(() => {
          setNotifications((prev) => {
            if (prev.some((item) => item.id === notification.id)) return prev;
            return [...prev, notification];
          });
        }, delay);

        timers.current.push(timerId);
      });
    });

    return () => timers.current.forEach((timerId) => clearTimeout(timerId));
  }, [notes]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => setNotifications([]);

  return { notifications, dismissNotification, clearAll };
};
