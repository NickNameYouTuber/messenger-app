import { render, screen, fireEvent } from '@testing-library/react';
import CitySearch from '../components/CitySearch';
import * as api from '../utils/api';

jest.mock('../utils/api');

describe('CitySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
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
});