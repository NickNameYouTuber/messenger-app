import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header correctly', () => {
  render(<App />);
  // Option 1: Match the exact text including the period
  const headerElements = screen.getAllByRole('heading', { 
    level: 1, 
    name: 'Время городов мира.' // Added period
  });
  expect(headerElements.length).toBeGreaterThan(0);
  expect(headerElements[0]).toBeInTheDocument();
});
