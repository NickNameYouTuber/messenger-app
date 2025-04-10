set -e
set -x

alembic upgrade head

exec uvicorn backend.app:app --host 0.0.0.0 --port 8000