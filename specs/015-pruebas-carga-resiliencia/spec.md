# Feature Specification: Pruebas de carga, resiliencia y observabilidad

**Feature Branch**: `015-pruebas-carga-resiliencia`  
**Created**: 2026-11-17  
**Status**: Draft  
**Input**: User description: "Especificación técnica y de aseguramiento de calidad para la Fase 6 (Endurecimiento para producción): pruebas de carga automatizadas con k6 (≥ 1 000 pedidos/min en pico, latencias p95 < 300 ms en menú y < 800 ms en checkout); pruebas de resiliencia y caos ante caída de workers, fallos de base de datos o saturación de colas; validación de circuit breakers y Dead Letter Queues (DLQ); tablero integral de observabilidad con métricas DORA y SLO de 99.9 % en Grafana."

## User Scenarios & Testing *(mandatory)*

Actores: **equipo de ingeniería / DevOps**, **arquitecto de software** y **cliente de la cafetería** (impacto indirecto).

### User Story 1 - Simular picos de festividades de alta concurrencia (Priority: P1)

El equipo de ingeniería ejecuta una prueba de carga sintética que emula el tráfico de una festividad (pico de ≥ 1 000 pedidos por minuto simultáneos con miles de clientes navegando el menú dinámico y añadiendo productos al carrito), validando que ningún pedido se pierda ni duplique y que las latencias se mantengan dentro de los umbrales comprometidos.

**Why this priority**: Es el compromiso no negociable (RNF-02) para garantizar que la plataforma no colapse durante las fechas de mayores ventas del año.

**Independent Test**: Ejecutar el escenario de carga k6 en staging durante 15 minutos sostenidos con 1 000 pedidos/min y verificar métricas de tasa de éxito = 100 %, 0 cobros duplicados y p95 < 800 ms.

**Acceptance Scenarios**:

1. **Dado** un escenario de carga máxima de 1 000 pedidos/minuto, **Cuando** se ejecuta la prueba, **Entonces** el sistema responde con una tasa de error de peticiones inferior al 0.1 % y cero pedidos descartados sin procesar.
2. **Dado** un tráfico masivo de lectura del catálogo público, **Cuando** se miden los tiempos de respuesta, **Entonces** el percentil 95 (p95) de lectura del menú es inferior a 300 ms.
3. **Dado** el envío concurrente de checkout, **Cuando** se valida la confirmación, **Entonces** el percentil 95 (p95) de creación del pedido en el servidor es inferior a 800 ms (sin contar el tiempo de resolución del formulario externo de la pasarela).
4. **Dado** que la carga sostenida incrementa el uso de recursos, **Cuando** se superan los umbrales de CPU/memoria configurados, **Entonces** las instancias de la API y los workers autoescalan horizontalmente sin interrupciones de servicio.

---

### User Story 2 - Resiliencia ante fallos de workers y recuperación de colas (Priority: P1)

Durante un flujo activo de pedidos y cobros, se simula la terminación abrupta de uno o varios workers de mensajería (RabbitMQ). Al reiniciarse los servicios, todos los mensajes pendientes en cola se procesan normalmente sin duplicar cobros, facturas ni órdenes de cocina.

**Why this priority**: Los fallos de infraestructura son inevitables; el sistema debe auto-recuperarse sin requerir rescates manuales de datos.

**Independent Test**: Lanzar 200 pedidos concurrentes, matar los contenedores de los workers a mitad del procesamiento, restaurarlos y comprobar que los 200 pedidos terminan en sus estados correctos sin duplicados.

**Acceptance Scenarios**:

