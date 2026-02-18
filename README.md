# Óptica Chile - Sistema de Gestión

Sistema integral para la gestión de ópticas en Chile, incluyendo control de inventario, agenda de citas, recetas oftalmológicas y ventas.

## Características Principales

- **Autenticación Segura**: Integración con Replit Auth (Soporta Google, GitHub, etc.).
- **Gestión de Pacientes**: Perfiles detallados con historial de citas y recetas.
- **Agenda de Citas**: Sistema de reservas para exámenes visuales.
- **Recetas Digitales**: Registro de fórmulas (OD/OS) con diagnóstico.
- **Catálogo y Ventas**: Gestión de stock de armazones, cristales y accesorios.
- **Panel Administrativo**: Control total para staff y administradores.

## Estructura de Usuarios

El sistema utiliza roles para controlar el acceso:
- **Paciente**: Puede ver sus citas, recetas y pedidos.
- **Staff/Admin**: Acceso completo a la gestión de la clínica y ventas.

*Nota: Por defecto, los nuevos usuarios se registran como pacientes. Para cambiar el rol a Staff/Admin, se debe modificar la tabla `user_roles` en la base de datos.*

## Tecnologías Utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend**: Node.js, Express.
- **Base de Datos**: PostgreSQL con Drizzle ORM.
- **Autenticación**: Replit Auth (OIDC).

## Configuración del Entorno

Asegúrese de tener configuradas las siguientes variables de entorno:
- `DATABASE_URL`: Conexión a la base de datos PostgreSQL.
- `SESSION_SECRET`: Secreto para la gestión de sesiones.

## Ejecución

1. Instalar dependencias: `npm install`
2. Sincronizar base de datos: `npm run db:push`
3. Iniciar servidor de desarrollo: `npm run dev`
