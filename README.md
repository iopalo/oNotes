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
> Consejos para PowerShell/cmd en Windows: escribe cada comando tal cual (sin copiar bloque con ```bash```). Si ves errores de "no se reconoce" o rutas duplicadas, verifica que estés en la carpeta correcta y que Node esté en el PATH.

1. Entra a la carpeta móvil: `cd mobile`
2. (Opcional) Si usas Windows y tienes avisos de peer deps, ejecuta una sola vez: `npm config set legacy-peer-deps true`
3. Instala dependencias del proyecto (instala Expo localmente en `node_modules`): `npm install`
   - Si aparece `No matching version found for @react-native-community/datetimepicker`, cambia la versión en `mobile/package.json` a `7.6.1` (ya viene configurada) y repite `npm install`.
   - Si tras el error de `datetimepicker` el CLI te sigue diciendo que `expo` no se encuentra, borra el fallo corrigiendo la versión y ejecuta de nuevo `npm install` hasta que finalice sin errores (así se instala `expo` localmente).
4. Si `expo` no se reconoce, usa siempre el CLI local con `npx expo <comando>` (recomendado) o instala el CLI global: `npm install -g expo-cli`.
5. Inicia el servidor Metro (elige una opción):
   - Con scripts npm: `npm start`
   - Con CLI local: `npx expo start`
   - Con túnel (si tu red bloquea LAN): `npx expo start --tunnel`
6. Abre la app en Android:
   - Emulador (Android Studio): ten el emulador abierto y en la consola de Metro presiona `a`.
   - Dispositivo físico: instala **Expo Go**, escanea el QR de Metro (mismo Wi-Fi) o usa el enlace que muestra la consola.
7. Si cambiaste de carpeta accidentalmente (p. ej., `mobile/mobile`), vuelve a la raíz del proyecto con `cd ..` hasta llegar a `oNotes`, luego `cd mobile` y repite los pasos 3–6.

## Funcionalidad
- Pestañas separadas de **Notas** y **Recordatorios** para trabajar por flujo.
- Crear, editar y eliminar notas.
- Cada nota admite múltiples recordatorios con fecha y hora, con opciones rápidas: 1 semana antes, 1 día antes o el mismo día a las 00:00.
- Cada nota puede incluir listas tipo to-do con check y tachado.
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
- Si actualizas dependencias, mantén la versión de `@react-native-community/datetimepicker` alineada con la que soporta Expo SDK 51 (ejemplo: `7.6.1`).
- La versión web previa (`frontend/`) sigue disponible para referencia, pero el flujo recomendado es la app Android en `mobile/`.
