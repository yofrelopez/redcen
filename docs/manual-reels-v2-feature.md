# Documentación de Funcionalidad: Video Reels v2 (Manual & Galería)

Este documento detalla las mejoras implementadas en el generador de video (`audio-news-worker`) para soportar galerías de imágenes, control editorial y medidas de seguridad.

## 1. Soporte de Galería de Imágenes
El sistema ahora soporta la visualización de múltiples imágenes rotativas para una sola noticia.

### Flujo de Datos
1.  **Base de Datos (`Prisma`)**: Se lee el campo `gallery` (Array de Strings) de la tabla `PressNote`.
2.  **Selector (`news-selector.ts`)**: Se incluyó explícitamente el campo `gallery` en la consulta SQL.
3.  **Lógica Visual (`video-generator.ts`)**:
    - Se "resuelven" las rutas locales a URLs HTTP accesibles por Remotion.
    - Se pasan las imágenes al objeto `segment`.
4.  **Componente (`NewsSlide.tsx`)**:
    - Recibe la prop `gallery`.
    - Lógica de rotación: `currentImage = allImages[Math.floor(frame / durationPerSlide)]`.
    - Duración mínima por slide: 2.5 segundos (para evitar parpadeo en noticias cortas).

## 2. Mejoras Editoriales (Script & Audio)
Se han endurecido las reglas del "Script Writer" (`script-writer.ts`) para garantizar tono periodístico y pronunciación correcta.

### Reglas de Neutralidad
- **Condicionalidad:** El robot evita sentencias absolutas sobre delitos no probados. Usa verbos como *"habría"*, *"presuntamente"*, *"al parecer"*.
- **Atribución:** Se exige citar fuentes ("según la denuncia").

### Reglas de Pronunciación
- **Acrónimos:** Para evitar que Google TTS deletree siglas (ej: "E-M-S-E-M-S-A"), se instruye a la IA a escribirlas en formato Título ("Emsemsa", "Sunat", "Reniec").
- **Header:** El video ahora muestra **"REDACCIÓN CENTRAL"** (o "MATUTINA") en lugar de "EDICIÓN".

## 3. Seguridad y Control Manual
Para evitar errores en producción y mantener la calidad visual.

### Restricciones Técnicas (`index.ts`)
1.  **Ejecución Manual Estricta:** El modo Reel (`--mode=reel`) requiere OBLIGATORIAMENTE el argumento `--links`. Si no se provee, el proceso falla (Exit 1).
2.  **Límite de 1 URL:** Se bloquea la ejecución de múltiples enlaces simultáneos (`links.length > 1`) para evitar errores de sincronización visual (herencia de imágenes entre bloques).

### Desactivación Automática
- Se ha comentado el `schedule` (Cron) en `.github/workflows/daily-reel.yml` para prevenir ejecuciones fantasma.

## 4. Archivos Clave Modificados
- `scripts/audio-news-worker/index.ts`: Punto de entrada y restricciones.
- `scripts/audio-news-worker/lib/video-generator.ts`: Lógica de video y cabeceras.
- `scripts/audio-news-worker/lib/script-writer.ts`: Inteligencia del guion (Prompt).
- `scripts/audio-news-worker/remotion/components/NewsSlide.tsx`: Renderizado visual.

---
**Estado (Enero 2026):** Estable y en Producción (Rama `main`).
