Redacción Central — Proyecto SaaS

Documento: PROJECT_OVERVIEW.md
Idioma: Español
Versión: 1.0 (MVP)

## 1. Introducción

Redacción Central es una plataforma SaaS diseñada para que instituciones públicas y privadas gestionen, organicen y publiquen sus notas de prensa y comunicados oficiales de manera profesional, moderna y centralizada.

El objetivo principal es ofrecer un entorno ordenado, accesible y confiable que reemplace el uso disperso de redes sociales, PDFs y sitios web desactualizados. La plataforma también permite que periodistas y el público general accedan a la información de forma clara y sin el ruido informativo de otras plataformas.

## 2. Descripción del proyecto

Redacción Central funciona como una sala de prensa institucional moderna (PR Room) y multi-institucional.

Cada institución contará con un panel privado donde podrá:

Crear y editar notas de prensa

Organizar sus publicaciones

Subir multimedia

Usar herramientas de IA para mejorar la redacción

Publicar notas visibles en su página institucional pública dentro de la plataforma

Los periodistas acreditados podrán acceder gratuitamente a información verificada, mientras que el público general podrá consultar comunicados y notas recientes desde la interfaz principal.

El enfoque inicial se centra en construir un MVP sólido y funcional, preparado para escalar con nuevas características en futuras fases.

## 3. Tipos de usuario

Los usuarios principales del sistema son:

1. Instituciones públicas y privadas

Pueden publicar, gestionar y organizar sus notas institucionales. Son los clientes principales del SaaS.

2. Periodistas acreditados

Acceso gratuito. Pueden consultar notas completas, descargar materiales públicos y seguir instituciones específicas.

3. Público general

Acceso abierto a la información publicada.

## 4. Objetivo del MVP

El objetivo del MVP (MVP Intermedio) es lanzar una versión funcional que permita validar el modelo de negocio y el uso real de la plataforma.

El MVP incluye:

Panel institucional

Creación y edición de notas

Archivo de notas por institución

Mejor buscador

página pública por institución

IA integrada para sugerir titulares, resúmenes y etiquetas

Este MVP debe ser estable, claro y rápido de usar, permitiendo obtener retroalimentación real de instituciones y periodistas.

## 5. Módulos principales del MVP
1. Panel institucional (private dashboard)

Crear nota

Editar nota

Subir imagen principal

Organizar notas por categorías

IA: generar titular, resumen y etiquetas

Página pública institucional

2. Archivo histórico

Lista de notas por institución

Filtros por fecha, categoría y palabras clave

Vista de detalle de cada nota

3. Buscador mejorado

Búsqueda por texto

Búsqueda por institución

Búsqueda por tema/categoría

4. Portal público general

Listado general de notas recientes

Acceso a notas por institución

Página principal de Redacción Central

5. Autenticación y roles

NextAuth para login/logout

Cuenta institucional

Cuenta para periodistas

Acceso público sin autenticación

## 6. Stack tecnológico
Frontend / App

Next.js 16 (App Router)

React con React Compiler

TypeScript

Tailwind CSS

Backend

Server Actions de Next.js

Route Handlers (route.ts) para endpoints HTTP

Lógica de negocio ubicada en /lib o /services

Base de datos

PostgreSQL local en Docker (desarrollo)

Prisma ORM

Preparado para migrar a Neon/Supabase para producción

IA

Gemini 3 para texto institucional

Claude Sonnet para apoyo y pruebas

Integración futura con agentes de Antigravity

Hosting

Vercel

## 7. Alcances y límites del MVP
Alcances

Plataforma funcional con roles básicos

Crear y publicar notas

IA básica integrada

Búsqueda eficiente

Arquitectura lista para escalar

Límites (no incluidos en el MVP)

Estadísticas avanzadas

Programación de publicaciones

Kits de prensa

Descarga de lotes

Moderación avanzada

API pública externa

Estas características forman parte de fases posteriores.

FIN DEL DOCUMENTO