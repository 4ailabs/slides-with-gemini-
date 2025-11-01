# 📂 Cómo Ver tus Slides Guardadas

## 🗂️ Slides Guardadas Manualmente

### Paso 1: Abre el menú "Exportar / Más"
Cuando tienes slides generadas, verás un botón azul que dice **"Exportar / Más"** en la parte superior de la pantalla.

### Paso 2: Click en "Cargar Presentación"
En el menú desplegable, verás la sección **"Guardar / Cargar"**:
- "Guardar Presentación" - Para guardar tu trabajo actual
- **"Cargar Presentación"** ← Aquí es donde están tus slides guardadas

### Paso 3: Visualiza tus presentaciones
Se abrirá un diálogo que muestra todas tus presentaciones guardadas con:
- 📝 Nombre de la presentación
- 📊 Número de slides
- 📅 Fecha de última actualización
- 👁️ Botón "Cargar" para abrir la presentación
- 🗑️ Botón "Eliminar" para borrar presentaciones antiguas

### Ejemplo:
```
┌─────────────────────────────────────┐
│  📁 Presentaciones Guardadas       │
├─────────────────────────────────────┤
│  📄 Presentación de Marketing       │
│  15 slides • 31/10/2025            │
│  [Cargar] [Eliminar]               │
├─────────────────────────────────────┤
│  📄 Historia del Espacio            │
│  8 slides • 30/10/2025             │
│  [Cargar] [Eliminar]               │
└─────────────────────────────────────┘
```

## ⏳ Historial Automático

### Cómo funciona:
- El historial se guarda **automáticamente** cada 2 segundos cuando editas
- Se guardan hasta **50 snapshots** de tu trabajo
- El más antiguo se elimina automáticamente
- Los datos se guardan en localStorage del navegador

### Dónde ver el historial:
Actualmente el historial automático está implementado pero no tiene UI. Para activarlo:

**Opción 1**: Usar undo/redo
- Teclas: `Ctrl+Z` / `Ctrl+Y` (Windows/Linux) o `Cmd+Z` / `Cmd+Y` (Mac)
- Botones: Undo/Redo en la barra de herramientas

**Opción 2**: Presentaciones guardadas manualmente
- Guarda tu trabajo con un nombre cuando estés satisfecho
- Así puedes recuperarlo más tarde

## 📍 Ubicación en la UI

```
┌─────────────────────────────────────────────────────────┐
│  AI Slide Generator                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Slide actual mostrada aquí]                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Editar] [Lista] [⬅️] [1/5] [➡️]                       │
│  [Exportar / Más ▼]  ← Click aquí                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo Completo

### Guardar una presentación:
1. Genera tus slides
2. Click en "Exportar / Más"
3. Click en "Guardar Presentación"
4. Ingresa un nombre (ej: "Mi Presentación")
5. ✅ Guardado exitoso

### Cargar una presentación:
1. Con slides abiertas, click en "Exportar / Más"
2. Click en "Cargar Presentación"
3. Lista de todas tus presentaciones
4. Click en "Cargar" en la que quieras abrir
5. ✅ Presentación cargada

### Ver historial automático:
1. Edita tus slides
2. Espera 2 segundos (auto-guardado)
3. Usa Ctrl+Z/Ctrl+Y para undo/redo
4. ✅ Navegación por historial

## 💾 Storage Information

### Presentaciones Guardadas:
- **Storage Key**: `slides_presentations`
- **Máximo**: 50 presentaciones
- **Lugar**: localStorage del navegador
- **Estructura**: 
  ```typescript
  {
    id: string,
    name: string,
    slides: Slide[],
    createdAt: number,
    updatedAt: number
  }
  ```

### Historial Automático:
- **Storage Key**: `slides_history`
- **Máximo**: 50 snapshots
- **Lugar**: localStorage del navegador
- **Estructura**:
  ```typescript
  {
    id: string,
    slides: Slide[],
    timestamp: number,
    preview: string
  }
  ```

## 🎯 Diferencias

| Feature | Presentaciones Guardadas | Historial Automático |
|---------|-------------------------|---------------------|
| **Visibilidad** | ✅ UI completa | ⏳ Pendiente UI |
| **Control** | Manual (tú eliges) | Automático cada 2s |
| **Nombre** | ✅ Personalizado | ❌ Timestamp |
| **Límite** | 50 presentaciones | 50 snapshots |
| **Acceso** | Menú "Cargar" | Ctrl+Z/Ctrl+Y |
| **Propósito** | Trabajos finales | Recuperar ediciones |

## 🚀 Próximas Mejoras

Para ver el historial automático con UI, se podría agregar:
1. Tab en el diálogo "Cargar Presentación"
2. Dos secciones: "Guardadas" y "Historial"
3. Timeline visual del historial
4. Buscar por fecha/hora
5. Previews de cada snapshot

¿Quieres que implemente la UI del historial automático?

