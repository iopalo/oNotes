# oNotes

Aplicación para notas con recordatorios locales pensada para Android.

## Estructura
- `mobile/`: proyecto Expo (React Native) con estado global vía `useReducer`, persistencia con `AsyncStorage` y recordatorios simulados con timers.
- `frontend/`: versión web previa (Vite + React). La app principal ahora es la móvil.

## Requisitos
- Node.js 18+
- Expo CLI instalada globalmente (`npm install -g expo-cli`) **o** usar todos los comandos con `npx`
- Dispositivo Android con la app **Expo Go** instalada, o un emulador Android configurado

## Ejecutar en Android (paso a paso)
> Sugerido para PowerShell/cmd en Windows: escribe los comandos sin copiar el bloque con \`\`\`bash\`\`\` para evitar errores de comando no encontrado.

1. Entra a la carpeta móvil: `cd mobile`
2. Instala dependencias (usa `npm config set legacy-peer-deps true` si aparece un error de peer deps): `npm install`
   - Si aparece `No matching version found for @react-native-community/datetimepicker`, asegúrate de que el archivo `mobile/package.json` tenga la versión `7.7.2` y vuelve a correr `npm install`.
3. Si el comando `expo` no existe, instala la CLI global `npm install -g expo-cli` **o** ejecuta todos los comandos con `npx expo ...`.
4. Inicia el servidor de desarrollo (Metro):
   - Con CLI global: `npm start`
   - Con npx: `npx expo start`
5. Conéctalo a tu Android:
   - En un emulador: con Metro abierto, presiona `a` para lanzar la app en el emulador.
   - En dispositivo físico: escanea el QR que muestra Metro con la app **Expo Go** (deben estar en la misma red Wi-Fi).
6. Si la red bloquea conexiones locales, arranca en modo túnel: `npx expo start --tunnel` (o `npm start -- --tunnel`).

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

## Notas adicionales
- Si actualizas dependencias, mantén la versión de `@react-native-community/datetimepicker` alineada con la que soporta Expo SDK 51 (ejemplo: `7.7.2`).
- La versión web previa (`frontend/`) sigue disponible para referencia, pero el flujo recomendado es la app Android en `mobile/`.
