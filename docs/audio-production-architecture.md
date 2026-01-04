# Audio News: Análisis de Arquitectura para Producción

## 1. El Desafío (Por qué Vercel es complicado)
Anteriormente encontraste problemas con los límites de Vercel (Optimización de Imágenes). El uso para **Generación de Audio** enfrenta obstáculos similares y más estrictos:

*   **Límite de Tamaño del Paquete (250MB):** El binario de `ffmpeg` (esencial para mezclar audio, música e intro) es pesado. Incluirlo a menudo rompe el límite de las Serverless Functions.
*   **Tiempo de Ejecución (Timeout):**
    *   **Vercel Pro:** Máximo 300 segundos (5 minutos) *si se configura*. El predeterminado suele ser menor.
    *   **Tiempo de Procesamiento:** Generar TS + Mezclar 3-5 minutos de audio es intensivo para la CPU. Un solo retraso o reintento podría agotar el tiempo de la función, dejándote con datos parciales.
*   **Límites de CPU:** Las funciones serverless tienen CPU limitada. Los filtros complejos de `ffmpeg` podrían ejecutarse más lento que el tiempo real.

> [!WARNING]
> Construir esto directamente en una Next.js API Route en Vercel es de **Alto Riesgo** para timeouts y fallos de despliegue.

---

## 2. Solución Recomendada: GitHub Actions (Cron)
Dado que esta es una **Tarea Programada Diaria** (no activada por el usuario en tiempo real), no necesitamos latencia de sub-segundos.

**Estrategia:** Ejecutar un script "Worker" diariamente vía GitHub Actions.
1.  **Horario:** 6:00 AM todos los días (`cron: '0 6 * * *'`).
2.  **Entorno:** Runner Estándar de Ubuntu (El nivel gratuito incluye 2000 min/mes).
3.  **Proceso:**
    *   Descargar código (Checkout).
    *   Instalar `ffmpeg` (un comando: `sudo apt-get install ffmpeg`).
    *   Ejecutar script Node.js: Obtener Noticias -> Generar Guion -> Generar Audio -> Mezclar -> Subir a R2.
4.  **Costo:** **$0** (muy dentro de los 2000 minutos/mes gratuitos para repos privados). Un trabajo diario de 5 minutos = ~150 minutos/mes.

### Alternativa: VPS (DigitalOcean/Coolify)
*   **Pros:** Control total, puedes ejecutar software especializado.
*   **Cons:** Costo mensual mínimo ($4-6/mes), mantenimiento (actualizar SO, reiniciar servicios).
*   **Veredicto:** Excesivo a menos que tengas otros servicios para ejecutar.

---

## 3. Análisis de Costos (Estimación Mensual)

Ejecutando diariamente (30 días/mes), aprox. 5 minutos de audio por día.

| Componente | Servicio | Nivel/Uso | Costo Est. (USD) |
| :--- | :--- | :--- | :--- |
| **Cómputo** | **GitHub Actions** | ~150 min/mes | **$0.00** (Nivel Gratuito de GitHub)* |
| **Almacenamiento**| **Cloudflare R2** | < 1GB almacenamiento | **$0.00** (Capa Gratuita) |
| **Base de Datos** | Neon (Postgres) | Consultas de lectura | **$0.00** (Capa Gratuita) |
| **Voz IA** | **Opción A: OpenAI** | `tts-1-hd` (~3k caracteres/día)| **~$2.70 / mes** |
| | **Opción B: ElevenLabs** | Plan Starter (30k caracteres/mes*)| **$5.00 / mes** |

*Nota sobre GitHub 2026: Los runners estándar siguen consumiendo de la cuota gratuita en repos privados.
*Nota sobre caracteres: 3 mins de habla son aprox. 450 palabras ≈ 2,500-3,000 caracteres.
*   **OpenAI TTS:** ~$0.030 por 1k caracteres (HD). 3k caracteres * 30 días = 90k caracteres. 90 * $0.03 = $2.70.
*   **ElevenLabs:** El plan de alta calidad de 100k caracteres cuesta aprox. $22/mes. El starter de $5 da 30k caracteres (muy poco para uso diario). Necesitarías el **Plan Creator ($22/mes)** o quedarte con OpenAI por presupuesto.

---

## 4. Flujo de Trabajo Propuesto
1.  **Base de Datos:** Redcen DB almacena las noticias.
2.  **GitHub Action (Diario 6 AM):**
    *   `npm run generate-daily-news`
3.  **Lógica del Script:**
    *   Autentica con la DB.
    *   Selecciona las top 5 noticias.
    *   **GPT-4o:** Escribe el guion.
    *   **OpenAI TTS / ElevenLabs:** Genera segmentos de voz crudos.
    *   **FFmpeg (Local en el Runner):** Toma segmentos + Intro.mp3 + Fondo.mp3 -> Mezcla en `final_news_FECHA.mp3`.
    *   **Subida:** Sube al bucket de Cloudflare R2.
    *   **Actualización:** Escribe la URL en la tabla "DailyBrief" de la DB.
4.  **Frontend:** El sitio web de Redcen obtiene la última URL de "DailyBrief" y la reproduce.

## 5. Próximos Pasos
*   **Aprobar Arquitectura:** ¿Procedemos con GitHub Actions?
*   **Seleccionar Proveedor de Voz:** OpenAI (Estándar/Bueno, Barato) vs ElevenLabs (Premium, Caro).
