# 📘 Sistema de Integración Facebook (Smart Queue)

Este documento describe la arquitectura y funcionamiento del sistema **"Facebook Smart Queue"** implementado en REDCEN para la difusión automática de noticias.

## 🧠 ¿Qué es la "Cola Inteligente"?

Es un mecanismo de defensa y organización que impide la saturación de publicaciones en la Fanpage. En lugar de publicar todo inmediatamente (lo cual podría ser marcado como spam por Facebook o abrumar a los seguidores), el sistema organiza las noticias en una fila ordenada.

### La Regla de los 11 Minutos
El sistema verifica automáticamente la última publicación *programada* en el futuro.
1.  **Si la cola está vacía**: La nota se publica **inmediatamente**.
2.  **Si ya hay notas en espera**: La nueva nota se programa para **11 minutos después** de la última nota agendada.

---

## 📂 Componentes del Sistema

El sistema está modularizado en 4 partes clave dentro del código fuente:

### 1. El Cerebro (Servicio Principal)
*   **Archivo**: [`lib/services/facebook.ts`](../lib/services/facebook.ts)
*   **Responsabilidad**:
    *   Hospeda la clase `FacebookService`.
    *   Ejecuta la lógica de `smartQueuePublish` (decidir fecha/hora).
    *   Se comunica directamente con la **Graph API** de Facebook.
    *   Actualiza la base de datos con la fecha de programación real.

### 2. Los Disparadores (Triggers)
Son los eventos que activan el servicio.

*   **Ingesta Automática (Scraper/IA)**
    *   **Archivo**: [`app/api/webhooks/ingest/route.ts`](../app/api/webhooks/ingest/route.ts)
    *   **Función**: Cuando el sistema detecta una noticia nueva externa, intenta publicarla automáticamente si cumple las condiciones.
    
*   **Creación Manual (CMS)**
    *   **Archivo**: [`actions/notes.ts`](../actions/notes.ts)
    *   **Función**: Cuando un redactor humano crea una nota desde el panel de administración y marca "Publicar", el sistema también la envía a la cola de Facebook.

### 3. Utilidades de Prueba
*   **Archivo**: `scripts/local/test-fb.ts` (Ignorado por Git)
*   **Función**: Script aislado que permite a los desarrolladores probar la conexión y credenciales de Facebook sin necesidad de crear contenido real en la base de datos.
*   **Generador de Tokens**: [`scripts/get-permanent-token.js`](../scripts/get-permanent-token.js) (Para renovar credenciales).

### 4. Configuración
*   **Archivo**: `.env`
*   **Variables Requeridas**:
    *   `FB_PAGE_ID`: El identificador numérico de la Fanpage Principal.
    *   `FB_PAGE_ACCESS_TOKEN`: Token de la página principal.
    *   `FB_SECONDARY_PAGE_ACCESS_TOKEN`: Token de la página de eco (Barranca Noticias).

---

## 🔐 Gestión de Credenciales y Tokens (GUÍA TÉCNICA)

Esta sección explica cómo funcionan los tokens de Facebook y cómo generarlos correctamente para evitar que caduquen.

### 1. Tipos de Tokens y su Ciclo de Vida

Facebook tiene 3 niveles de tokens. Es CRÍTICO entender la diferencia:

| Tipo | Duración | ¿Para qué sirve? | Nivel de Seguridad |
| :--- | :--- | :--- | :--- |
| **Token de Usuario Corto** | 1 hora | Pruebas rápidas en el navegador. Se obtiene en el *Graph API Explorer*. | 🔴 Bajo (Caduca muy rápido) |
| **Token de Usuario Largo** | 60 días | Se obtiene intercambiando el "Corto" + "App Credentials". Es el puente necesario. | 🟡 Medio |
| **Token de Página "Permanente"** | **Indefinido*** | Se obtiene usando el "Usuario Largo". Solo deja de funcionar si cambias tu contraseña de Facebook. **ESTE ES EL QUE NECESITAMOS.** | 🟢 Alto (Producción) |

*> \*Indefinido: Significa que no tiene fecha de expiración automática, pero puede revocarse por cambios de seguridad en la cuenta personal.*

### 2. ¿Por qué fallan los tokens?

El error común es hacer esto:
❌ *Token Corto (Explorer) -> Obtener Token de Página -> Usarlo en el Bot.*
**Resultado:** El Token de Página hereda la vida del corto. **Muere en 1 hora.**

El camino correcto es:
✅ *Token Corto -> **CANJE (Script)** -> Token de Usuario Largo -> Obtener Token de Página -> Usarlo en el Bot.*
**Resultado:** Token sin fecha de expiración configurada.

### 3. Guía Paso a Paso para Generar Tokens "Permanentes"

No necesitas Business Manager estrictamente si usas este método de "Canje de Token".

**Requisitos Previos:**
- Tener una App creada en [developers.facebook.com](https://developers.facebook.com).
- Tener el `App ID` y `App Secret` de esa App.
- Ser Administrador de la Fanpage.

**Pasos de Ejecución:**

1.  **Obtener Token Semilla (Corto):**
    - Ve a [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
    - Selecciona tu App.
    - Permisos: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`.
    - Generar Access Token. Copialo.

2.  **Ejecutar Script de Intercambio:**
    REDCEN incluye una herramienta automatizada para hacer el canje criptográfico.
    
     Ejecuta en tu terminal:
    ```bash
    node scripts/get-permanent-token.js
    ```

3.  **Seguir Instrucciones del Script:**
    - Pega tu `App ID`.
    - Pega tu `App Secret`.
    - Pega el Token Semilla (Corto).

4.  **Resultado:**
    - El script te dará un Token nuevo y largo para cada página que administres.
    - Copia el token correspondiente a "Barranca Noticias" y pégalo en tu `.env` como `FB_SECONDARY_PAGE_ACCESS_TOKEN`.

⚠️ **Nota Importante:** Este proceso NO afecta a los tokens que ya tengas configurados (como el de Redcen). Cada token es independiente. Si el de Redcen funciona, **NO LO TOQUES**. Solo genera el nuevo para Barranca Noticias.
