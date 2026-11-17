# Feature Specification: Programa de fidelización y puntos

**Feature Branch**: `012-programa-fidelizacion`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Programa de fidelización y recompensas para la cafetería: acumulación de sellos digitales de café (ej. 10º café gratis) y puntos por importe de compra; niveles de membresía con beneficios progresivos; canje de recompensas y cupones directamente en el carrito de compras; consulta accesible del saldo e historial de beneficios; reglas de caducidad y coexistencia con el motor de promociones y descuentos."

## User Scenarios & Testing *(mandatory)*

Actores: **cliente**, **personal de cafetería** y **administrador**.

### User Story 1 - Acumular sellos y puntos al pagar pedidos (Priority: P1)

Cada vez que un cliente autenticado realiza un pedido que pasa a estado *pagado*, el sistema acredita automáticamente los sellos de bebidas consumidas y los puntos según el importe neto de la compra.

**Why this priority**: Es la mecánica base para incentivar la recurrencia y premiar la lealtad de compra.

**Independent Test**: Completar la compra de 2 cafés por valor de $6.00 y comprobar que el balance del cliente refleja 2 sellos adicionales y 6 puntos acreditados de inmediato.

**Acceptance Scenarios**:

1. **Dado** un cliente con cuenta activa que paga un pedido con productos que califican para sellos (ej. bebidas de café preparadas), **Cuando** el pedido pasa a *pagado*, **Entonces** se acreditan los sellos correspondientes de forma automática.
2. **Dado** un pedido pagado, **Cuando** se calcula la acreditación, **Entonces** se otorgan puntos basados en el importe efectivamente cobrado (excluyendo gastos de envío o descuentos previos).
3. **Dado** un cliente que visualiza su perfil o cabecera de la tienda, **Cuando** consulta su saldo, **Entonces** ve su tarjeta digital de sellos y su saldo de puntos disponible con texto legible y accesible (contraste ≥ 7:1).
4. **Dado** un pedido que se cancela o reembolsa, **Cuando** se procesa la devolución, **Entonces** los sellos y puntos otorgados por ese pedido se deducen automáticamente.

---

### User Story 2 - Canjear un café gratis o recompensa en el checkout (Priority: P1)

Al acumular los sellos necesarios (ej. 9 sellos), el cliente desbloquea una recompensa (ej. "Café gratis"). Puede aplicar la recompensa en su carrito para obtener el producto sin costo o aplicar puntos para descontar saldo.

**Why this priority**: El canje tangible de la recompensa es el momento de mayor valor percibido por el cliente.

**Independent Test**: Aplicar una recompensa de café gratis a un carrito con una bebida elegible y verificar que el precio de la bebida se descuenta a $0.00 en el servidor y el sello o cupón se descuenta del saldo.

**Acceptance Scenarios**:

1. **Dado** un cliente que completa los sellos requeridos de su tarjeta, **Cuando** alcanza la meta, **Entonces** el sistema genera una recompensa de cortesía con vigencia definida y notifica al usuario.
2. **Dado** un cliente con una recompensa disponible en su carrito con productos elegibles, **When** selecciona "Aplicar recompensa", **Then** el servidor recalcula el total descontando el importe del producto bonificado.
3. **Dado** un cliente que desea usar puntos para pagar parte de su orden, **Cuando** define la cantidad de puntos a canjear, **Entonces** el sistema valida la equivalencia monetaria y aplica el descuento respectivo.
4. **Dado** un pedido confirmado con recompensa aplicada, **Cuando** se crea la orden, **Entonces** la recompensa o los puntos quedan consumidos de manera irreversible (o restaurados si el pedido se cancela antes de pagarse).

---

### User Story 3 - Niveles de lealtad y beneficios especiales (Priority: P2)

Los clientes que alcanzan ciertos volúmenes de consumo acumulado suben de nivel (Bronce, Plata, Oro), obteniendo multiplicadores de puntos, promociones exclusivas y café de cortesía en el día de su cumpleaños.

**Why this priority**: Diferencia y fideliza a los consumidores habituales de mayor valor.

**Independent Test**: Simular un consumo que cruce el umbral de nivel Plata y validar que los pedidos posteriores aplican el multiplicador de puntos configurado para dicho nivel.

**Acceptance Scenarios**:

1. **Dado** un cliente cuyo volumen anual supera el umbral del nivel superior, **Cuando** se procesa el pedido calificador, **Entonces** su cuenta se promueve de nivel y recibe un mensaje accesible de felicitación.
2. **Dado** un cliente en nivel avanzado (ej. Oro con 1.5x puntos), **Cuando** realiza una compra, **Entonces** la asignación de puntos aplica el multiplicador correspondiente de forma transparente y detallada en el resumen.
3. **Dado** la fecha de cumpleaños del cliente (dato opcional consentido bajo LOPDP), **Cuando** llega su mes o día de aniversario, **Entonces** se le asigna un cupón de cortesía válido durante el periodo establecido.

---

### User Story 4 - Consulta de historial de puntos y caducidad transparente (Priority: P2)

El cliente puede revisar en cualquier momento la bitácora completa de puntos acumulados, canjeados y próximos a expirar, recibiendo avisos preventivos accesibles antes del vencimiento.

