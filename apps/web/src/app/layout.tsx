import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cafetería Online | Menú y Pedidos',
  description: 'Sistema accesible y dinámico de pedidos para la cafetería.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#ffffff',
          color: '#111111',
          lineHeight: '1.6',
        }}
      >
        <a
          href="#contenido-principal"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          onFocus={(e) => {
            e.currentTarget.style.position = 'static';
            e.currentTarget.style.width = 'auto';
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.padding = '8px 16px';
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
          onBlur={(e) => {
            e.currentTarget.style.position = 'absolute';
            e.currentTarget.style.left = '-9999px';
            e.currentTarget.style.width = '1px';
            e.currentTarget.style.height = '1px';
          }}
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
