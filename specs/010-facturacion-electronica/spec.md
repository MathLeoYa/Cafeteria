# Feature Specification: Facturación electrónica

**Feature Branch**: `010-facturacion-electronica`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Emisión de comprobantes tributarios electrónicos conforme a la normativa fiscal vigente (SRI Ecuador): emisión de facturas y notas de crédito, soporte de Consumidor Final y facturación con RUC/Cédula/Pasaporte; generación de XML firmado electrónicamente, envío y autorización ante la autoridad tributaria; generación de RIDE en formato PDF accesible; consulta y descarga de comprobantes desde el historial del cliente; contingencia ante indisponibilidad del servicio tributario y conservación contable según LOPDP."

## User Scenarios & Testing *(mandatory)*

Actores: **cliente**, **personal de cafetería**, **administrador** y **autoridad tributaria (SRI)**.

### User Story 1 - Solicitar factura con datos tributarios o Consumidor Final (Priority: P1)

Durante el checkout, el cliente elige si desea su comprobante como "Consumidor Final" (para compras menores al límite legal) o con datos fiscales personalizados (Cédula, RUC o Pasaporte, Razón Social, Dirección y Correo para recepción de comprobantes). El sistema guarda los datos fiscales en el perfil si el cliente lo desea.

**Why this priority**: Es la base para cumplir la ley tributaria en cada transacción comercial.

**Independent Test**: Realizar una compra seleccionando "Consumidor Final" y otra ingresando RUC/Cédula válida; verificar que los datos quedan vinculados correctamente al pedido pagado.

**Acceptance Scenarios**:

1. **Dado** un cliente en la pantalla de pago, **Cuando** selecciona "Consumidor Final", **Entonces** el sistema no exige identificación tributaria personalizada (siempre que el importe no supere el límite legal permitido para consumidor final).
2. **Dado** un cliente que requiere factura con datos, **Cuando** ingresa su identificación (Cédula o RUC) y datos fiscales, **Entonces** el sistema valida el algoritmo de dígito verificador del documento y formatea los datos.
3. **Dado** un cliente registrado, **Cuando** marca "guardar datos para futuras facturas", **Entonces** sus datos fiscales quedan asociados a su perfil para reutilizarlos en el siguiente pedido.
4. **Dado** un cliente extranjero o sin cédula local, **Cuando** selecciona Pasaporte, **Entonces** el sistema admite la identificación alfanumérica y los datos de contacto requeridos.

---

### User Story 2 - Emisión, firma electrónica y autorización del comprobante (Priority: P1)

Una vez confirmado el pago del pedido, el sistema genera de forma asíncrona el documento tributario en XML, lo firma digitalmente con el certificado de la empresa y lo envía a la entidad tributaria para su autorización.

**Why this priority**: Sin autorización tributaria, el comprobante carece de validez legal para el cliente y el negocio.

**Independent Test**: Simular un pedido pagado y verificar que se genera la clave de acceso de 49 dígitos, el archivo XML firmado y la solicitud de autorización.

**Acceptance Scenarios**:

1. **Dado** un pedido que pasa a estado *pagado*, **Cuando** se confirma el cobro, **Entonces** el sistema genera el comprobante electrónico con su clave de acceso única de 49 dígitos, cálculo de base imponible, desglose de impuestos (IVA) y detalles inmutables de productos.
2. **Dado** el comprobante generado, **Cuando** entra en la cola de facturación, **Entonces** se firma electrónicamente mediante el certificado digital y se remite a la autoridad fiscal.
3. **Dado** una respuesta positiva de la entidad tributaria, **Cuando** se recibe el estado "AUTORIZADO", **Entonces** el comprobante se marca como válido y se archiva junto a la fecha y número de autorización.
4. **Dado** que el servicio de la entidad tributaria está temporalmente caído o intermitente, **Cuando** el envío falla por causas externas, **Entonces** el comprobante queda en estado de contingencia pendiente y se reintenta automáticamente mediante cola con retroceso exponencial, sin bloquear la entrega del pedido al cliente.

---

### User Story 3 - Consulta, descarga del RIDE (PDF) y envío por correo (Priority: P2)

El cliente puede descargar el comprobante en formato visual RIDE (PDF accesible) y archivo XML desde el detalle de su pedido, y recibe una copia en su correo electrónico tan pronto como el comprobante es autorizado.

**Why this priority**: Facilita la justificación contable y tributaria del cliente sin necesidad de acudir a ventanilla física.

**Independent Test**: Consultar un pedido facturado en el historial, descargar el PDF del RIDE y comprobar que cumple con el contraste y estructura requeridos, y que el XML descargable coincide con el autorizado.

**Acceptance Scenarios**:

1. **Dado** un comprobante autorizado, **Cuando** se confirma la autorización, **Entonces** el sistema genera el RIDE en formato PDF con el código de barras/código QR de la clave de acceso, estructura accesible y textos con contraste ≥ 7:1.
2. **Dado** un cliente que consulta su historial de pedidos, **When** abre un pedido finalizado, **Then** dispone de botones accesibles para descargar el archivo PDF (RIDE) y el archivo XML oficial.
3. **Dado** un comprobante autorizado, **Cuando** se genera el PDF, **Entonces** se despacha un correo al buzón tributario registrado con ambos archivos adjuntos (o enlace de descarga directa protegido).

---

### User Story 4 - Emisión de notas de crédito por cancelación o devolución (Priority: P2)

Cuando un pedido pagado se cancela o reembolsa (parcial o totalmente), el sistema emite automáticamente la correspondiente nota de crédito electrónica asociada a la factura original.

