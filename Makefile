.PHONY: install run stop clean

install:
	@echo "Installing dependencies..."
	@cd backend && uv pip install -r requirements.txt
	@cd frontend && npm install

run:
	@echo "Starting services..."
	docker compose up --build

stop:
	@echo "Stopping services..."
	docker compose down

clean:
	@echo "Cleaning up..."
	docker compose down -v
	rm -rf backend/__pycache__
	rm -rf frontend/node_modules
	rm -rf frontend/dist
