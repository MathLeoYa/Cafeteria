# Implementation Plan: Identidad y gestión de clientes

**Branch**: `feature/002-identidad-clientes` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-identidad-clientes/spec.md`
**Status**: Propuesta técnica para revisión del equipo (no implementada)

## Summary

Implementar RF-01 y FR-001 a FR-017 mediante dos módulos de dominio dentro del monolito modular NestJS: **Identidad** (cuentas, credenciales, roles, MFA, sesiones, auditoría de seguridad) y **Clientes** (perfil, consentimientos, inventario y derechos de datos). El frontend Next.js ofrece formularios y pantallas accesibles WCAG 2.2 AAA. PostgreSQL conserva los datos persistentes y Redis las sesiones y límites de peticiones. Las operaciones de autenticación y derechos deben ser verificables mediante tests unitarios, integración y E2E.

## Technical Context

- **Language/Version**: TypeScript 5.9 (monorepo actual), Node.js 22; Next.js 15 y NestJS 10 según compilación actual.
- **Primary Dependencies**: NestJS, Next.js y paquetes `@cafeteria/*` ya presentes. **Por decidir y justificar**: librería de acceso a PostgreSQL/migraciones, Argon2id, sesiones Redis, validación de entradas, TOTP y correo de pruebas. Evitar seleccionar paquetes hasta revisar dependencias actuales y ADR.
- **Storage**: PostgreSQL 16 (`identity` y `customers`, dominios separados); Redis 7 para sesiones y limitación de intentos. RabbitMQ solo para eventos o notificaciones cuando exista contrato compartido.
- **Testing**: Jest existente para API y web; integración contra PostgreSQL y Redis reales mediante Testcontainers; Playwright y axe para E2E/accesibilidad, según constitución.
- **Target Platform**: web responsive, frontend Vercel y backend Render; desarrollo local en Windows con Docker Desktop/WSL 2.
- **Project Type**: monorepo web + API, pnpm/Turborepo.
- **Performance Goals**: no hay objetivo numérico específico de latencia para autenticación en `spec.md`; definir y medir posteriormente. Exportación de datos disponible en menos de 1 minuto (SC-005).
- **Constraints**: WCAG 2.2 AAA; OWASP ASVS nivel 2; LOPDP Ecuador; contraseñas de al menos 12 caracteres; enlaces de restablecimiento de 30 minutos; MFA obligatorio para personal y administradores; no exponer existencia de cuentas; despliegue solo mediante CI/CD; sin Python.
- **Scale/Scope**: cuatro historias de usuario (P1: registro/login y acceso del personal; P2: perfil/historial y derechos sobre datos); FR-001 a FR-017.

## Constitution Check

_GATE: debe pasar antes de implementar. Estado actual: diseñado, aún no comprobado mediante tests/revisión._

- [x] **I. Accesibilidad AAA (diseño previsto)**: campos etiquetados, errores vinculados y foco al primer error, teclado, contraste ≥7:1, objetivos ≥44×44, movimiento reducible; revisión manual NVDA/VoiceOver y axe pendiente de ejecutar.
- [x] **II. Seguridad (diseño previsto)**: Argon2id; MFA TOTP para personal/admin; validación de entradas, control de acceso del lado del servidor, rate limiting y secretos fuera del repositorio. No se almacenan datos de tarjeta.
- [x] **III. LOPDP (diseño previsto)**: inventario por campo/finalidad/retención, consentimientos explícitos revocables, PII cifrada por columna y propiedad exclusiva del módulo Clientes; exportación y eliminación/anonimización coordinada.
- [x] **IV. Escalabilidad/consistencia (diseño previsto)**: API sin estado con sesiones Redis; no modifica pedidos ni pagos directamente; integración futura mediante interfaces/eventos, manteniendo consistencia e idempotencia.
- [x] **V. Límites de dominio (diseño previsto)**: esquemas separados, acceso a Clientes por interfaz pública; otros módulos solo usan customerId, nunca las tablas privadas.
- [x] **VI. Calidad (plan previsto)**: pruebas unitarias, integración y E2E; objetivo ≥80 % de cobertura de código nuevo, SonarQube y revisión de hotspots; no se declara el gate aprobado hasta ejecutarlo.
- [x] **VII. Reversibilidad (plan previsto)**: migraciones expand/contract; feature flags para rutas incompletas; commits atómicos, verdes y reversibles.
- [x] **Plataforma (diseño previsto)**: TypeScript/Next.js/NestJS, Vercel/Render, sin Python ni despliegues manuales.

**Observación**: Los checks anteriores validan compatibilidad de la _propuesta_, no cumplimiento de una implementación todavía inexistente. Repetir la comprobación tras diseño e implementación.

## Project Structure

### Documentation (this feature)

```text
specs/002-identidad-clientes/
├── spec.md                       # Existente; requisitos y aceptación
├── checklists/requirements.md    # Existente
├── plan.md                       # Este plan
├── research.md                   # Decisiones, alternativas y amenazas
├── data-model.md                 # Entidades, relaciones y retención
├── quickstart.md                 # Configuración y pruebas locales
├── contracts/                   # OpenAPI y contratos de eventos
└── tasks.md                     # Se genera después del diseño
```

### Source Code (repository root)

```text
apps/
├── api/src/
│   ├── health/                   # Existente
│   ├── identity/                 # Nuevo: credenciales, MFA, roles, sesión, auditoría
│   ├── customers/                # Nuevo: perfil, consentimientos, solicitudes de derechos
│   └── app.module.ts             # Registrar módulos con cambio mínimo
└── web/src/app/
    ├── registro/                 # Nuevo
    ├── iniciar-sesion/           # Nuevo
    ├── verificar-correo/         # Nuevo
    ├── recuperar-contrasena/     # Nuevo
    ├── restablecer-contrasena/   # Nuevo
    └── mi-cuenta/                # Nuevo: perfil, historial y privacidad
packages/shared/                 # Contratos públicos estrictamente necesarios
```

**Structure Decision**: ampliar el monorepo existente, sin crear `backend/` ni `frontend/` paralelos. La estructura concreta interna de persistencia y migraciones se fijará tras revisar `apps/api/package.json` y la arquitectura actual. El historial de pedidos será una lectura mediante contrato público del módulo Pedidos, sin acceso directo a su esquema ni datos ficticios en producción.

## Architecture and Security Decisions

1. **Cuentas y perfiles separados**: `identity` guarda credenciales, estado de cuenta, roles, factores y eventos de seguridad. `customers` guarda PII cifrada, preferencias y consentimientos; ambos se enlazan por identificador opaco.
2. **Autenticación**: hashes Argon2id; cookies de sesión `HttpOnly`, `Secure` en producción y `SameSite` apropiado, protección CSRF para operaciones con cambios de estado, sesiones almacenadas en Redis y revocación inmediata en desactivación o cambio de credenciales. Los clientes deben verificar correo antes de comprar.
3. **No enumeración**: respuestas públicas uniformes de registro/recuperación y medidas de temporización/limitación de intentos. Validar caso de inicio de sesión sin divulgar si el correo existe.
4. **Tokens sensibles**: confirmación y restablecimiento mediante tokens aleatorios de un solo uso, guardados solo como digest, con caducidad; restablecimiento de contraseña 30 minutos conforme FR-003.
5. **MFA**: TOTP para personal y admin, obligatorio antes de operaciones privilegiadas; secretos TOTP cifrados, procedimiento de recuperación con verificación de identidad y auditoría; el bootstrap de administrador se define en `research.md`.
6. **Datos personales**: inventario documentado, claves de cifrado gestionadas fuera del repositorio, diseño de búsqueda de correo que no requiera almacenar PII en texto claro en otros módulos; consentimiento opcional registrado con fecha; anonimización de pedidos mediante contrato con Pedidos.
7. **Eliminación**: reautenticación, bloqueo o aplazamiento si hay pedido activo, eliminación/anonimización acorde al `spec.md`, conservación fiscal estrictamente justificada y confirmación; coordinar el flujo inter-módulo sin acceso directo al esquema de Pedidos.
8. **Auditoría**: registrar eventos relevantes, actor, origen y fecha sin contraseñas, tokens o contenido PII sensible.
9. **Accesibilidad**: formularios HTML semánticos, títulos claros, validación anunciada, foco accesible, soporte de lectores de pantalla y sin bloqueo por cronómetros de interacción.

## Implementation Phases

- **Fase A, investigación y contratos**: revisar dependencias y constitución; definir ADR para ORM/migraciones, sesiones, correo, cifrado y MFA; crear `research.md`, `data-model.md`, `contracts/` y `quickstart.md`.
- **Fase B, infraestructura de identidad**: migraciones, repositorios y tests de integración; variables en `.env.example` sin secretos reales.
- **Fase C, P1 cliente**: registro, confirmación de correo, inicio/cierre de sesión, recuperación de contraseña, límites y tests.
- **Fase D, P1 personal/admin**: invitaciones, roles, MFA, bloqueo de rutas, desactivación y auditoría.
- **Fase E, P2 cliente**: edición del perfil, historial mediante interfaz de Pedidos, consentimientos, exportación y eliminación.
- **Fase F, validación**: pruebas unitarias/integración/E2E, accesibilidad, lint/typecheck/build y Quality Gate; commits atómicos y PR.

## Open Decisions / Research Needed

- Elegir solución de acceso a Postgres y migraciones compatible con NestJS, justificando nueva dependencia.
- Elegir mecanismo de sesiones Redis y coordinación entre Next.js y NestJS (cookies, CSRF, CORS, dominios).
- Definir proveedor de correo de desarrollo y producción y flujo de invitaciones.
- Definir política de cifrado de PII, rotación de claves y búsqueda segura por email.
- Confirmar validación de contraseñas comprometidas sin exponerlas a servicios externos.
- Definir creación segura del primer administrador y recuperación de MFA.
- Confirmar plazo y política LOPDP con responsable legal, incluyendo pedidos en curso y retención fiscal.
- Coordinar contratos con Pedidos y Notificaciones cuando los otros specs se implementen.

## Complexity Tracking

Sin violaciones planificadas de la constitución. Cualquier excepción deberá justificarse aquí y aprobarse antes de implementar.
