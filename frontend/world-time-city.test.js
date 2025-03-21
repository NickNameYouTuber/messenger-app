global.fetch = jest.fn();

const { fetchCityTime, fetchCityImage, addToSearchHistory } = require('./app-logic.js');

const localStorageMock = {
    store: {},
    getItem: jest.fn(key => localStorageMock.store[key] || null),
    setItem: jest.fn((key, value) => { localStorageMock.store[key] = value.toString(); }),
    clear: jest.fn(() => { localStorageMock.store = {}; })
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Requests', () => {
    beforeEach(() => {
        fetch.mockClear();
        localStorageMock.clear();
    });

    test('fetchCityTime calls correct endpoint', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ time: '12:34:56' })
        });

        const result = await fetchCityTime('Москва');
        expect(fetch).toHaveBeenCalledWith('/api/v1/get_time?city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
        expect(result).toBe('12:34:56');
    });

    test('fetchCityTime returns null on error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const result = await fetchCityTime('Москва');
        expect(result).toBeNull();
    });

    test('fetchCityImage calls correct endpoint', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ cityImageUrl: 'https://example.com/moscow.jpg' })
        });

        const result = await fetchCityImage('Москва');
        expect(fetch).toHaveBeenCalledWith('/api/v1/get_image?city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
        expect(result).toBe('https://example.com/moscow.jpg');
    });

    test('fetchCityImage returns null on error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const result = await fetchCityImage('Москва');
        expect(result).toBeNull();
    });
});

describe('Search History', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    test('addToSearchHistory adds new city', () => {
        const initial = [];
        const result = addToSearchHistory('Москва', initial);
        expect(result).toEqual(['Москва']);
    });

    test('addToSearchHistory moves existing city to top', () => {
        const initial = ['Париж', 'Москва', 'Лондон'];
        const result = addToSearchHistory('Москва', initial);
        expect(result).toEqual(['Москва', 'Париж', 'Лондон']);
    });

    test('addToSearchHistory limits to 10 items', () => {
        const initial = Array(10).fill().map((_, i) => `Город${i}`);
        const result = addToSearchHistory('Новый', initial);
        expect(result.length).toBe(10);
        expect(result[0]).toBe('Новый');
    });
});

describe('URL Encoding', () => {
    beforeEach(() => {
        fetch.mockClear();
        fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    });

    test('handles spaces in city names', async () => {
        await fetchCityTime('Нью Йорк');
        expect(fetch).toHaveBeenCalledWith('/api/v1/get_time?city=%D0%9D%D1%8C%D1%8E%20%D0%99%D0%BE%D1%80%D0%BA');
    });
});