1. **Dado** un lote de pedidos encolados en RabbitMQ, **Cuando** un worker se detiene inesperadamente durante el procesamiento de un evento outbox, **Entonces** el mensaje se reentrega a otro consumidor disponible sin perder información gracias a la confirmación manual (*manual ack*).
2. **Dado** un evento que ya había sido procesado parcialmente antes del fallo, **Cuando** se recibe por segunda vez, **Entonces** la lógica de negocio identifica el ID único del evento y descarta la duplicidad de cobros o registros (idempotencia demostrada).
3. **Dado** un mensaje de evento con formato corrupto o error irrecuperable de datos, **Cuando** supera el límite máximo de reintentos (ej. 3 intentos), **Entonces** se traslada a la cola de mensajes muertos (Dead Letter Queue / DLQ) y se dispara una alerta crítica en Grafana.

---

### User Story 3 - Tolerancia a fallos de la pasarela de pago y Circuit Breaker (Priority: P2)

Si la pasarela de pagos externa experimenta latencias excesivas (timeouts) o errores 5xx sostenidos, el sistema activa un mecanismo de interruptor (*circuit breaker*) para proteger la API y ofrecer una alternativa clara al cliente (ej. pago con transferencia o efectivo), evitando el bloqueo de hilos de ejecución.

**Why this priority**: Evita que una caída de un tercero bloquee por completo el backend de la cafetería.

**Independent Test**: Simular un 50 % de fallos en llamadas a la pasarela de pago y verificar que el circuit breaker se abre, redirigiendo a formas de pago alternativas sin provocar caídas de memoria en la API.

**Acceptance Scenarios**:

1. **Dado** un aumento anormal de fallos o tiempos de espera en la pasarela externa, **Cuando** se supera la tasa de fallo configurada, **Entonces** el circuit breaker pasa a estado *abierto* en menos de 5 segundos.
2. **Dado** el circuit breaker abierto, **Cuando** un cliente intenta pagar con tarjeta, **Entonces** la aplicación le informa con un mensaje accesible y le sugiere de inmediato continuar con transferencia bancaria o pago en efectivo.
3. **Dado** un periodo de enfriamiento con la pasarela restablecida, **Cuando** transcurre el tiempo, **Entonces** el circuit breaker pasa a estado *semi-abierto*, prueba peticiones de sondeo y restablece el servicio normal al confirmar estabilidad.

---

### User Story 4 - Observabilidad profunda, SLOs y alertas en Grafana (Priority: P2)

El equipo dispone de dashboards unificados en Grafana que muestran en tiempo real las métricas doradas (latencia, tráfico, errores, saturación), el cumplimiento del SLO de 99.9 % y el estado de salud de bases de datos, colas y cachés.

**Why this priority**: Permite detectar anomalías de forma proactiva antes de que afecten a los clientes.

**Independent Test**: Generar una degradación artificial de latencia y comprobar que Grafana dispara una alerta al canal correspondiente en menos de 60 segundos.

**Acceptance Scenarios**:

1. **Dado** el tráfico continuo de la aplicación, **Cuando** se consultan los tableros en Grafana, **Entonces** se visualiza la tasa de disponibilidad del sistema frente al objetivo del 99.9 % (SLO).
2. **Dado** un crecimiento anómalo en la longitud de las colas de RabbitMQ, **Cuando** la cola supera el umbral de alerta durante más de 2 minutos, **Entonces** se activa una alerta prioritaria en Grafana.
3. **Dado** un error 500 no controlado en la API, **Cuando** ocurre, **Entonces** la traza distribuida (OpenTelemetry / Tempo) se correlaciona con los logs estructurados (Loki) para facilitar el diagnóstico inmediato por el equipo.

---

### Edge Cases

