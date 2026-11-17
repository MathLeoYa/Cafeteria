# Feature Specification: Cierre de caja, turnos y propinas

**Feature Branch**: `016-arqueo-caja-turnos`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Gestión de turnos de personal y cuadre de caja (arqueo) para la operación diaria de la cafetería: apertura de turno con fondo inicial de cambio; registro y conciliación de cobros físicos y digitales (efectivo, tarjetas, transferencias); arqueo ciego o asistido al cierre de turno con justificación obligatoria de faltantes o sobrantes; gestión, cómputo y distribución transparente de propinas (tips) entre el equipo de baristas; bitácora inmutable de auditoría para la administración."

## User Scenarios & Testing *(mandatory)*

Actores: **cajero / barista de turno**, **encargado de turno**, **administrador** y **cliente** (aportante de propina).

### User Story 1 - Apertura de turno con fondo de caja (Priority: P1)

Al comenzar la jornada o turno de servicio, el cajero o barista inicia sesión en la caja física, verifica y registra el monto del fondo inicial (efectivo base para cambio) y da apertura oficial al turno de cobro.

**Why this priority**: Es la condición previa imprescindible para poder cobrar pedidos en efectivo y controlar la custodia del dinero.

**Independent Test**: Iniciar un nuevo turno ingresando un fondo de $50.00 en efectivo; verificar que el estado de la caja pasa a *abierta* y los pedidos en efectivo quedan asociados a este turno activo.

**Acceptance Scenarios**:

1. **Dado** un miembro del personal autorizado en el punto de cobro, **Cuando** abre el turno e introduce el conteo del fondo inicial, **Entonces** el sistema valida el importe, registra al responsable y marca la caja como *abierta*.
2. **Dado** un intento de cobrar un pedido en efectivo sin una caja abierta, **Cuando** se intenta procesar el cobro, **Entonces** el sistema lo bloquea y solicita realizar la apertura de turno primero.
3. **Dado** una caja con un turno previo no cerrado, **Cuando** un nuevo usuario intenta abrirla, **Entonces** el sistema exige cerrar formalmente el turno anterior antes de iniciar el nuevo.

---

### User Story 2 - Arqueo de caja y cuadre al cierre de turno (Priority: P1)

Al finalizar el turno, el cajero realiza el conteo físico del dinero en caja (billetes y monedas) y los comprobantes físicos de datáfono. El sistema compara el conteo contra las ventas registradas por el software, calcula faltantes o sobrantes y genera el acta de cierre.

**Why this priority**: Garantiza la transparencia financiera y previene fugas de dinero o errores humanos no detectados.

**Independent Test**: Registrar $100 en efectivo y $50 en tarjeta; realizar el arqueo ingresando el conteo exacto y validar que el balance reporta descuadre cero y emite el resumen de cierre.

**Acceptance Scenarios**:

1. **Dado** un turno activo al finalizar el horario, **Cuando** el cajero inicia el cierre de turno, **Entonces** la interfaz le solicita ingresar el conteo por denominaciones de billetes y monedas.
2. **Dado** el conteo físico ingresado, **Cuando** se confirma el arqueo, **Entonces** el sistema compara automáticamente el total teórico del sistema (fondo inicial + cobros en efectivo - salidas autorizadas) contra el dinero contado.
3. **Dado** una discrepancia monetaria (faltante o sobrante), **Cuando** se presenta la diferencia, **Entonces** el sistema exige ingresar un motivo justificado obligatorio antes de permitir el cierre definitivo.
4. **Dado** el turno cerrado, **Cuando** se completa el arqueo, **Entonces** el resumen queda bloqueado contra modificaciones y se genera un reporte inmutable firmado digitalmente por el responsable.

---

### User Story 3 - Registro de movimientos menores de caja chica (Priority: P2)

El personal autorizado puede asentar salidas o entradas justificadas de efectivo durante el turno (ej. compra urgente de hielo, pago de taxi para despacho de emergencia o reposición de cambio menor).

**Why this priority**: Evita falsos descuadres en el arqueo final provocados por gastos operativos menores del día a día.

**Independent Test**: Registrar una salida de $5.00 por "Hielo de emergencia"; verificar que el total teórico de efectivo disminuye automáticamente en $5.00 y queda justificado en el arqueo.

**Acceptance Scenarios**:

1. **Dado** un turno de caja abierto, **Cuando** el encargado registra una salida de efectivo menor, **Entonces** debe indicar el monto exacto, la categoría de gasto y adjuntar la referencia del comprobante físico.
2. **Dado** un retiro de efectivo, **Cuando** el importe supera el límite autorizado de caja menor, **Entonces** el sistema exige la aprobación digital del administrador antes de autorizar la salida.

---

### User Story 4 - Gestión, acumulación y reparto de propinas (Priority: P2)

El cliente puede añadir una propina voluntaria al pagar su pedido con tarjeta o digitalmente (10 %, 15 %, monto personalizado). El sistema totaliza las propinas digitales y físicas del turno y calcula el reparto equitativo para los baristas participantes.

