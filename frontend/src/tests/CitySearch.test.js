import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CitySearch from '../components/CitySearch';
import * as api from '../utils/api';

jest.mock('../utils/api');

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('CitySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Setup localStorage to return empty array when JSON parsed
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
  });

  test('renders search input and button', () => {
    render(<CitySearch />);
    expect(screen.getByPlaceholderText('Введите название города...')).toBeInTheDocument();
    expect(screen.getByText('Поиск')).toBeInTheDocument();
  });

  test('shows error when searching empty input', async () => {
    render(<CitySearch />);
    fireEvent.click(screen.getByText('Поиск'));
    expect(await screen.findByText('Пожалуйста, введите название города')).toBeInTheDocument();
  });

  test('displays results when search is successful', async () => {
    api.fetchCityTime.mockResolvedValue('12:00:00');
    api.fetchCityImage.mockResolvedValue('http://example.com/image.jpg');
    
    render(<CitySearch />);
    fireEvent.change(screen.getByPlaceholderText('Введите название города...'), {
      target: { value: 'Москва' }
    });
    fireEvent.click(screen.getByText('Поиск'));

    await waitFor(() => {
      // Look for the h2 with Москва specifically
      expect(screen.getByRole('heading', { level: 2, name: 'Москва' })).toBeInTheDocument();
      expect(screen.getByText('12:00:00')).toBeInTheDocument();
    });
  });
});