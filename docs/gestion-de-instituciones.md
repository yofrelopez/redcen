# 🏛️ Guía de Gestión de Instituciones (Redcen)
 Esta guía explica cómo agregar, editar o eliminar instituciones que son rastreadas por el robot de noticias.

 ## 📂 Archivos Importantes

 El antiguo sistema de múltiples scripts ha sido reemplazado por un sistema centralizado. Solo necesitas conocer dos archivos:

 1.  **El Registro (TUS DATOS):** `config/institutions-registry.ts`
     *   Este es el único lugar donde debes hacer cambios.
     *   Contiene la lista limpia de instituciones.
 2.  **El Sincronizador (EL ROBOT):** `scripts/sync-institutions.ts`
     *   Este script lee tu registro y actualiza la Base de Datos.

 ---

 ## 🛠️ Cómo Hacer Cambios

 ### 1. Agregar una Nueva Institución
 1.  Abre el archivo `config/institutions-registry.ts`.
 2.  Copia un bloque de institución existente (son los bloques entre llaves `{...}`).
 3.  Pégalo al final de la lista, antes del cierre `]`.
 4.  Modifica los datos:
     *   `name`: Nombre oficial.
     *   `email`: **IMPORTANTE:** Este es el identificador único. Si usas un email nuevo, se creará una cuenta nueva.
     *   `facebookUrl`: El enlace del Fanpage.
     *   `scrapeHour`: El horario de rastreo (6, 12, o 18).
 5.  Guarda el archivo.
 6.  Ejecuta el comando de sincronización:
     ```bash
     npx tsx scripts/sync-institutions.ts
     ```

 ### 2. Editar una Institución
 1.  Busca la institución en `config/institutions-registry.ts` usando su email o nombre.
 2.  Cambia el dato que necesites (ej: cambiar horario de 6 a 12).
 3.  Guarda y ejecuta el comando de sincronización.

 ### 3. Eliminar una Institución
 1.  Borra el bloque completo de la institución en `config/institutions-registry.ts`.
 2.  Ejecuta el comando de sincronización.
 3.  El sistema detectará que ya no está en la lista y **desactivará** su cuenta en la base de datos (no borra sus notas antiguas, solo deja de rastrearla).

 ---

 ## ❓ Preguntas Frecuentes

 **¿Cuál es la contraseña de las nuevas instituciones?**
 Por defecto, se usa la que definas en la variable de entorno `DEFAULT_INSTITUTION_PASSWORD` dentro de tu archivo `.env`. Esto mantiene la seguridad fuera del código.

 **¿Qué pasa con los archivos `seed-institutions.ts.old`?**
 Son copias de seguridad del sistema antiguo. Puedes borrarlos si lo deseas, ya no se usan.
