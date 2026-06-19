# ApexTrade AI - Deployment

## Docker Compose Services
- `postgres` on port `5432`
- `python-service` on port `8000`
- `java-service` on port `8080`
- `frontend` on port `5173` mapped to container port `80`

## Network
All services join the `trading-net` bridge network so the Java service can reach Python and PostgreSQL by service name.

## Volumes
- `postgres_data` persists the PostgreSQL database files

## Local Environment Variables
- `PYTHON_SERVICE_URL` for the Java service to reach Python
- `DB_URL`, `DB_USER`, and `DB_PASS` for PostgreSQL overrides
- `JWT_SECRET` for auth work

## Startup Order
1. PostgreSQL starts first.
2. Python service starts for price lookups.
3. Java service starts and connects to both dependencies.
4. Frontend starts last and talks to Java only.

## Notes
- The stack is container-first, so local development should mirror the Docker Compose wiring as closely as possible.