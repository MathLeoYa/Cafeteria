import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the welcome heading and status', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /Bienvenido a la Cafetería/i })
    ).toBeDefined();
    expect(
      screen.getByText(/Stack tecnológico base inicializado correctamente/i)
    ).toBeDefined();
  });
});
