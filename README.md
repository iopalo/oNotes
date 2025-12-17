# oNotes

Aplicación para notas con recordatorios locales pensada para Android.

## Estructura
- `mobile/`: proyecto Expo (React Native) con estado global vía `useReducer`, persistencia con `AsyncStorage` y recordatorios simulados con timers.
- `frontend/`: versión web previa (Vite + React). La app principal ahora es la móvil.

## Requisitos
- Node.js 18+
- Expo CLI (opcional si usas `npx expo start` directamente)
- Dispositivo Android con la app **Expo Go** o un emulador Android configurado

## Ejecutar en Android
1. Instala dependencias:
   ```bash
   cd mobile
   npm install
   ```
2. Arranca el servidor de desarrollo con acceso en red local:
   ```bash
   npm start
   ```
   - Escanea el código QR con Expo Go (Android) o usa la opción `a` en la consola para abrir el emulador Android.
   - Si tu red bloquea la conexión local, usa el modo túnel (`npm start -- --tunnel`).

## Funcionalidad
- Crear, editar y eliminar notas.
- Cada nota admite múltiples recordatorios con fecha y hora.
- Persistencia local con `AsyncStorage` para mantener las notas entre sesiones.
- Recordatorios simulados: se programan con `setTimeout` y muestran avisos dentro de la app cuando llega la hora (mantén la app abierta o en primer plano durante las pruebas).
- Panel para descartar avisos individuales o limpiar todos los recordatorios mostrados.

## Componentes principales (móvil)
- `NoteForm`: formulario de creación/edición de notas y sus recordatorios.
- `ReminderScheduler`: selector de fecha/hora para programar y eliminar recordatorios.
- `NotesList`: listado de notas con acciones de edición y borrado.
- `useReminderNotifications`: programa timers y maneja los avisos cuando se cumplen.
- `NotesProvider` (`mobile/src/state/NotesContext.js`): administra el estado global con `useReducer`, IDs únicos y sincronización con almacenamiento local.

## Consejos para probar en Android
- Usa Expo Go en un teléfono real conectado a la misma red Wi-Fi que tu computador.
- En emuladores (Android Studio), inicia el emulador antes de correr `npm start` y presiona `a` en la consola de Metro/Expo.
- La UI está diseñada para pantallas pequeñas: tarjetas y acciones se apilan verticalmente y usan botones grandes para facilitar el toque.
