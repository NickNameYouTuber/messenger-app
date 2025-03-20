// Мокаем fetch API
global.fetch = jest.fn();

const {
  fetchCityTime,
  fetchCityImage,
  addToSearchHistory,
  searchHistory
} = require('./app.js');

// Мокаем localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Мокаем DOM элементы
document.getElementById = jest.fn(id => {
  const elements = {
    'city-input': { value: 'Москва', addEventListener: jest.fn() },
    'search-btn': { addEventListener: jest.fn() },
    'result-card': { style: { display: 'none' } },
    'city-name': { textContent: '' },
    'city-time': { textContent: '' },
    'update-timestamp': { textContent: '' },
    'city-image': { src: '', alt: '', style: { display: 'none' } },
    'no-image': { style: { display: 'none' } },
    'loading': { style: { display: 'none' } },
    'error-message': { textContent: '', style: { display: 'none' } },
    'history-list': { innerHTML: '', appendChild: jest.fn() }
  };
  return elements[id] || { style: {}, addEventListener: jest.fn() };
});

// Мокаем createElement для истории поиска
document.createElement = jest.fn(() => ({
  className: '',
  textContent: '',
  addEventListener: jest.fn(),
  style: {}
}));

// Группа тестов для API запросов
describe('API запросы', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetchCityTime отправляет запрос к правильному API эндпоинту', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ time: '12:34:56' })
    });

    const result = await fetchCityTime('Москва');
    
    expect(fetch).toHaveBeenCalledWith('/api/v1/get_time?city=Москва');
    expect(result).toBe('12:34:56');
  });

  test('fetchCityTime возвращает null при ошибке', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchCityTime('Москва');
    
    expect(result).toBeNull();
  });

  test('fetchCityImage отправляет запрос к правильному API эндпоинту', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cityImageUrl: 'https://example.com/moscow.jpg' })
    });

    const result = await fetchCityImage('Москва');
    
    expect(fetch).toHaveBeenCalledWith('/api/v1/get_image?city=Москва');
    expect(result).toBe('https://example.com/moscow.jpg');
  });

  test('fetchCityImage возвращает null при ошибке', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchCityImage('Москва');
    
    expect(result).toBeNull();
  });

  test('fetchCityTime корректно обрабатывает ошибку HTTP', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await fetchCityTime('НесуществующийГород');
    
    expect(result).toBeNull();
  });
});

// Группа тестов для истории поиска
describe('История поиска', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
  });

  test('addToSearchHistory добавляет город в историю', () => {
    // Начальное состояние истории
    const initialHistory = [];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialHistory));
    
    addToSearchHistory('Москва');
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'citySearchHistory',
      JSON.stringify(['Москва'])
    );
  });

  test('addToSearchHistory перемещает существующий город в начало истории', () => {
    // Начальное состояние истории с уже имеющимся городом
    const initialHistory = ['Нью-Йорк', 'Москва', 'Париж'];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialHistory));
    
    addToSearchHistory('Москва');
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'citySearchHistory',
      JSON.stringify(['Москва', 'Нью-Йорк', 'Париж'])
    );
  });

  test('addToSearchHistory ограничивает историю до 10 элементов', () => {
    // Начальное состояние истории с 10 городами
    const initialHistory = [
      'Город1', 'Город2', 'Город3', 'Город4', 'Город5',
      'Город6', 'Город7', 'Город8', 'Город9', 'Город10'
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialHistory));
    
    addToSearchHistory('Новый город');
    
    const expectedHistory = [
      'Новый город', 'Город1', 'Город2', 'Город3', 'Город4',
      'Город5', 'Город6', 'Город7', 'Город8', 'Город9'
    ];
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'citySearchHistory',
      JSON.stringify(expectedHistory)
    );
  });

  test('addToSearchHistory игнорирует регистр при поиске дубликатов', () => {
    const initialHistory = ['Москва', 'Нью-Йорк'];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialHistory));
    
    addToSearchHistory('москва'); // с маленькой буквы
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'citySearchHistory',
      JSON.stringify(['москва', 'Нью-Йорк'])
    );
  });
});

// Тесты для проверки кодирования URL
describe('Корректное кодирование URL', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
  });

  test('Города с пробелами кодируются правильно', async () => {
    await fetchCityTime('Нью Йорк');
    expect(fetch).toHaveBeenCalledWith('/api/v1/get_time?city=Нью%20Йорк');
    
    await fetchCityImage('Нью Йорк');
    expect(fetch).toHaveBeenCalledWith('/api/v1/get_image?city=Нью%20Йорк');
  });

  test('Города с кириллицей кодируются правильно', async () => {
    await fetchCityTime('Санкт-Петербург');
    expect(fetch).toHaveBeenCalledWith('/api/v1/get_time?city=Санкт-Петербург');
    
    await fetchCityImage('Санкт-Петербург');
    expect(fetch).toHaveBeenCalledWith('/api/v1/get_image?city=Санкт-Петербург');
  });
});

// Интеграционные тесты обработки ответов API
describe('Интеграционные тесты обработки ответов API', () => {
  const mockSuccessfulTimeResponse = {
    ok: true,
    json: async () => ({ time: '15:30:45' })
  };
  
  const mockSuccessfulImageResponse = {
    ok: true,
    json: async () => ({ cityImageUrl: 'https://example.com/city.jpg' })
  };
  
  const mockEmptyImageResponse = {
    ok: true,
    json: async () => ({ cityImageUrl: null })
  };
  
  beforeEach(() => {
    fetch.mockClear();
  });

  test('Успешный запрос обоих API с изображением', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/get_time')) {
        return Promise.resolve(mockSuccessfulTimeResponse);
      } else if (url.includes('/get_image')) {
        return Promise.resolve(mockSuccessfulImageResponse);
      }
    });

    const timeResult = await fetchCityTime('Москва');
    const imageResult = await fetchCityImage('Москва');
    
    expect(timeResult).toBe('15:30:45');
    expect(imageResult).toBe('https://example.com/city.jpg');
  });

  test('Успешный запрос времени без изображения', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/get_time')) {
        return Promise.resolve(mockSuccessfulTimeResponse);
      } else if (url.includes('/get_image')) {
        return Promise.resolve(mockEmptyImageResponse);
      }
    });

    const timeResult = await fetchCityTime('МаленькийГород');
    const imageResult = await fetchCityImage('МаленькийГород');
    
    expect(timeResult).toBe('15:30:45');
    expect(imageResult).toBeNull();
  });
});
