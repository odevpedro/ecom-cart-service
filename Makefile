.PHONY: install test lint dev start docker-build

install:
	npm install

test:
	npm test

lint:
	npm run lint

dev:
	npm run dev

start:
	npm start

docker-build:
	docker build -t ecom-cart-service .
