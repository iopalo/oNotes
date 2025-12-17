# oNotes

Aplicación React para crear notas con recordatorios locales.

## Estructura
- `frontend/`: proyecto Vite con React y un estado global via `useReducer` para notas y recordatorios.

## Uso
1. Instala dependencias (Node 18+):
   ```bash
   cd frontend
   npm install
   ```
2. Ejecuta la app en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Genera el build de producción:
   ```bash
   npm run build
   ```
4. Previsualiza el build:
   ```bash
   npm run preview
   ```

## Notas y recordatorios
- Cada nota permite definir múltiples recordatorios con fecha y hora.
- Los datos se guardan automáticamente en `localStorage`, por lo que al recargar el navegador se mantienen las notas y sus recordatorios.
- Los recordatorios se programan con `setTimeout` en el navegador: cuando llega la hora aparecen avisos en la sección "Recordatorios activos". Mantén la pestaña abierta para recibirlos.
- Puedes descartar un aviso individual o limpiar todos los avisos mostrados.

## Componentes principales
- `NotesList`: lista las notas existentes y permite editar o eliminar.
- `NoteForm`: formulario para crear o actualizar notas y gestionar sus recordatorios asociados.
- `ReminderScheduler`: interfaz para añadir y eliminar recordatorios con fecha y hora.
- Estado global con `NotesProvider` (`useReducer`) que maneja notas y persistencia.

## Cómo probarla en el celular
- Para ver la app en un teléfono real con el servidor de desarrollo, ejecuta:
  ```bash
  npm run dev -- --host --port 4173
  ```
  Luego abre `http://<tu-ip-local>:4173/` desde el navegador del celular conectado a la misma red.
- Si prefieres un emulador, usa las DevTools del navegador (Ctrl+Shift+M en Chrome/Firefox) y elige un dispositivo móvil.
- La UI es responsive: en pantallas estrechas, el encabezado y las tarjetas se apilan en una sola columna para facilitar la lectura y el toque.
