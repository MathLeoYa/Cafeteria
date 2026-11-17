# Feature Specification: Notificaciones y tiempo real

**Feature Branch**: `009-notificaciones-tiempo-real`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Módulo de notificaciones multicanal y comunicación en tiempo real: WebSockets y Server-Sent Events (SSE) para actualización en vivo de pedidos (clientes y personal de cocina); envío de correos electrónicos transaccionales accesibles (confirmación de cuenta, recuperación de contraseña, ticket de compra, aviso de pedido listo); gestión de preferencias y consentimientos bajo LOPDP; resiliencia, reintentos con backoff y deduplicación de avisos."

## User Scenarios & Testing *(mandatory)*

Actores: **cliente**, **personal de cafetería** y **sistema de mensajería/notificaciones**.

### User Story 1 - Actualizaciones en vivo del estado de pedidos (Priority: P1)

El cliente ve los cambios de estado de su pedido en pantalla en tiempo real sin recargar la página. Si la conexión se interrumpe temporalmente, el sistema se reconecta automáticamente y sincroniza el estado actual.

**Why this priority**: Evita que el cliente recargue compulsivamente o consulte al personal, mejorando drásticamente la experiencia de espera.

**Independent Test**: Abrir la vista del pedido en un navegador, avanzar el pedido desde la cola de cocina en otra sesión y verificar que el cliente ve el nuevo estado en menos de 3 segundos con anuncio accesible.

**Acceptance Scenarios**:

1. **Dado** un cliente con la pantalla del pedido abierta, **Cuando** el personal avanza el estado a *en preparación* o *listo*, **Entonces** la pantalla se actualiza en menos de 3 segundos sin recarga manual.
2. **Dado** un cambio de estado en vivo, **Cuando** se visualiza, **Entonces** se anuncia inmediatamente mediante regiones vivas ARIA (`aria-live="polite"`) con contraste ≥ 7:1 y sin depender únicamente del color.
3. **Dado** un cliente con corte momentáneo de red, **Cuando** se restablece la conexión, **Entonces** el cliente se reconecta de forma transparente y recibe el último estado consolidado.
4. **Dado** un dispositivo o navegador con soporte restringido de WebSockets bidireccionales, **Cuando** intenta conectarse, **Entonces** el sistema conmuta a un mecanismo de transmisión unidireccional (Server-Sent Events / SSE) de respaldo.

---

### User Story 2 - Notificaciones críticas por correo electrónico (Priority: P1)

El cliente recibe correos transaccionales claros y accesibles en momentos clave: verificación de cuenta, restablecimiento seguro de credenciales, confirmación de compra y aviso de "pedido listo para retirar con código".

**Why this priority**: El correo es el canal asíncrono universal y respaldo formal de la compra y de la seguridad de la cuenta.

**Independent Test**: Completar un pedido y comprobar que llega un correo con el código de retiro, resumen inmutable de precios y formato HTML accesible + versión en texto plano.

**Acceptance Scenarios**:

1. **Dado** un pedido que pasa a *pagado*, **Cuando** se confirma el pago, **Entonces** el cliente recibe un correo de confirmación con el número de pedido, detalle inmutable de compra y código de retiro.
2. **Dado** un pedido que pasa a *listo*, **Cuando** el barista lo marca listo, **Entonces** se despacha un correo de aviso inmediato para retiro en mostrador.
3. **Dado** un correo transaccional recibido, **Cuando** se visualiza en cualquier cliente de correo o lector de pantalla, **Entonces** el texto cumple contraste ≥ 7:1, tipografía legible y cuenta con alternativa en texto plano (`text/plain`).
4. **Dado** un fallo temporal del proveedor de correo saliente, **Cuando** ocurre, **Entonces** el sistema reintenta con retroceso exponencial sin duplicar el mensaje al recuperarse.

---

### User Story 3 - Notificaciones en vivo para la pantalla de cocina del personal (Priority: P1)

El personal de cocina recibe avisos sonoros (configurables) y visuales en su cola de pedidos tan pronto como un nuevo pedido entra como pagado o cambia de condición.

**Why this priority**: La cocina no puede refrescar manualmente una pantalla mientras prepara alimentos; necesita avisos en tiempo real para no demorar la comanda.

**Independent Test**: Realizar un pago simulado y comprobar que la orden ingresa en la cola de cocina inmediatamente con aviso visual y sonoro sutil.

**Acceptance Scenarios**:

1. **Dado** un pedido pagado, **Cuando** se confirma el cobro, **Entonces** la pantalla de pedidos del personal lo muestra de inmediato al inicio de la cola sin intervención manual.
2. **Dado** un entorno ruidoso o accesible, **When** entra un nuevo pedido, **Then** se emite una alerta visual destacada y un tono sonoro que el personal puede pausar o silenciar según sus preferencias.

---

### User Story 4 - Preferencias de comunicación y respeto LOPDP (Priority: P2)

El cliente puede gestionar sus canales preferidos para avisos no esenciales y revocar el consentimiento de comunicaciones promocionales en cualquier momento desde su perfil.

