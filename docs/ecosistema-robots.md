# 🤖 Ecosistema de Robots de Redacción Central

Este documento detalla el funcionamiento, arquitectura y flujo de datos de los agentes automatizados ("Robots") que operan en `redcen.com`.

## 1. Visión General
Existen dos robots principales que alimentan la plataforma:
1.  **News Scraper (Ingest):** Recolecta noticias de fuentes externas.
2.  **Audio Worker (Podcast):** Genera un boletín diario en audio con IA.

Ambos convergen en la Web (Next.js) y se conectan a **Facebook** para la difusión automática.

---

## 2. Los Robots

### A. Robot Scraper (Ingest)
*   **Función:** Lee RSS/Webs de terceros, extrae contenido e imágenes.
*   **Frecuencia:** Ejecución periódica (Cron).
*   **Destino:** Base de Datos (Neon Postgres) a través de limpieza y validación.
*   **Social:**
    *   Al guardar una nota, detecta si es nueva.
    *   Llama internamente al `FacebookService` de la web.
    *   **Resultado:** Publicación automática en Fanpage con Link/Imagen.

### B. Robot Productor de Audio (Daily Audio News)
*   **Ubicación:** `scripts/audio-news-worker` (Ejecutado por GitHub Actions).
*   **Frecuencia:** Diaria (10:00 AM UTC / 6:00 AM Tarija).
*   **Flujo de Trabajo:**
    1.  **Selección:** Busca las 5 noticias más relevantes en la BD (excluyendo sus propios reportes anteriores).
    2.  **Guionista (Llama 3):** Escribe un guion de radio estilo "noticiero dinámico".
    3.  **Locutor (Google Cloud TTS):** Convierte texto a voz neuronal (`es-US-Neural2`).
    4.  **Productor (FFmpeg):** Mezcla voz + Intro + Outro + Música de fondo (ajustada con `loudnorm`).
    5.  **Hosting (Cloudflare R2):** Sube el MP3 final y obtiene un **Enlace Público** (Requiere `R2_PUBLIC_DOMAIN`).
    6.  **Publicación:** Inserta la nota "Podcast" en la BD con el reproductor de audio.

---

## 3. 🌉 El "Puente Social" (Nueva Integración)
*Antes, el Robot de Audio vivía aislado y Facebook no se enteraba de sus publicaciones.*

### Solución Implementada: Webhook `trigger-social`
Se creó un mecanismo para conectar el Robot de Audio (GitHub) con el servicio de Facebook (Vercel).

**Nuevo Flujo:**
1.  El Audio Worker termina su trabajo y guarda la nota en la BD.
2.  **El Worker "Toca el Timbre":** Hace una petición POST a `https://redcen.com/api/webhooks/trigger-social`.
3.  **La Web Responde:**
    *   Verifica la seguridad (`Bearer INGEST_API_SECRET`).
    *   Busca la nota por su `slug`.
    *   Activa el `FacebookService` (Smart Queue).
4.  **Facebook Recibe:** Publica el enlace al episodio ("Escucha el resumen...").

---

## 4. Requisitos de Configuración (Secrets)

Para que todo el orquesta suene bien, estas variables son obligatorias en **GitHub Secrets**:

| Variable | Uso |
| :--- | :--- |
| `R2_PUBLIC_DOMAIN` | **Vital**. Sin esto, el link de audio es privado y nadie lo escucha. (Ej: `https://pub-xxx.r2.dev`) |
| `SITE_URL` | La dirección de la web para llamar al webhook. (Ej: `https://redcen.com`) |
| `INGEST_API_SECRET` | La contraseña para autorizar el uso del "Puente Social". |
| `GOOGLE_CREDENTIALS_JSON` | Credenciales de Google TTS. |
| `DATABASE_URL` | Acceso a Neon DB. |
| `CLOUDINARY_*` | Para subir la portada generada por DALL-E. |

---

## 5. Mantenimiento
*   **Fallos de Audio:** Revisar logs de GitHub Actions. Si dice "403 Forbidden" en el audio, falta `R2_PUBLIC_DOMAIN`.
*   **Fallos de Facebook:** Revisar logs de Vercel. Si dice "Unauthorized", revisar `INGEST_API_SECRET`.
