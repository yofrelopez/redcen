# Sistema de Generación con IA ("Magic URL")

## 1. Visión General
El módulo "Magic URL" permite a los redactores generar noticias completas en formato Redcen (HTML) a partir de un simple enlace (URL) de un medio externo. El sistema extrae el contenido, lo limpia, descarga imágenes y reescribe el texto utilizando Inteligencia Artificial para adaptarlo a un tono periodístico neutral.

**Ubicación en Dashboard:** `/dashboard/notas/generador`

---

## 2. Arquitectura del Flujo
El proceso ocurre íntegramente en el servidor (Server Actions) para proteger las llaves de API y evadir bloqueos CORS.

### Paso 1: Extracción (`lib/scraper/web-extractor.ts`)
1.  **Request HTTP**: Se utiliza `axios` con User-Agents rotativos para simular un navegador real.
2.  **Parsing DOM**: `jsdom` reconstruye el HTML en memoria.
3.  **Limpieza Inteligente**: `@mozilla/readability` elimina anuncios, popups y menús, dejando solo el texto principal.
4.  **Extracción Multimedia**:
    *   **Imágenes**: Detecta `og:image` y busca en el cuerpo del artículo.
    *   **Videos**: Detecta iframes de YouTube, Vimeo, Facebook y etiquetas `<video>` nativas (.mp4/webm).

### Paso 2: Procesamiento IA (`lib/ai/web-processor.ts`)
*   **Motor**: Groq SDK (Llama3-70b-8192 o similar).
*   **Prompt Engineering**:
    *   Se instruye a la IA para actuar como "Periodista Digital Senior".
    *   **Control de Longitud**: Si el original tiene >500 palabras, resume a ~400. Si es corto, mantiene la longitud.
    *   **Formato**: Salida estrictamente JSON con campos para título, resumen, contenido HTML, categoría sugerida y metadatos SEO.

### Paso 3: Persistencia (`actions/generate-from-url.ts`)
1.  **Validación**: Verifica que la URL no haya sido procesada anteriormente (evita duplicados).
2.  **Creación**: Guarda la nota en estado `published: false` (Borrador) en la tabla `PressNote`.
3.  **Tipo**: Se asigna automáticamente el tipo `Noticia` (NEWS).

---

## 3. Componentes Clave

### Frontend
*   **`MagicUrlInput`**: Componente de UI con animaciones (Framer Motion) y gestión de estados (Loading, Success, Error). Usa los colores institucionales: `#002FA4` (Azul Redcen) y `#F44E00` (Naranja Redcen).

### Backend
*   **Manejo de Errores**: Sistema granular que diferencia entre fallos de red (Scraping), fallos de IA y fallos de base de datos.
*   **Protección Timeout**: Configurado con `maxDuration = 60` segundos para evitar cortes en Vercel (Hobby Tier).

---

## 4. Limitaciones y Consideraciones

### Infraestructura (Vercel)
*   **Consumo de CPU**: El proceso de extracción + IA es intensivo. En el plan gratuito (Hobby), el uso excesivo puede agotar las 4 horas mensuales de cómputo.
*   **Solución**: Se ha detenido el scraper automático (`daily-scraper.yml`) para reservar recursos exclusivamente para este generador manual.

### Multimedia
*   **Imágenes**: Se hace "Hotlinking" a las imágenes originales. Si el medio original borra la imagen, dejará de verse en Redcen. (Mejora futura: Subir a Cloudinary).
*   **Videos**: Se insertan como embeds. No se descargan los archivos de video.

### Facebook Auto-Publish
*   Las notas generadas **NO** se publican automáticamente en Facebook. Se crean como borradores para revisión humana obligatoria antes de salir al aire.

---

## 5. Guía de Solución de Problemas (Troubleshooting)

| Síntoma | Causa Probable | Solución |
| :--- | :--- | :--- |
| **Error 500 (Inmediato)** | Límite de CPU Vercel excedido | Revisar *Settings > Billing*. Esperar reinicio de ciclo o Upgrade. |
| **Error "No se pudo extraer"** | Sitio web bloquea bots (WAF) | Intentar con otra URL o fuente distinta. |
| **Generación lenta (>30s)** | Artículo muy largo o Groq saturado | Normal. El timeout está extendido a 60s. |
| **Nota sin imagen** | La web original usa imágenes en background CSS | Subir imagen manualmente en el editor de Redcen. |
