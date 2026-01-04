# Project Plan: Redcen AI Radio (Noticiero Automático)

## 1. Concepto
Un "Flash Informativo" diario de 3-5 minutos, generado 100% por Inteligencia Artificial cada mañana.
**Objetivo:** Ofrecer una alternativa de consumo rápido para usuarios móviles/conductores y aumentar la retención en el sitio.

## 2. Workflow Automático
El sistema se ejecutará diariamente (Cron Job) siguiendo estos pasos:

### Fase 1: Selección (El Editor)
-   **Input:** Base de datos de Redcen (PostgreSQL).
-   **Lógica:** Seleccionar las 5-7 noticias más relevantes de las últimas 24 horas.
-   **Criterio:** Mayor número de visitas, etiquetas "Destacado", o noticias de última hora.

### Fase 2: Guionización (El Periodista AI)
-   **Herramienta:** OpenAI GPT-4o (o Claude 3.5 Sonnet).
-   **Prompt:** *"Actúa como un locutor de radio profesional de Tarija. Tienes estas 5 noticias. Escribe un guion fluido, energético y connnectado para un flash de 3 minutos. Incluye saludo y despedida de 'Redacción Central'."*
-   **Output:** Texto estructurado listo para leer.

### Fase 3: Locución (La Voz)
-   **Herramienta:** ElevenLabs (Modelo Multilingual v2) o OpenAI Audio API (TTS-1-HD).
-   **Voz:** Clonada o predefinida (estilo noticiero serio pero cálido).
-   **Costo:** ~$0.30 USD por noticiero (dependiendo de la duración).

### Fase 4: Producción (El Editor de Audio)
-   **Herramienta:** `ffmpeg` (Procesamiento de audio por código).
-   **Proceso:**
    1.  Generar el audio de la voz.
    2.  Mezclar con una "cortina musical" de fondo (loop suave de noticias).
    3.  Añadir intro/outro de marca ("Estás escuchando... Redcen").

### Fase 5: Distribución
-   Se guarda el archivo MP3 en almacenamiento (S3 / R2 / UploadThing).
-   Se actualiza el componente "AudioPlayer" en el Home de Redcen.

## 3. Stack Tecnológico Sugerido
-   **Backend:** Next.js Server Actions / API Route (CRON).
-   **IA Texto:** OpenAI API (`gpt-4o`).
-   **IA Voz:** ElevenLabs API (Calidad de estudio).
-   **Procesamiento:** `fluent-ffmpeg` (Node.js).
-   **Frontend:** Reproductor web sticky (mini-player).

## 4. Estimación de Costos (Mensual)
| Recurso | Uso Estimado | Costo Aprox (USD) |
| :--- | :--- | :--- |
| ElevenLabs | ~100 min/mes | $22 (Creator tier) o Pay-as-you-go |
| OpenAI GPT-4 | 30 guiones | ~$2.00 |
| Hosting Audio | Cloudflare R2 | Gratis (capa gratuita generosa) |
| **TOTAL** | | **~$25 USD / mes** |

## 5. Próximos Pasos (Hoja de Ruta)
1.  **Prototipo Manual:** Generar un guion y audio manualmente para probar la calidad de la voz.
2.  **Player Web:** Crear el componente visual en la web.
3.  **Backend Script:** Escribir el script que une DB -> GPT -> Audio.
4.  **Automatización:** Configurar el Cron Job en Vercel.
