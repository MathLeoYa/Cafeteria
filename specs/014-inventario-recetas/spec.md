# Feature Specification: Inventario y recetas (Kardex e insumos)

**Feature Branch**: `014-inventario-recetas`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Gestión avanzada de existencias de insumos y materias primas (granos de café, tipos de leche, jarabes, empaques); fichas técnicas/recetas vinculadas a los productos del menú dinámico; descuento automático de inventario (Kardex) por ventas confirmadas; registro de compras, mermas y calibración; alertas preventivas de stock mínimo y desactivación automática de productos dependientes en la tienda online."

## User Scenarios & Testing *(mandatory)*

Actores: **administrador**, **barista/personal de cocina** y **cliente de la tienda online**.

### User Story 1 - Ficha técnica de producto y descuento automático por comanda (Priority: P1)

El administrador define la receta o composición de insumos de cada producto del menú (ej. 18 g de café de especialidad, 200 ml de leche entera, 1 vaso biodegradable y 1 tapa). Cuando un cliente compra y paga el producto, el sistema descuenta automáticamente cada ingrediente del stock central.

**Why this priority**: Permite un control riguroso de costes y refleja la disponibilidad real de la cafetería sin conteos manuales continuos.

**Independent Test**: Configurar una receta para "Capuchino Clásico", registrar la venta de 5 capuchinos y verificar que el kardex descuenta exactamente 90 g de café y 1 000 ml de leche.

**Acceptance Scenarios**:

1. **Dado** un producto del menú dinámico, **Cuando** el administrador configura su ficha técnica, **Entonces** puede asociar uno o más insumos con sus cantidades y unidades de medida específicas.
2. **Dado** un pedido que pasa a estado *pagado*, **Cuando** se procesa la comanda, **Entonces** el sistema descuenta automáticamente los insumos consumidos según las cantidades ordenadas.
3. **Dado** un producto con variantes o personalizaciones (ej. cambio a leche vegetal o jarabe de vainilla), **Cuando** el cliente elige la variante, **Entonces** el sistema descuenta el insumo específico seleccionado en lugar del insumo estándar.
4. **Dado** un pedido cancelado antes de su preparación, **Cuando** se anula la orden, **Entonces** el sistema revierte el descuento y restituye los insumos al stock disponible.

---

### User Story 2 - Alertas de stock crítico y agotamiento automático en el menú (Priority: P1)

Cuando la existencia de un insumo clave cae por debajo del umbral mínimo de seguridad, el sistema genera alertas para reabastecimiento y, si un insumo indispensable se agota por completo, marca automáticamente como "Agotado" en la tienda online a todos los productos que dependen de él.

**Why this priority**: Evita que los clientes paguen por productos que la cafetería no puede preparar por falta de materia prima.

**Independent Test**: Simular el consumo del stock de "Leche de Almendras" hasta 0 y verificar que todas las bebidas con leche de almendras se muestran de inmediato como no disponibles en el menú dinámico sin despliegue.

**Acceptance Scenarios**:

1. **Dado** un insumo que alcanza su nivel de stock de seguridad, **Cuando** ocurre la reducción, **Entonces** el sistema emite una alerta visual en el panel administrativo y una notificación al responsable de compras.
2. **Dado** un insumo crítico con saldo cero, **Cuando** se agota, **Entonces** el catálogo web (spec 003) marca de inmediato las opciones afectadas como no disponibles para compra.
3. **Dado** un reabastecimiento registrado en el sistema, **Cuando** el stock vuelve a ser positivo, **Entonces** el sistema reactiva automáticamente la disponibilidad de los productos en el catálogo.

---

### User Story 3 - Registro de compras, recepción y costo promedio ponderado (Priority: P2)

El administrador o encargado registra la entrada de mercaderías adquiridas a proveedores (factura de compra, proveedor, cantidad, lote, fecha de vencimiento y costo unitario), actualizando el Kardex y recalculando el costo promedio del insumo.

**Why this priority**: Proporciona base contable exacta para determinar márgenes de ganancia y trazabilidad de lotes.

**Independent Test**: Registrar una compra de 10 kg de café a un nuevo precio y verificar que el stock aumenta y el costo unitario ponderado se actualiza correctamente.

**Acceptance Scenarios**:

1. **Dado** un ingreso de mercancía física, **Cuando** el administrador registra el albarán/factura de compra, **Entonces** el stock disponible se incrementa con fecha, lote y costo.
2. **Dado** compras a precios variables, **Cuando** ingresa nuevo stock, **Entonces** el sistema calcula el costo promedio ponderado del insumo de forma transparente.
3. **Dado** un insumo con fecha de caducidad cercana, **Cuando** entra en la ventana de advertencia configurada, **Entonces** el sistema genera una alerta preventiva de rotación de producto (PEPS/FIFO).

---

### User Story 4 - Mermas, calibración del molino y ajustes de inventario (Priority: P2)

