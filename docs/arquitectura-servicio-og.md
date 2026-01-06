# Plan de Arquitectura: Servicio Centralizado de Imágenes (OG Image Service)

## 1. El Problema Actual (Diagnóstico)
Actualmente tenemos una **inconsistencia crítica** en cómo se generan las imágenes de portada para Facebook:

1.  **Robot Scraper:** ✅ **Funciona.** Usa una lógica interna compleja (`services/og-generator.ts`) que descarga, edita y sube la imagen final a Cloudinary **antes** de publicar.
2.  **Robot de Audio:** ❌ **Falla.** Intenta delegar el trabajo a la página web "en tiempo real". Facebook llega antes de que la imagen esté lista, resultando en post sin foto.
3.  **Duplicidad:** Si quisiéramos arreglar el Robot de Audio copiando el código del Scraper, tendríamos dos copias de la misma lógica. Si cambias el logo de la marca, tendrías que editar dos archivos. Eso es mala ingeniería.

## 2. La Solución Profesional: "Single Source of Truth"
En lugar de enseñarle al Robot de Audio a diseñar imágenes, crearemos un **Servicio API Interno** en la web Principal.

> **Filosofía:** "La Web es la experta en diseño. Los robots son solo empleados que piden diseños a la Web."

### Arquitectura Propuesta

1.  **Nuevo Endpoint (API):** `POST /api/services/og-generator`
    *   Este endpoint es el "Departamento de Diseño".
    *   Recibe: Título, Autor, Imagen Cruda (DALL-E).
    *   Ejecuta: La misma lógica robusta que usa el Scraper (`services/og-generator.ts`).
    *   Devuelve: La URL final de Cloudinary (`https://res.cloudinary.com/...`).

2.  **Cliente (Audio Worker):**
    *   Ya no inserta datos incompletos.
    *   Antes de guardar, le dice a la Web: *"Genérame la portada oficial"*.
    *   Recibe la URL lista y la guarda en la base de datos.

## 3. Hoja de Ruta Técnica (Paso a Paso)

### Paso 1: Crear el Endpoint (La "Fábrica")
**Archivo:** `app/api/services/og-generator/route.ts` (Nuevo)

*   **Seguridad:** Protegido por `INGEST_API_SECRET` (igual que el webhook de ingestión). Nadie público puede usar este servicio para gastar tus créditos de Cloudinary.
*   **Lógica:**
    *   Importa `generateStaticOgImage` de `@/lib/services/og-generator`.
    *   Recibe JSON: `{ title, authorName, mainImage, slug }`.
    *   Ejecuta la generación y retorna `{ success: true, url: "..." }`.

### Paso 2: Actualizar el Robot de Audio (El "Cliente")
**Archivo:** `scripts/audio-news-worker/lib/db-publisher.ts`

*   **Modificación:**
    *   Antes de hacer el `INSERT` final a la base de datos...
    *   Hacer un `fetch()` al nuevo servicio `POST /api/services/og-generator`.
    *   Obtener la URL de la imagen generada.
*   **Database:** Insertar esta URL en la columna `"ogImage"` de la tabla `PressNote`.

### Paso 3: Limpieza Final
*   Eliminar el "parche" de pre-calentamiento (`fetch HEAD`) en el webhook `trigger-social`, ya que ahora la imagen existirá físicamente antes de que Facebook sea invocado.

## 4. Beneficios Tangibles

1.  **Consistencia de Marca:** Si mañana decides cambiar el gradiente o la fuente en `og-generator.ts`, TODOS tus robots (Scraper, Audio y futuros) se actualizarán automáticamente.
2.  **Velocidad en Facebook:** Como la imagen ya está generada y subida a Cloudinary ("Static"), Facebook la descargará en milisegundos. Adiós al "cuadro blanco".
3.  **Código Limpio:** El Robot de Audio se mantiene ligero. No necesita dependencias de diseño ni saber de Cloudinary Layers. Solo hace una llamada HTTP.

## 5. Validación del Plan
El éxito se confirma si:
1.  El Robot de Audio corre y dice "OG Image Generated: [URL]".
2.  Esa URL abre la imagen brandeada en el navegador.
3.  Al publicar en Facebook, la imagen carga instantáneamente.

¿Procedemos a construir esta arquitectura?
