up:
	docker compose -f ops/docker-compose.yml up --build
down:
	docker compose -f ops/docker-compose.yml down
test:
	# aquí puedes encadenar npm test / pytest en contenedores
migrate:
	npm run db:migrate
seed:
	npm run db:seed
## Ejecutar migraciones/seeders dentro del contenedor Fastify
migrate-in:
	docker compose -f ops/docker-compose.yml exec fastify npm run db:migrate
seed-in:
	docker compose -f ops/docker-compose.yml exec fastify npm run db:seed
smoke:
	curl -s http://localhost:3000/api/v1/health/db