El barista registra mermas operativas diarias (purgas de calibración del molino de café, leche desechada en vaporización o roturas accidentales), manteniendo la concordancia entre el inventario teórico y el físico.

**Why this priority**: El café de especialidad exige ajustes frecuentes de molienda que representan mermas naturales que deben medirse y no considerarse extravíos.

**Independent Test**: Registrar un ajuste de merma de 100 g de café por "Calibración matutina" y validar que el kardex refleja la salida justificada con el usuario responsable.

**Acceptance Scenarios**:

1. **Dado** el personal al inicio de turno, **Cuando** calibra el molino, **Entonces** registra la cantidad de café purgada con el concepto de merma "Calibración".
2. **Dado** un ajuste de inventario tras un conteo físico, **Cuando** se detecta una diferencia, **Entonces** el administrador asienta el ajuste documentando el motivo, generando un apunte de auditoría inmutable.

---

### Edge Cases

- **Concurrencia extrema en picos de venta**: Durante momentos de alto volumen (festividades), las reservas de existencias de insumos se gestionan con consistencia transaccional evitando sobreventas de productos con insumos limitados.
- **Insumos compartidos entre cocina y bebidas**: Si un producto (ej. chocolate líquido) se usa tanto en repostería como en cafetería, el consumo concurrente actualiza un único saldo central de forma atómica.
- **Unidades de compra vs. unidades de consumo**: El sistema maneja conversiones exactas (ej. compra de sacos de 60 kg o cajas de 12 litros que se consumen en gramos y mililitros respectivamente) sin pérdidas por redondeo decimal.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mantener un catálogo centralizado de insumos con identificador único, nombre, categoría, unidad de medida base (g, ml, unidades), stock actual, stock mínimo y costo unitario.
- **FR-002**: El sistema DEBE permitir asociar a cada producto del menú dinámico una ficha técnica o receta compuesta por uno o varios insumos con sus respectivas cantidades de consumo.
- **FR-003**: El sistema DEBE descontar automáticamente del inventario (Kardex) los insumos correspondientes a cada pedido una vez que este alcanza el estado *pagado*.
- **FR-004**: Si un pedido es cancelado o devuelto antes de su preparación, el sistema DEBE restituir las cantidades de insumos al inventario disponible de forma trazable.
- **FR-005**: El sistema DEBE emitir alertas en el panel administrativo cuando un insumo caiga por debajo de su umbral de stock de seguridad.
- **FR-006**: Si un insumo marcado como indispensable se agota, el sistema DEBE invalidar la caché de catálogo y marcar automáticamente los productos dependientes como no disponibles en la tienda pública sin intervención manual.
- **FR-007**: El sistema DEBE registrar movimientos de entrada por compras de mercancía vinculando proveedor, documento, costo de adquisición, lote y fecha de vencimiento.
- **FR-008**: El sistema DEBE calcular el costo unitario de los insumos y el costo de producción teórico de cada producto del menú mediante el método de costo promedio ponderado.
- **FR-009**: El sistema DEBE permitir asentar salidas no comerciales (mermas por calibración de molienda, derrame, vencimiento o rotura) con categorización obligatoria y autor registrado.
- **FR-010**: El panel de administración de inventarios DEBE cumplir con WCAG 2.2 AAA (tablas de datos estructuradas con encabezados accesibles, contraste ≥ 7:1 y navegación íntegra por teclado).

### Key Entities

- **Insumo / Materia Prima**: ID, código SKU, nombre, unidad de medida base, stock disponible, stock de seguridad, costo promedio ponderado y estado.
- **Receta / Ficha Técnica**: ID de producto del catálogo, insumo asociado, cantidad requerida, unidad de medida y modificador de variante.
- **Movimiento de Kardex**: ID, fecha/hora, insumo, tipo de movimiento (venta comanda, compra recepción, merma calibración, ajuste físico, reversión), cantidad, saldo resultante, costo unitario y responsable.
- **Lote de Compra**: ID, insumo, número de lote, fecha de vencimiento, cantidad inicial, cantidad restante y proveedor.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El descuento de insumos en el Kardex se ejecuta en menos de 200 ms tras el evento de pago del pedido.
- **SC-002**: Cero desfases matemáticos entre las unidades vendidas en comandas y las cantidades deducidas en el Kardex de inventario.
- **SC-003**: Desactivación del producto en la tienda online en menos de 3 segundos desde que el último insumo indispensable llega a saldo cero.
- **SC-004**: Reducción de diferencias entre el inventario teórico y el conteo físico a menos del 2 % del volumen mensual.
- **SC-005**: 100 % de las mermas y ajustes quedan auditados con usuario, marca temporal y justificación obligatoria.

---

## Assumptions

- La cafetería cuenta con básculas y medidas estandarizadas en barra para respetar las proporciones de las fichas técnicas.
- Las mermas de calibración son registradas por los baristas al menos una vez por turno.
- Los impuestos de compra de insumos se manejan conforme a la normativa tributaria y se separan del costo neto del inventario.