**Why this priority**: Obligación legal (LOPDP) y respeto al cliente contra saturación de mensajes.

**Independent Test**: Desactivar avisos comerciales en el perfil y verificar que el cliente sigue recibiendo correos transaccionales (seguridad y compras), pero no ofertas.

**Acceptance Scenarios**:

1. **Dado** un cliente registrado, **Cuando** accede a sus ajustes de notificaciones, **Entonces** puede elegir si desea recibir avisos por correo/push sobre promociones y novedades.
2. **Dado** un cliente que revoca su consentimiento de marketing, **Cuando** se envía una campaña promocional, **Entonces** el sistema excluye automáticamente su dirección.
3. **Dado** un correo transaccional esencial (reseteo de clave o código de retiro), **Cuando** se despacha, **Entonces** se envía independientemente de las preferencias de marketing.

---

### Edge Cases

- **Reintentos en la cola de eventos**: Si un evento de notificación se procesa más de una vez por entregas repetidas de la cola, el cliente solo recibe un único correo y una sola notificación en pantalla (idempotencia por ID de evento).
- **Caída masiva de conexiones**: Si se reinicia el servidor API, todos los clientes reconectan de forma escalonada con fluctuación aleatoria (*jitter*) para no generar una tormenta de conexiones simultáneas.
- **Correo rebotado o buzón lleno**: El sistema registra el evento de rebote y no reintenta indefinidamente, evitando penalizaciones de reputación de remitente.
- **Usuario navegando en múltiples pestañas o dispositivos**: La actualización del pedido se refleja simultáneamente en todas las pestañas activas del cliente autenticado.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer un canal en tiempo real para empujar eventos de estado de pedidos al navegador del cliente y a la pantalla del personal en menos de 3 segundos desde su ocurrencia.
- **FR-002**: La conexión en tiempo real DEBE autenticar la identidad del usuario y autorizar la suscripción únicamente a los canales de pedidos de su propiedad (o todos los pedidos para el personal autorizado).
- **FR-003**: El sistema DEBE implementar reconexión automática transparente con retroceso exponencial y *jitter* ante desconexiones de red.
- **FR-004**: Los cambios de estado notificados en la interfaz web DEBEN anunciarse mediante tecnologías de asistencia (WCAG 2.2 AAA, regiones `aria-live`).
- **FR-005**: El sistema DEBE enviar correos electrónicos transaccionales para: activación de cuenta, recuperación de contraseña, confirmación de pago con código de retiro, y aviso de pedido listo para entrega.
- **FR-006**: Todos los correos DEBEN incluir versión multiparte (`text/html` accesible y `text/plain` estructurado) con contraste de color ≥ 7:1 y enlaces claros.
- **FR-007**: El despacho de notificaciones DEBE ser asíncrono e impulsado por eventos de dominio procedentes de la cola de mensajería (desacoplado del hilo de la petición HTTP).
- **FR-008**: Cada notificación transaccional DEBE ser idempotente: el sistema DEBE descartar eventos duplicados mediante un identificador único de notificación.
- **FR-009**: El sistema DEBE permitir al cliente configurar y revocar preferencias de avisos no esenciales conforme a la LOPDP, garantizando la entrega incondicional de avisos transaccionales esenciales de seguridad y compra.

### Key Entities

- **Evento de Notificación**: ID único, tipo de evento (`pedido_pagado`, `pedido_listo`, `recuperar_clave`), destinatario, canal (email, websocket), carga de datos y marca temporal.
- **Plantilla de Notificación**: Identificador, asunto, versión HTML accesible, versión texto plano y variables requeridas.
- **Registro de Despacho (Delivery Log)**: ID de mensaje, proveedor externo, estado de entrega (enviado, rebotado, fallido), intentos y fecha.
- **Preferencia de Comunicación**: ID de cliente, canal autorizado, categoría de mensaje (transaccional, marketing/promociones) y fecha de consentimiento.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 98 % de las actualizaciones de estado de pedidos se entregan a la interfaz del cliente conectado en menos de 2 segundos desde la publicación del evento en la cola.
- **SC-002**: Los correos transaccionales críticos (código de retiro y reseteo de contraseña) se despachan al proveedor externo en menos de 10 segundos tras la confirmación de la acción.
- **SC-003**: 0 correos transaccionales duplicados ante reintentos de red o caídas de workers.
- **SC-004**: El 100 % de las plantillas de correo cumplen los criterios de accesibilidad visual (contraste ≥ 7:1, texto alternativo en imágenes y tipografía responsive).
- **SC-005**: Cero filtraciones de eventos entre usuarios: ningún cliente recibe eventos o datos de pedidos ajenos.

---

## Assumptions

- El envío de correos salientes se realiza a través de un servicio SMTP transaccional configurado en variables de entorno.
- El volumen de notificaciones transaccionales está cubierto por el escalado horizontal de la API y los workers sin retención en memoria de estado de conexión compartida.
- Los clientes web modernos soportan WebSockets o Server-Sent Events sobre HTTPS.

