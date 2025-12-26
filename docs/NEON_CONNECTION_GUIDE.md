# Guía de Conexión a Base de Datos (Neon) & Scripts

Este documento define la arquitectura de conexión a base de datos para el proyecto `redcen`, asegurando que tanto la aplicación web (Next.js) como los scripts independientes (Scrapers/Cron Jobs) funcionen en armonía.

> [!IMPORTANT]
> **Arquitectura Unificada**: No copies manualmente variables de `.env.local` a `.env`. Los scripts han sido configurados para usar `@next/env` y leer automáticamente la configuración correcta.

## 1. Identificación de Entornos

| Entorno | Rama (Branch) | Compute Endpoint | Uso |
| :--- | :--- | :--- | :--- |
| **Producción** | `production` | `ep-noisy-scene` | Datos reales en vivo. |
| **Desarrollo** | `development` | `ep-late-tree` | Pruebas locales y staging. |

## 2. Strings de Conexión (Referencia)

Si necesitas regenerar tu archivo `.env.local`, usa estos valores:

### 🔴 PRODUCCIÓN (Solo Deployments)
```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD_PLACEHOLDER@ep-noisy-scene-acj8g4yr-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### 🟢 DESARROLLO (Tu Localhost)
```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD_PLACEHOLDER@ep-late-tree-acj8oo2c-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

## 3. Ejecución de Scripts (La Regla de Oro)

Para ejecutar scripts que interactúan con la BD (como el scraper), **NO uses `dotenv` clásico**.

### Forma Correcta (Código)
Todos los scripts en `/jobs` o `/scripts` deben iniciar así:

```typescript
import { loadEnvConfig } from "@next/env"

// Carga .env.local automáticamente, igual que Next.js
loadEnvConfig(process.cwd()) 
```

### Por qué funciona esto
Esto le permite a `dev` y `prod` compartir la misma lógica de carga de variables sin obligarte a mantener archivos duplicados sincronizados manualmente.