**Why this priority**: Motiva al equipo, estandariza un proceso comúnmente informal y brinda transparencia a clientes y trabajadores.

**Independent Test**: Procesar 3 pedidos con propinas de tarjeta que sumen $12.00; al cierre de turno, verificar que el sistema detalla los $12.00 a distribuir equitativamente entre los 2 baristas asignados.

**Acceptance Scenarios**:

1. **Dado** un cliente en la pantalla de pago con tarjeta, **Cuando** decide agregar una propina voluntaria, **Entonces** el importe se suma de forma diferenciada al cobro total sin aplicar impuestos de venta sobre la propina.
2. **Dado** el cierre de turno, **When** se totalizan los ingresos, **Then** el sistema presenta el importe neto total de propinas digitales acumuladas en el turno.
3. **Dado** el equipo de baristas que prestó servicio durante el turno, **Cuando** se liquida el arqueo, **Entonces** el sistema sugiere el cálculo proporcional del reparto de propinas según las horas trabajadas por cada empleado.

---

### Edge Cases

- **Corte de energía o falla de conexión durante el arqueo**: La información del conteo parcial se guarda localmente en el navegador y se sincroniza al restablecer la red sin perder los datos ya contados.
- **Cobro de pedidos en efectivo tras el cierre**: El sistema impide terminantemente registrar ventas en un turno cerrado; cualquier venta requiere la apertura del turno siguiente.
- **Descuadres significativos superiores al margen de tolerancia**: Si un faltante supera un monto umbral predefinido (ej. > $20.00), el sistema envía una notificación inmediata al administrador y exige la doble firma del supervisor.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE exigir la apertura explícita de turno con registro de fondo de cambio inicial antes de permitir transacciones en efectivo.
- **FR-002**: Toda transacción de cobro presencial (efectivo, tarjeta física o transferencia) DEBE asociarse al turno de caja activo en el momento de la confirmación.
- **FR-003**: El proceso de arqueo de caja DEBE permitir el ingreso desglosado por denominaciones monetarias (monedas y billetes) mediante controles accesibles por teclado (WCAG 2.2 AAA).
- **FR-004**: El sistema DEBE calcular automáticamente el balance teórico y determinar con exactitud centésima cualquier sobrante o faltante respecto al conteo físico.
- **FR-005**: Ante cualquier discrepancia entre el conteo y el total esperado, el sistema DEBE requerir una justificación textual obligatoria antes de autorizar el cierre del turno.
- **FR-006**: El sistema DEBE permitir registrar ingresos y egresos de efectivo menor (caja chica) con registro de monto, categoría, concepto y usuario responsable.
- **FR-007**: El sistema DEBE registrar las propinas digitales de forma contable separada de los ingresos gravados de la cafetería, excluyéndolas de la base imponible de ventas.
- **FR-008**: Al cierre de turno, el sistema DEBE calcular el informe de liquidación de propinas acumuladas para su distribución entre el personal operativo del turno.
- **FR-009**: Una vez cerrado el turno, el acta de arqueo DEBE quedar en estado inmutable; ninguna venta posterior puede alterar retroactivamente el turno finalizado.
- **FR-010**: El administrador DEBE contar con reportes históricos de arqueos de caja, comparativas de desviaciones de efectivo y trazabilidad de turnos por empleado.

### Key Entities

- **Turno de Caja**: ID, punto de cobro / terminal, empleado responsable, fecha/hora de apertura, fondo inicial, fecha/hora de cierre, estado (abierto, cerrado, auditado) y supervisor de cierre.
- **Arqueo de Caja**: ID de turno, total efectivo teórico, total efectivo contado, total tarjetas cobradas, total transferencias, sobrante/faltante, justificación y observaciones.
- **Movimiento de Caja Menor**: ID, turno, tipo (ingreso de cambio, egreso de gasto menor), monto, concepto, comprobante de respaldo y autor.
- **Registro de Propinas**: ID de pedido, turno, monto de propina, método de pago, estado de liquidación y destinatarios del reparto.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El personal completa el proceso de arqueo y cierre de turno en menos de 5 minutos mediante la interfaz guiada por teclado.
- **SC-002**: 100 % de los cobros en efectivo y terminal física quedan vinculados inequívocamente a un turno de caja auditado.
- **SC-003**: 0 modificaciones retroactivas permitidas sobre turnos ya cerrados y asentados en el sistema.
- **SC-004**: Los reportes de propinas reflejan el 100 % de las donaciones voluntarias con total desglose y cero mezcla con la base imponible comercial.
- **SC-005**: Los formularios de denominaciones monetarias y arqueo cumplen con WCAG 2.2 AAA (sin límites arbitrarios de tiempo y con etiquetas semánticas para lectores de pantalla).

---

## Assumptions

- Cada punto de cobro físico cuenta con una gaveta de dinero en efectivo custodiada por el cajero asignado.
- Las propinas registradas con tarjeta se liquidan periódicamente según las políticas laborales y acuerdos del equipo de la cafetería.
- La administración establece los montos máximos autorizados para gastos menores de caja chica sin autorización previa.