- **Saturación del pool de conexiones de base de datos (PgBouncer)**: Si la concurrencia supera la capacidad de conexiones directas, PgBouncer encola las peticiones sin desbordar el servidor PostgreSQL.
- **Failover de réplica de lectura**: Si la réplica de lectura falla durante una prueba de carga, el tráfico de lectura del catálogo y reportes conmuta ordenadamente a la primaria sin interrumpir el servicio.
- **Caché fría tras un reinicio de Redis**: Si la caché de Redis se vacía en pleno pico, el sistema evita el efecto avalancha (*cache stampede*) implementando bloqueos distribuidos efímeros para recalcular el menú una sola vez.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El proyecto DEBE disponer de suites de pruebas de carga automatizadas escritas para la herramienta k6, parametrizables para entornos de staging y pre-producción.
- **FR-002**: Las pruebas de carga DEBEN validar obligatoriamente los umbrales de RNF-02: ≥ 1 000 pedidos por minuto, latencia p95 < 300 ms en lectura de menú y < 800 ms al confirmar pedidos.
- **FR-003**: El sistema DEBE implementar el patrón Outbox transaccional y consumidores idempotentes para garantizar cero pérdidas y cero duplicados de pedidos y cobros ante caídas de servicio.
- **FR-004**: Los consumidores de mensajería DEBEN implementar confirmación manual (*manual ack*) tras finalizar con éxito la transacción de negocio local.
- **FR-005**: Las llamadas hacia servicios externos no confiables (pasarelas de pago, servicios tributarios) DEBEN estar protegidas por un patrón de interruptor (*circuit breaker*) con estados cerrado, abierto y semi-abierto.
- **FR-006**: Todos los eventos que fallen de forma reiterada tras la política de reintentos con retroceso exponencial DEBEN enrutarse a una Dead Letter Queue (DLQ) con inspección de causa raíz.
- **FR-007**: El sistema DEBE instrumentar métricas estándar (RED: Rate, Errors, Duration) y métricas de infraestructura (CPU, memoria, conexiones a BD, tamaño de colas) exportables a Prometheus/Grafana.
- **FR-008**: Todas las solicitudes HTTP y mensajes de cola DEBEN propagar un identificador de correlación (`Trace-Id`) para rastreo distribuido de extremo a extremo.
- **FR-009**: El sistema DEBE contar con alertas configuradas en Grafana para caídas de Quality Gate, degradación de latencia y crecimiento de mensajes en DLQ.
- **FR-010**: El procedimiento de recuperación ante desastres (restauración de copia de seguridad de PostgreSQL de Render) DEBE documentarse y validarse mediante una prueba de restauración efectiva.

### Key Entities

- **Escenario de Carga**: Perfil de usuarios virtuales (VUs), tasa de peticiones por segundo, duración de rampa de subida, sostenimiento y umbrales de aceptación (SLAs).
- **Métrica de Rendimiento**: Percentil p50, p90, p95, p99 de latencia, tasa de éxito/error (%), throughput (pedidos/minuto) y utilización de recursos.
- **Estado de Circuit Breaker**: Servicio destino, estado actual (Closed, Open, Half-Open), contador de fallos sucesivos, última marca temporal de fallo y temporizador de recuperación.
- **Registro de DLQ**: ID de mensaje original, evento, carga útil, motivo del descarte, número de reintentos efectuados y estado de subsanación.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Superación exitosa de la prueba de carga de ≥ 1 000 pedidos/minuto en staging con 0 % de pedidos perdidos o cobros duplicados.
- **SC-002**: Cumplimiento del 100 % de los umbrales de latencia: p95 < 300 ms en catálogo dinámico y p95 < 800 ms en confirmación de pedido.
- **SC-003**: Ante caída forzada de workers o reinicio de contenedores, el 100 % de los mensajes en cola se recuperan y procesan correctamente al reanudarse.
- **SC-004**: El tablero de observabilidad en Grafana refleja en tiempo real el cumplimiento del SLO (99.9 %) con correlación inmediata de logs y trazas.
- **SC-005**: Tiempo medio de detección (MTTD) de incidentes críticos inferior a 2 minutos gracias a las alertas automáticas.

---

## Assumptions

- Las pruebas de carga masiva se ejecutan en un entorno de staging con configuración de hardware y bases de datos proporcional a producción.
- La pasarela de pago externa cuenta con un entorno de pruebas o simulador capaz de absorber el volumen de peticiones sintéticas sin generar bloqueos por rate limiting.
- El costo de autoescalado temporal en Render durante la prueba de carga está contemplado dentro del presupuesto del proyecto.

