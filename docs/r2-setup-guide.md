# Guía de Configuración: Credenciales Cloudflare R2 y OpenAI

Esta guía te ayudará a obtener las variables de entorno necesarias para que el **Audio News Worker** funcione correctamente.

> **Nota Importante:** La verificación anterior fue una "prueba estructural" (dry-run). El sistema **no funcionará realmente** hasta que configures estas claves en GitHub Secrets.

## 1. Cloudflare R2 (Almacenamiento de Audio)

Necesitamos 4 valores: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

### Paso 1: Obtener Account ID
1. Inicia sesión en [Cloudflare Dashboard](https://dash.cloudflare.com/)..
2. **IMPORTANTE:** R2 está en el menú de la **CUENTA**, no dentro de un dominio específico.
   *   Si estás viendo la lista de tus dominios, mira la **barra lateral izquierda** global.
   *   Busca **R2 Object Storage** (a veces bajo "Storage & Databases" o simplemente "R2").
   *   Si no lo ves, ve a `https://dash.cloudflare.com/{TU_ACCOUNT_ID}/r2` (reemplazando `{TU_ACCOUNT_ID}` con el ID que sale en tu URL actual antes de `/home`).
   *   **Nota:** Es posible que Cloudflare te pida añadir una tarjeta de crédito para activar R2. Esto es normal para verificar identidad y prevenir abusos. **No te cobrarán nada** siempre que no pases de 10GB de almacenamiento o 10 millones de lecturas al mes (algo muy difícil de superar con este proyecto).
3. En la página principal de R2, busca en la columna derecha el apartado **Account Details**.
4. Copia el **Account ID** (una cadena larga de números y letras).
   *   **Variable:** `R2_ACCOUNT_ID`

### Paso 2: Crear el Bucket
1. En la página principal de R2, haz clic en **Create Bucket**.
2. Dale un nombre único (ej. `redcen-audio-news`).
3. Haz clic en **Create Bucket**.
   *   **Variable:** `R2_BUCKET_NAME` = `redcen-audio-news` (o el nombre que hayas elegido).

### Paso 3: Crear Credenciales (Access Keys)
1. Vuelve a la página principal de R2.
2. Haz clic en el enlace **Manage R2 API Tokens** (a la derecha).
3. Haz clic en **Create API Token**.
4. Configuración:
    *   **Token name:** `Audio Worker Key`
    *   **Permissions:** Selecciona **Object Read & Write**.
    *   **TTL:** "Forever" (o lo que prefieras).
5. Haz clic en **Create API Token**.
6. **¡IMPORTANTE!** Copia los valores que aparecen. **Solo se muestran una vez.**
    *   **Access Key ID:** Copia este valor.
        *   **Variable:** `R2_ACCESS_KEY_ID`
    *   **Secret Access Key:** Copia este valor.
        *   **Variable:** `R2_SECRET_ACCESS_KEY`

### Paso 4: Configurar Acceso Público (Obtener URL)
Para que los usuarios puedan escuchar el audio, el bucket debe ser público.
1. Entra en tu bucket (`redcen-audio-news`).
2. Ve a la pestaña **Settings**.
3. Busca **Public Access**.
4. Opción A (Rápida): **R2.dev Subdomain**.
    *   Haz clic en "Allow Access".
    *   Copia la URL (ej. `https://pub-xyz.r2.dev`).
5. Opción B (Profesional): **Custom Domain** (Recomendado para Redcen).
    *   Haz clic en "Connect Domain".
    *   Escribe un subdominio (ej. `audio.redcen.com`).
    *   Sigue los pasos para activar el DNS.
    *   Tu URL será `https://audio.redcen.com`.
6. **Variable:** `R2_PUBLIC_DOMAIN` (sin barra al final).

---

## 2. OpenAI (Voces)

1. Ve a [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Haz clic en **Create new secret key**.
3. Dale un nombre (ej. `Redcen Worker`).
4. **Variable:** `OPENAI_API_KEY`

---

## 3. Resumen de Variables para GitHub Secrets

Ve a tu repositorio en GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Añade estas 5 claves:

| Nombre Secreto | Valor Ejemplo |
| :--- | :--- |
| `R2_ACCOUNT_ID` | `7de1234a588...` |
| `R2_ACCESS_KEY_ID` | `f839...` |
| `R2_SECRET_ACCESS_KEY` | `8a92...` |
| `R2_BUCKET_NAME` | `redcen-audio-news` |
| `R2_PUBLIC_DOMAIN` | `https://audio.redcen.com` |
| `OPENAI_API_KEY` | `sk-...` |

*(Recuerda también `GROQ_API_KEY` y `DATABASE_URL` que ya se mencionaron antes)*.
