.PHONY: up down logs logs-backend restart clean seed test dev-backend dev-user dev-supervisor install

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

restart: down up

clean:
	docker compose down -v

seed:
	docker compose exec backend python -m app.scripts.seed_users

test:
	docker compose exec backend pytest -v

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-user:
	cd frontend-user && npm run dev

dev-supervisor:
	cd frontend-supervisor && npm run dev -- --port 5174

install:
	cd frontend-user && npm install && cd ../frontend-supervisor && npm install && cd ../backend && pip install -r requirements.txt
