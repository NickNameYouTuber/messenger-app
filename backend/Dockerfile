FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Делаем скрипт исполняемым внутри контейнера
RUN chmod +x entrypoint.sh

CMD ["sh", "./entrypoint.sh"]

