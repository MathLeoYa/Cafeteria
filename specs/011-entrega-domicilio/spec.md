# Feature Specification: Entrega a domicilio (Delivery)

**Feature Branch**: `011-entrega-domicilio`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Modalidad de entrega a domicilio para pedidos de la cafetería: selección de modalidad en checkout (retiro en local vs. entrega a domicilio); gestión accesible de libreta de direcciones con validación de cobertura y cálculo dinámico de tarifa de envío; ciclo de despacho con estados 'en camino' y entrega confirmada mediante código PIN; asignación de repartidores y seguimiento del estado; protección y minimización de datos personales de ubicación según LOPDP."

## User Scenarios & Testing *(mandatory)*

Actores: **cliente**, **personal de cafetería**, **repartidor** y **administrador**.

### User Story 1 - Seleccionar entrega a domicilio e ingresar dirección accesible (Priority: P1)

Al pasar por caja, el cliente puede elegir "Entrega a domicilio", guardar o seleccionar una dirección de su libreta, verificar que se encuentra dentro del radio de servicio de la cafetería y conocer el costo de entrega antes de pagar.

**Why this priority**: Es la puerta de entrada indispensable para el modelo de venta a domicilio.

**Independent Test**: Configurar una dirección dentro del radio de entrega, verificar el cálculo del coste de envío y completar el checkout con la dirección asignada al pedido.

**Acceptance Scenarios**:

1. **Dado** un cliente en el checkout, **Cuando** selecciona "Entrega a domicilio", **Entonces** puede ingresar una dirección (calle principal, secundaria, numeración, referencia) o seleccionar una previamente guardada.
2. **Dado** el ingreso de dirección, **Cuando** se valida la ubicación, **Entonces** la interfaz permite búsqueda accesible por texto y no depende exclusivamente de interactuar con un mapa gráfico para personas con lector de pantalla o teclado.
3. **Dado** una dirección fuera del radio de reparto autorizado, **Cuando** se introduce, **Entonces** el sistema informa con claridad que la zona no cuenta con cobertura y sugiere cambiar a retiro en local.
4. **Dado** una dirección válida dentro de cobertura, **Cuando** se confirma, **Entonces** el sistema calcula y muestra de forma desglosada el costo de envío aplicable al total.

---

### User Story 2 - Despacho, asignación de repartidor y seguimiento (Priority: P1)

Una vez preparado el pedido en cocina, el personal lo entrega al repartidor asignado. El pedido pasa al estado *en camino* y el cliente puede monitorear el progreso y tiempo estimado de llegada.

**Why this priority**: Da visibilidad operativa y reduce la ansiedad del cliente mientras el repartidor viaja.

**Independent Test**: Cambiar un pedido listo a *en camino* asignando un repartidor y comprobar que el cliente recibe la notificación de salida con el tiempo estimado de entrega.

**Acceptance Scenarios**:

1. **Dado** un pedido en estado *listo*, **Cuando** el personal lo entrega al repartidor, **Entonces** el pedido avanza al estado *en camino* y se genera un PIN de seguridad de 4 dígitos para la entrega.
2. **Dado** un pedido *en camino*, **Cuando** el cliente consulta su pedido, **Entonces** ve el nombre del repartidor, el tiempo estimado de llegada y el PIN que deberá indicar para recibir su comida.
3. **Dado** un cambio de estado a *en camino*, **Cuando** ocurre, **Entonces** el cliente recibe una notificación en tiempo real (en pantalla y por correo/push).

---

### User Story 3 - Entrega segura mediante PIN y cierre de comanda (Priority: P1)

Al llegar a la dirección de entrega, el repartidor solicita el código PIN al cliente e introduce el código en su dispositivo para confirmar la entrega. El pedido finaliza en estado *entregado*.

**Why this priority**: Asegura que el pedido no se entregue a la persona equivocada y previene fraudes o extravíos.

**Independent Test**: El repartidor ingresa el PIN correcto proporcionado por el cliente; el pedido pasa inmediatamente a *entregado*.

**Acceptance Scenarios**:

1. **Dado** el repartidor en el domicilio, **Cuando** ingresa el código PIN correcto provisto por el receptor, **Entonces** el sistema valida el código y marca el pedido como *entregado*.
2. **Dado** un intento de ingreso de PIN incorrecto, **Cuando** se introduce, **Entonces** el sistema bloquea el cierre, avisa del error y permite reintentos limitados.
3. **Dado** un cliente que no puede dictar el PIN, **Cuando** el repartidor valida la identidad con documento oficial, **Entonces** el sistema ofrece un flujo de excepción supervisado por el administrador.

---

### User Story 4 - Gestión de incidencias en ruta y reintentos (Priority: P2)

Si el cliente no responde tras un tiempo de espera prudencial o la dirección es inaccesible, el repartidor registra la incidencia y el pedido se gestiona bajo políticas de devolución a cafetería o reprogramación.

**Why this priority**: Protege el costo de los productos y define el protocolo ante clientes ausentes.