**Why this priority**: Garantiza transparencia, confianza y previene insatisfacción por pérdida de beneficios.

**Independent Test**: Consultar el historial de transacciones de puntos y verificar que cada movimiento muestra fecha, concepto (pedido, canje, ajuste), valor y saldo resultante.

**Acceptance Scenarios**:

1. **Dado** un cliente en su panel de fidelización, **Cuando** consulta el historial, **Entonces** visualiza una tabla accesible con fecha, motivo, entrada/salida y saldo resultante.
2. **Dado** puntos con fecha próxima de caducidad (ej. vencimiento a los 12 meses), **Cuando** faltan 30 días, **Entonces** el sistema emite un aviso preventivo para invitar al cliente a aprovecharlos.

---

### Edge Cases

- **Compatibilidad con otras promociones**: Las reglas del spec 005 aplican: el administrador configura si una recompensa por fidelización puede combinarse o no con cupones de festividades en la misma compra.
- **Concurrencia de canje**: Si el cliente intenta canjear el mismo saldo de puntos en dos sesiones o pestañas abiertas simultáneas, una transacción se autoriza y la otra se rechaza por saldo insuficiente (idempotencia y bloqueo pesimista/optimista en el servidor).
- **Cancelación de cuenta bajo LOPDP**: Si el cliente solicita eliminar su cuenta, los puntos acumulados se extinguen y el registro histórico de canjes se disocia de sus datos personales directos.
- **Modificación administrativa de puntos**: Si el personal compensa a un cliente por una mala experiencia otorgándole puntos de cortesía, el ajuste queda registrado en la bitácora con motivo y autor.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mantener un registro de sellos de consumo de café y saldo de puntos por cada cliente registrado.
- **FR-002**: La acreditación de puntos y sellos DEBE ejecutarse de forma asíncrona tras la confirmación del pago del pedido (`pedido_pagado`), garantizando que no se acrediten beneficios por pedidos cancelados o impagos.
- **FR-003**: El sistema DEBE soportar la configuración de metas de sellos (ej. 10 sellos = 1 café de cortesía) y emitir recompensas canjeables automáticas al alcanzar la meta.
- **FR-004**: El cálculo del descuento por canje de puntos o recompensas DEBE validarse estrictamente en el servidor en el momento del checkout.
- **FR-005**: El sistema DEBE soportar niveles de lealtad con multiplicadores de puntos y reglas de ascenso/mantenimiento basadas en el consumo de los últimos 12 meses.
- **FR-006**: La interfaz de visualización de la tarjeta de sellos y saldo de puntos DEBE ser completamente accesible según WCAG 2.2 AAA (indicadores textuales de progreso, contraste ≥ 7:1 y compatibilidad total con lectores de pantalla).
- **FR-007**: Toda adición, descuento, canje o expiración de puntos DEBE quedar registrada en una bitácora inmutable de movimientos de fidelización.
- **FR-008**: Si un pedido pagado con canje de puntos o recompensa es cancelado por la cafetería, el sistema DEBE restituir íntegramente los puntos y recompensas consumidos al saldo del cliente.
- **FR-009**: El sistema DEBE alertar al cliente antes de la fecha de caducidad de sus puntos mediante los canales de notificación configurados.
- **FR-010**: El administrador DEBE poder configurar las tasas de conversión de puntos a saldo monetario, productos elegibles para sellos y reglas de coexistencia con promociones generales.

### Key Entities

- **Cuenta de Fidelización**: ID de cliente, saldo actual de puntos, sellos acumulados en ciclo actual, nivel de membresía y fecha de última actividad.
- **Movimiento de Fidelización**: ID de transacción, cuenta, tipo de operación (crédito por compra, débito por canje, expiración, ajuste manual, bono), puntos, sellos, ID de pedido relacionado y fecha.
- **Recompensa Otorgada**: ID de recompensa, tipo (café gratis, descuento fijo, porcentaje), fecha de emisión, fecha de vencimiento, estado (disponible, canjeada, vencida) y pedido donde se aplicó.
- **Configuración de Nivel**: Nombre de nivel (Bronce, Plata, Oro), consumo mínimo requerido, multiplicador de puntos y beneficios adicionales.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los puntos y sellos de compras confirmadas se acreditan a la cuenta del cliente en menos de 5 segundos tras el evento de pago.
- **SC-002**: 0 casos de doble canje o saldo negativo ante peticiones concurrentes de checkout.
- **SC-003**: La tarjeta visual de fidelización y los controles de canje superan las auditorías de accesibilidad sin alertas de contraste ni elementos no etiquetados para tecnologías de asistencia.
- **SC-004**: Los pedidos con recompensas reflejan en el desglose de precios el valor exacto bonificado con 0 descuadres de centavos.
- **SC-005**: La restitución de puntos en cancelaciones se ejecuta automáticamente sin necesidad de tickets de soporte técnico.

---

## Assumptions

- Solo los clientes registrados y autenticados acumulan sellos y puntos (las compras como invitado o sin cuenta no acumulan puntos retrospectivos a menos que se vincule el correo verificado).
- Los puntos no son canjeables por dinero en efectivo físico, únicamente por descuentos y productos en la cafetería.
- Los impuestos (IVA) se calculan sobre el valor efectivamente facturado tras descontar los beneficios del programa.

