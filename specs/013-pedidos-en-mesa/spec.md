# Feature Specification: Consumo en local (Dine-In con QR)

**Feature Branch**: `013-pedidos-en-mesa`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Pedidos para consumo en el local (dine-in) mediante códigos QR en mesa: escaneo de código QR o ingreso manual del número de mesa accesible por teclado; apertura de comanda de mesa con envío directo a cocina con indicador de ubicación física; modalidades de pago en línea inmediato o pago al finalizar el servicio; opción de llamar al camarero/solicitar asistencia; gestión de mesas y auditoría operativa."

## User Scenarios & Testing *(mandatory)*

Actores: **cliente comensal**, **camarero/barista**, **personal de cocina** y **administrador**.

### User Story 1 - Identificar mesa e iniciar comanda accesible (Priority: P1)

El cliente que llega a la cafetería se sienta en una mesa, escanea el código QR situado en ella (o ingresa manualmente el número de mesa si no puede o no desea usar la cámara) y accede de inmediato al menú interactivo asociado a su mesa.

**Why this priority**: Es el punto de inicio para el autoservicio en salón, eliminando tiempos muertos de espera por la carta física.

**Independent Test**: Escanear el QR de la Mesa 5 o escribir "5" en el campo accesible; comprobar que la cabecera indica claramente "Mesa 5" y los productos agregados al carrito llevan esa procedencia.

**Acceptance Scenarios**:

1. **Dado** un cliente en una mesa física, **Cuando** escanea el código QR, **Entonces** se abre la aplicación web reconociendo y fijando automáticamente el número de mesa.
2. **Dado** un cliente con dificultades motrices, lector de pantalla o cámara no funcional, **Cuando** accede a la web, **Entonces** puede ingresar el número o código de mesa mediante un campo de texto estándar accesible (WCAG 2.2 AAA).
3. **Dado** una mesa ya seleccionada, **When** el cliente navega el menú y añade productos, **Then** el carrito indica claramente que el pedido será servido en su mesa.
4. **Dado** un número de mesa inactivo o inexistente, **Cuando** se intenta asociar, **Entonces** el sistema informa con claridad y solicita ayuda al personal sin bloquear la aplicación.

---

### User Story 2 - Confirmación de comanda y despacho a cocina con identificador de mesa (Priority: P1)

El cliente confirma los productos elegidos para su mesa. La orden se transmite en tiempo real a la cola de preparación de la cocina y del barista con la etiqueta destacada del número de mesa.

**Why this priority**: Permite que el personal prepare y entregue el café directamente en la mesa correcta sin confusiones.

**Independent Test**: Confirmar un pedido en la Mesa 3 y verificar que en la pantalla de cocina aparece de inmediato como comanda "Mesa 3 - Consumo en local".

**Acceptance Scenarios**:

1. **Dado** un pedido confirmado en mesa, **Cuando** se genera la orden, **Entonces** la pantalla de cocina muestra de manera destacada "MESA #" con tipografía de alto contraste y aviso sonoro sutil.
2. **Dado** un pedido preparado por el barista, **Cuando** pasa a estado *listo*, **Entonces** se notifica al camarero de salón para que lo lleve a la mesa indicada.
3. **Dado** el cliente en su mesa, **Cuando** la cocina avanza la preparación, **Entonces** el cliente ve el estado de su orden en su propio teléfono en tiempo real.

---

### User Story 3 - Modalidades de pago para salón (Priority: P1)

El cliente puede pagar su comanda inmediatamente desde su teléfono con tarjeta de crédito/débito, o bien seleccionar "Pagar al terminar" (en caja o al mesero con efectivo/datáfono).

**Why this priority**: Proporciona flexibilidad según las costumbres de consumo del cliente en el salón.

**Independent Test**: Crear un pedido en mesa con opción "Pagar al camarero" y verificar que el personal puede cobrarlo y cerrarlo en mesa.

**Acceptance Scenarios**:

1. **Dado** el checkout en mesa, **Cuando** el cliente elige "Pagar ahora con tarjeta", **Entonces** completa el pago seguro en la pasarela y la comanda entra a cocina como *pagada*.
2. **Dado** un cliente que prefiere "Pagar al finalizar", **Cuando** confirma, **Entonces** el pedido entra en cocina como *pendiente de cobro en mesa*.
3. **Dado** un cliente listo para retirarse con pago pendiente, **When** solicita la cuenta, **Then** el camarero ve el total consolidado, cobra en efectivo o datáfono y cierra la comanda en el sistema.

---

### User Story 4 - Asistencia en mesa ("Llamar al camarero") (Priority: P2)

El cliente puede presionar una acción accesible en su pantalla para solicitar asistencia del personal (ej. servilletas, dudas de alérgenos, retirar vajilla usada o pedir la cuenta).

**Why this priority**: Mejora el confort del comensal y optimiza el recorrido del personal en salón.

