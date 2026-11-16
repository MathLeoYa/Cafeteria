import React from 'react';

export default function HomePage() {
  return (
    <main
      id="contenido-principal"
      tabIndex={-1}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 16px',
      }}
    >
      <header>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#111111' }}>
          Bienvenido a la Cafetería
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#222222' }}>
          Plataforma de pedidos en línea con menús dinámicos y accesibilidad universal.
        </p>
      </header>

      <section aria-labelledby="seccion-estado" style={{ marginTop: '32px' }}>
        <h2 id="seccion-estado" style={{ fontSize: '1.5rem', color: '#111111' }}>
          Estado del Sistema
        </h2>
        <div
          role="status"
          style={{
            padding: '16px',
            border: '2px solid #005a9c',
            borderRadius: '8px',
            backgroundColor: '#f0f7ff',
            color: '#003366',
            marginTop: '12px',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            ✓ Stack tecnológico base inicializado correctamente (Spec #1).
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            Servicios listos para el desarrollo de módulos por el equipo.
          </p>
        </div>
      </section>

      <section aria-labelledby="seccion-navegacion" style={{ marginTop: '32px' }}>
        <h2 id="seccion-navegacion" style={{ fontSize: '1.5rem', color: '#111111' }}>
          Accesos Rápidos
        </h2>
        <nav aria-label="Menú principal">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '12px 0' }}>
              <a
                href="#menu"
                style={{
                  display: 'inline-block',
                  minHeight: '44px',
                  minWidth: '44px',
                  lineHeight: '44px',
                  padding: '0 20px',
                  backgroundColor: '#004085',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  outlineOffset: '3px',
                }}
              >
                Ver Menú del Día
              </a>
            </li>
          </ul>
        </nav>
      </section>
    </main>
  );
}
