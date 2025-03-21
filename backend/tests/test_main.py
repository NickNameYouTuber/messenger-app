import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_get_time_success():
    """
    Тест успешного получения времени для города Moscow.
    """
    response = client.get("/get_time", params={"city": "Moscow"})
    assert response.status_code == 200
    assert response.json() == {"time": "12:00"}


def test_get_time_not_found():
    """
    Тест, когда город не найден.
    """
    response = client.get("/get_time", params={"city": "Paris"})
    assert response.status_code == 404
    assert response.json() == {"detail": "City not found"}


def test_get_time_no_time_data():
    """
    Тест, когда данные о времени отсутствуют (если бы такой случай был).
    """
    from backend.app import cities_data
    cities_data["TestCity"] = {"time": None, "image_url": None}

    response = client.get("/get_time", params={"city": "TestCity"})
    assert response.status_code == 404
    assert response.json() == {"detail": "Time data not available for the city"}


def test_get_image_success():
    """
    Тест успешного получения изображения для города New York.
    """
    response = client.get("/get_image", params={"city": "New York"})
    assert response.status_code == 200
    assert response.json() == {
        "cityImageUrl": "https://images.genius.com/cd861f85983f08d819c04215aff10325.1000x667x1.jpg"
    }


def test_get_image_no_image():
    """
    Тест, когда изображение отсутствует (город Tokyo).
    """
    response = client.get("/get_image", params={"city": "Tokyo"})
    assert response.status_code == 200
    assert response.json() == {"cityImageUrl": None}


def test_get_image_city_not_found():
    """
    Тест, когда город не найден.
    """
    response = client.get("/get_image", params={"city": "Paris"})
    assert response.status_code == 404
    assert response.json() == {"detail": "City not found"}