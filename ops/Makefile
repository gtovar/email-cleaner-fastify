COMPOSE = docker compose -f docker-compose.yml

up:
	${COMPOSE} up --build
down:
	${COMPOSE} down -v
logs:
	${COMPOSE} logs -f fastify fastapi db
migrate:
	${COMPOSE} exec fastify npm run db:migrate
seed:
	${COMPOSE} exec fastify npm run db:seed
smoke:
	curl -s http://localhost:3000/api/v1/health/db
