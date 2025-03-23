// app-logic.js
export async function fetchCityTime(city) {
    try {
        const response = await fetch(`/api/v1/get_time?city=${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.time;
    } catch (error) {
        console.error('Error fetching time:', error);
        return null;
    }
}

export async function fetchCityImage(city) {
    try {
        const response = await fetch(`/api/v1/get_image?city=${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.cityImageUrl;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

export function addToSearchHistory(city, searchHistory) {
    const updatedHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    updatedHistory.unshift(city);
    if (updatedHistory.length > 10) updatedHistory.pop();
    return updatedHistory;
}

module.exports = {
    fetchCityTime,
    fetchCityImage,
    addToSearchHistory
  };