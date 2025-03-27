from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(openapi_prefix="/api/v1")



cities_data = {
    "Moscow": {"time": "12:00", "image_url": "https://gsenzao.ru/wp-content/uploads/2023/09/5b506d941900002800c66d47-scaled.jpeg"},
    "New York": {"time": "05:00", "image_url": "https://images.genius.com/cd861f85983f08d819c04215aff10325.1000x667x1.jpg"},
    "Tokyo": {"time": "19:00", "image_url": None},
}


class CityRequest(BaseModel):
    city: str


@app.get("/get_time")
async def get_time(city: str):
    """
    Получение времени в конкретном городе.
    """
    city_data = cities_data.get(city)
    if not city_data:
        raise HTTPException(status_code=404, detail="City not found")

    time = city_data.get("time")
    if not time:
        raise HTTPException(status_code=404, detail="Time data not available for the city")

    return {"time": time}


@app.get("/get_image")
async def get_image(city: str):
    """
    Получение фото города (если есть).
    """
    city_data = cities_data.get(city)
    if not city_data:
        raise HTTPException(status_code=404, detail="City not found")

    image_url = city_data.get("image_url")
    if image_url is None:
        return {"cityImageUrl": None}


    return {"cityImageUrl": image_url}

@app.get("/{number}")
async def secret(number: int):
    if number == 1488:
        return {"answer": "Коммиты делать мы не просим"}

    return {"answer": "Неизвестное число"}
