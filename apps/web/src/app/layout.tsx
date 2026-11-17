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
      <head>
        <style>{`
          .skip-link {
            position: absolute;
            left: -9999px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
          }
          .skip-link:focus {
            position: static;
            width: auto;
            height: auto;
            padding: 8px 16px;
            background: #000000;
            color: #ffffff;
            outline: 3px solid #005a9c;
          }
        `}</style>
      </head>
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
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
