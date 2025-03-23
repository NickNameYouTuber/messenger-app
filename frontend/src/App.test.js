import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header correctly', () => {
  render(<App />);
  // Using findByRole or getAllByRole to handle potential duplicates safely
  const headerElements = screen.getAllByRole('heading', { level: 1, name: 'Время городов мира' });
  expect(headerElements.length).toBeGreaterThan(0);
  expect(headerElements[0]).toBeInTheDocument();
});