**Why this priority**: Es el único mecanismo fiscal legal para reversar ingresos gravados y justificar reembolsos.

**Independent Test**: Ejecutar un reembolso de un pedido facturado y verificar que se emite la nota de crédito referenciando la factura y el motivo de la reversión.

**Acceptance Scenarios**:

1. **Dado** un pedido pagado y facturado que es cancelado o reembolsado, **Cuando** se autoriza la devolución, **Entonces** se genera una nota de crédito electrónica vinculada a la clave de acceso de la factura de origen.
2. **Dado** la emisión de una nota de crédito, **Cuando** es autorizada por el fisco, **Entonces** el cliente recibe la notificación con el comprobante de anulación contable.

---

### Edge Cases

- **Identificación inválida o mal escrita**: El sistema valida la estructura del RUC/Cédula antes de procesar el pago para evitar rechazos en el fisco una vez cobrado el dinero.
- **Facturas con promociones y combos mixtos**: El XML debe desglosar con exactitud matemática centésima a centésima el descuento comercial y los impuestos, sin descuadres de redondeo que causen rechazo de validación.
- **Anonimización LOPDP de un cliente eliminado**: Si el cliente ejerce su derecho al olvido, los comprobantes tributarios emitidos se conservan inalterados por el plazo legal de prescripción fiscal (ej. 7 años), pero desvinculados de la cuenta de usuario activa.
- **Rechazo fiscal por datos inconsistentes**: Si la autoridad tributaria rechaza un comprobante, el evento alerta a la consola administrativa de facturación con el código de error exacto para corrección y reemisión sin afectar al pedido entregado.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir al cliente seleccionar entre "Consumidor Final" o proporcionar datos para emisión de factura (Cédula, RUC, Pasaporte, Razón Social, Dirección, Correo tributario) durante el proceso de compra.
- **FR-002**: El sistema DEBE validar formalmente la estructura y algoritmo del documento de identidad ecuatoriano (Cédula y RUC de personas naturales, jurídicas y públicas) en tiempo real en el formulario.
- **FR-003**: Para pedidos pagados que superen el monto máximo permitido por la normativa para Consumidor Final, el sistema DEBE exigir obligatoriamente datos fiscales con identificación válida.
- **FR-004**: El sistema DEBE generar el documento XML de factura electrónica cumpliendo rigurosamente el esquema XSD oficial y la estructura de clave de acceso de 49 dígitos numéricos.
- **FR-005**: El sistema DEBE firmar digitalmente el documento XML utilizando un certificado de firma electrónica corporativa en formato estándar (PKCS#12) gestionado en bóveda de secretos segura.
- **FR-006**: El proceso de envío y recepción de autorización tributaria DEBE ser asíncrono, operado a través de colas de mensajería con tolerancia a fallos y reintentos ante caídas del servidor fiscal.
- **FR-007**: El sistema DEBE generar la representación impresa del documento electrónico (RIDE) en PDF cumpliendo estándares de accesibilidad visual y lector de pantalla (etiquetas semánticas, contraste ≥ 7:1, texto seleccionable y legible).
- **FR-008**: El cliente DEBE tener acceso a consultar y descargar en cualquier momento los archivos XML y PDF de sus comprobantes desde su cuenta.
- **FR-009**: Ante cancelaciones o reembolsos de pedidos facturados, el sistema DEBE emitir la correspondiente nota de crédito electrónica referenciando la factura origen.
- **FR-010**: Los datos de comprobantes tributarios DEBEN conservarse de forma inmutable durante el periodo legal de retención tributaria, con aislamiento de auditoría respecto a eliminaciones de cuenta por LOPDP.

### Key Entities

- **Comprobante Electrónico**: Clave de acceso (49 dígitos), tipo de comprobante (factura, nota de crédito), número secuencial, ID de pedido, fecha de emisión, estado de autorización (pendiente, autorizado, rechazado, contingencia), número de autorización y fecha/hora de autorización.
- **Datos Fiscales del Receptor**: Tipo de identificación, número de identificación, razón social/nombre completo, dirección comercial, correo electrónico de recepción y teléfono.
- **Detalle Tributario del Comprobante**: Subtotal tarifa 0%, subtotal con impuesto (IVA), valor total de impuestos, total de descuentos aplicados e importe total a pagar.
- **Historial de Envío Fiscal**: Intentos de conexión, respuestas del servicio tributario, mensajes de error o advertencia y bitácora de contingencia.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 pedidos cobrados quedan sin comprobante generado o encolado para autorización.
- **SC-002**: El 99 % de los comprobantes electrónicos se firman y encolan para envío en menos de 5 segundos tras la confirmación del pago.
- **SC-003**: El RIDE en PDF generado pasa validaciones de accesibilidad (documento PDF con estructura de tags semánticos y contraste de color accesible).
- **SC-004**: 0 discrepancias de redondeo monetario entre los totales cobrados en la pasarela de pagos y los subtotales expresados en el XML tributario.
- **SC-005**: Capacidad de operar en modo contingencia sin detener las ventas durante interrupciones del servicio externo de la autoridad tributaria.

---

## Assumptions

- La cafetería dispone de un certificado digital de firma electrónica válido emitido por una entidad de certificación acreditada en Ecuador.
- El cálculo de impuestos se rige por las tarifas tributarias vigentes (IVA de cafetería/restaurante aplicable al momento de facturación).
- Las transacciones con Consumidor Final no requieren dirección física completa ni teléfono obligatorio.