**Independent Test**: Registrar una incidencia de "cliente no responde", documentar el intento de contacto y validar la transición a estado de devolución o reprogramación.

**Acceptance Scenarios**:

1. **Dado** un repartidor en el destino donde el cliente no atiende, **Cuando** transcurren 10 minutos y se agotan los intentos de contacto, **Entonces** el repartidor reporta la incidencia con motivo registrado.
2. **Dado** un pedido no entregado por ausencia del cliente, **Cuando** el administrador confirma la no entrega, **Entonces** el pedido retorna a cafetería y se aplican las reglas de cobro por costo de envío incurrido.

---

### Edge Cases

- **Condiciones climáticas o alta demanda**: El administrador puede ajustar dinámicamente el tiempo estimado o pausar temporalmente el servicio a domicilio sin afectar los pedidos de retiro en mostrador.
- **Minimización de datos (LOPDP)**: El repartidor solo tiene acceso a la dirección y referencia del cliente mientras el pedido esté *en camino*; una vez marcado como *entregado*, los datos de ubicación se ocultan en su terminal para resguardar la privacidad.
- **Pérdida de cobertura de red del repartidor**: La aplicación del repartidor puede registrar la validación del PIN en modo desconectado mediante firma criptográfica local y sincronizar inmediatamente al recuperar señal.
- **Pedido con alimentos calientes perecederos**: Alertas automáticas si un pedido permanece en estado *en camino* por encima del tiempo máximo de frescura (ej. más de 45 minutos).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir al cliente elegir entre las modalidades de "Retiro en cafetería" y "Entrega a domicilio" al confirmar la orden.
- **FR-002**: El sistema DEBE ofrecer una gestión de direcciones accesible (cumpliendo WCAG 2.2 AAA), permitiendo ingresar calles, referencias y notas de entrega mediante teclado sin depender exclusivamente de mapas interactivos.
- **FR-003**: El sistema DEBE validar si la dirección ingresada se encuentra dentro de las zonas de cobertura geográfica definidas por la administración.
- **FR-004**: El sistema DEBE calcular el costo de entrega basándose en reglas configurables (tarifa plana por zona, distancia o beneficio de envío gratuito por compras superiores a un umbral).
- **FR-005**: La máquina de estados del pedido DEBE incorporar los estados *en camino* y *no entregado/devuelto* para los pedidos de entrega a domicilio.
- **FR-006**: Para cada pedido a domicilio, el sistema DEBE generar un código PIN de entrega aleatorio de 4 dígitos, visible exclusivamente para el cliente titular.
- **FR-007**: El sistema DEBE exigir la confirmación del PIN de entrega por parte del repartidor para transicionar el pedido a estado *entregado*.
- **FR-008**: Los datos de dirección y geolocalización DEBEN tratarse como información personal confidencial (cifrada en reposo) y solo estar disponibles para el personal de reparto durante la vigencia del despacho.
- **FR-009**: El cliente DEBE poder consultar en tiempo real el estado de su envío y el tiempo estimado de entrega.
- **FR-010**: El administrador DEBE poder activar, pausar o modificar las zonas de cobertura, tarifas de envío y tiempos estimados sin reiniciar servicios.

### Key Entities

- **Dirección de Entrega**: ID, cliente, calle principal, numeración, calle secundaria, referencia detallada, coordenadas geográficas y etiqueta (hogar, oficina).
- **Zona de Cobertura**: Nombre de zona, polígono o radio de cobertura, costo base de envío, pedido mínimo y tiempo estimado promedio.
- **Despacho a Domicilio**: ID de pedido, repartidor asignado, hora de salida, hora de entrega, código PIN de seguridad, intentos de entrega y notas de incidencia.
- **Incidencia de Reparto**: Motivo (dirección incorrecta, cliente ausente, accidente), hora de reporte, autor y resolución.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cálculo y desglose de la tarifa de envío se completa y muestra en pantalla en menos de 500 ms al ingresar o seleccionar una dirección.
- **SC-002**: 100 % de los formularios de ingreso de dirección y selección de entrega utilizables mediante navegación exclusiva por teclado y con lector de pantalla (cero trampas de foco en mapas).
- **SC-003**: 0 accesos indebidos a datos de direcciones de clientes por parte de repartidores una vez transcurridos 30 minutos desde la finalización del pedido.
- **SC-004**: Menos del 1 % de pedidos a domicilio entregados incorrectamente gracias a la verificación con código PIN.
- **SC-005**: Las notificaciones de pedido *en camino* llegan al cliente en menos de 5 segundos tras la asignación y salida del repartidor.

---

## Assumptions

- La entrega a domicilio puede ser realizada por personal propio de la cafetería o mediante un servicio de mensajería aliado.
- Las zonas de entrega iniciales están circunscritas a un perímetro urbano razonable alrededor de la cafetería.
- La confirmación de entrega con PIN se realiza en el teléfono o dispositivo del repartidor a través de la aplicación web responsive.