**Independent Test**: Presionar "Llamar al camarero" desde la Mesa 2 y comprobar que en el panel del personal de salón surge una alerta visual accesible indicando el requerimiento.

**Acceptance Scenarios**:

1. **Dado** un comensal en la Mesa 4, **Cuando** selecciona "Solicitar asistencia" e indica el motivo (o asistencia general), **Entonces** la terminal del camarero recibe una alerta en tiempo real con la mesa solicitante.
2. **Dado** una solicitud atendida, **Cuando** el camarero confirma la atención, **Entonces** la alerta se desmarca y la pantalla del cliente confirma la atención recibida.
3. **Dado** solicitudes reiteradas en un periodo corto, **Cuando** se pulsa repetidamente, **Entonces** el sistema evita saturar a la cocina agrupando los llamados con aviso preventivo.

---

### Edge Cases

- **Mesa compartida por múltiples personas**: Varios comensales en la misma mesa pueden escanear el mismo QR; el sistema permite enviar pedidos individuales asociados a la misma mesa sin mezclar los cargos si deciden pagar por separado.
- **Cliente que cambia de mesa físicamente**: El personal puede reasignar un pedido activo de una mesa a otra desde el panel de salón sin cancelar la orden en cocina.
- **Uso accidental del QR fuera del establecimiento**: Si una persona escanea el QR desde su casa por error, el sistema le recuerda que esa opción es exclusiva para consumo presencial y le ofrece cambiar a "Retiro en tienda" o "Entrega a domicilio".
- **Comensal que abandona la mesa con pago pendiente**: El administrador puede cancelar la comanda con registro de pérdida justificada en la bitácora de auditoría.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir identificar mesas mediante enlace directo generado por código QR o por ingreso manual accesible del identificador de mesa.
- **FR-002**: Toda la navegación del menú, selección de mesa y pedido en salón DEBE cumplir plenamente con WCAG 2.2 AAA (sin elementos táctiles menores a 44x44 px y con foco visible por teclado).
- **FR-003**: Los pedidos generados en esta modalidad DEBEN etiquetarse inequívocamente con el tipo *consumo en local* y el identificador de mesa correspondiente.
- **FR-004**: La cola de cocina y de preparación DEBE mostrar con alta visibilidad y prioridad el número de mesa para servicio en salón.
- **FR-005**: El sistema DEBE admitir dos flujos de liquidación: pago digital previo al servicio (mediante pasarela con tokenización) y pago presencial asistido (en efectivo o datáfono físico).
- **FR-006**: El cliente DEBE poder solicitar atención o llamar al personal directamente desde la interfaz web de su mesa activa.
- **FR-007**: El personal de salón DEBE contar con una vista interactiva del plano o listado de mesas con su estado actual (libre, ocupada con pedido en curso, cuenta solicitada).
- **FR-008**: El sistema DEBE permitir al personal transferir comandas entre mesas en caso de cambio de asiento de los comensales.
- **FR-009**: Al completar el cobro y la salida del cliente, la mesa DEBE quedar liberada automáticamente para nuevos clientes.
- **FR-010**: El administrador DEBE poder configurar el catálogo de mesas, generar los códigos QR descargables e imprimibles en alta resolución y habilitar/deshabilitar mesas temporalmente.

### Key Entities

- **Mesa**: ID, número o nombre descriptivo (ej. "Mesa 4", "Terraza 2"), código de acceso QR único, estado (libre, ocupada, reservada, inactiva) y capacidad.
- **Comanda de Mesa**: ID de sesión, mesa, pedidos asociados, cliente (o comensal invitado), hora de apertura, estado de la cuenta (abierta, cobrada, cerrada).
- **Llamado de Asistencia**: ID, mesa, motivo (atención, cuenta, limpieza), estado (pendiente, atendido), fecha/hora y responsable que atendió.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El reconocimiento de la mesa y apertura de la comanda tras escanear el QR o ingresar el número toma menos de 1 segundo.
- **SC-002**: La comanda ingresada en mesa aparece en la cola de cocina en menos de 2 segundos desde su confirmación.
- **SC-003**: 0 errores de despacho en sala debidos a confusión entre pedidos para llevar y pedidos en mesa.
- **SC-004**: Los llamados de asistencia son recibidos por el personal de salón en tiempo real (latencia < 2 s) mediante WebSocket/SSE.
- **SC-005**: La interfaz en mesa es 100 % operable sin necesidad de descargar aplicaciones nativas adicionales desde tiendas de apps.

---

## Assumptions

- Cada mesa física cuenta con un identificador visible y un código QR protegido contra desgaste.
- Los camareros disponen de al menos una terminal móvil (tablet o smartphone con navegador web) para gestionar las alertas y cierres de mesa.
- No es obligatorio registrarse para ordenar en mesa en la modalidad de pago inmediato presencial, pero el registro permite acumular puntos y beneficios.

