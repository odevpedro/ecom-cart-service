# ecom-cart-service

> Carrinho de compras ativo por cliente — gerencia itens, quantidades e validação de estoque via integração com o catálogo de produtos.

[![License](https://img.shields.io/github/license/odevpedro/ecom-cart-service?style=flat-square)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/odevpedro/ecom-cart-service?style=flat-square)](https://github.com/odevpedro/ecom-cart-service/commits/master)

---

## Sobre o Projeto

API REST responsável pelo gerenciamento do carrinho de compras ativo de cada cliente. Mantém um carrinho por usuário, com suporte a adição, remoção e limpeza de itens. Valida a existência do produto via Product Catalog e a existência do usuário via User Service antes de cada operação.

Faz parte de um ecossistema **polyglot** de microserviços, onde cada serviço usa uma linguagem diferente (Express/Node.js, NestJS, FastAPI, Go, Spring Boot).

---

## Stack & Arquitetura

| Camada        | Tecnologia                          |
|---------------|--------------------------------------|
| Runtime       | Node.js 22                           |
| Framework     | Express 4.21                         |
| Banco de dados| PostgreSQL 15                        |
| ORM           | Sequelize 6                          |
| Migrations    | Sequelize CLI (umzug)                |
| Validação     | Joi 17                               |
| Infra         | Docker + Docker Compose              |
| CI/CD         | GitHub Actions                       |
| Testes        | Jest + Supertest                     |

> Padrão arquitetural: **Layered Architecture** com separação em `routes → controllers → services → models (ORM)`. Cada camada tem responsabilidade única e se comunica via injeção simples.

---

## Estrutura de Pastas

```
src/
├── index.js                            # Entrypoint — inicia o servidor
├── app.js                              # Configuração do Express
├── config/index.js                     # Carregamento de env vars
├── routes/cart.routes.js               # Definição das rotas
├── controllers/cart.controller.js      # Handlers HTTP com validação
├── services/
│   ├── cart.service.js                 # Lógica de negócio do carrinho
│   ├── product-catalog.client.js       # HTTP client para product-catalog
│   └── user.client.js                  # HTTP client para user-service
├── models/
│   └── cart.model.js                   # Modelo Sequelize (Cart + CartItem)
├── database/
│   └── migrations/                     # Migrations do banco
├── middleware/
│   ├── error-handler.js                # Error handler padronizado
│   └── response.js                     # X-Request-ID middleware
```

---

## Como Rodar Localmente

### Pré-requisitos

- Docker + Docker Compose
- Node.js 22

### Setup

```bash
cp .env.example .env
docker compose up -d postgres-cart
npm install
npx sequelize-cli db:migrate
npm run dev
```

A API estará disponível em `http://localhost:3002`.

### Variáveis de Ambiente

| Variável              | Descrição                                    | Valor padrão (dev)                              |
|-----------------------|----------------------------------------------|-------------------------------------------------|
| `PORT`                | Porta do servidor                            | `3002`                                          |
| `DATABASE_URL`        | URL de conexão com o PostgreSQL               | `postgresql://ecom:ecom@localhost:5432/ecom_cart` |
| `PRODUCT_CATALOG_URL` | URL do Product Catalog Service                | `http://localhost:3001`                         |
| `USER_SERVICE_URL`    | URL do User Service                           | `http://localhost:3007`                         |
| `NODE_ENV`            | Ambiente de execução                          | `development`                                   |

---

## Testes

```bash
npm test
```

**23 cenários:**
| Suite                       | Arquivo                         | Cenários |
|-----------------------------|---------------------------------|----------|
| Unitários (cart service)    | `services/cart.service.test.js` | 23       |

---

## API — Endpoints

| Método | Rota                              | Descrição                  |
|--------|-----------------------------------|----------------------------|
| GET    | `/health`                         | Health check               |
| GET    | `/live`                           | Liveness probe             |
| GET    | `/ready`                          | Readiness probe            |
| GET    | `/api/cart/:userId`               | Retorna carrinho do usuário|
| POST   | `/api/cart/:userId/items`         | Adiciona item ao carrinho  |
| DELETE | `/api/cart/:userId/items/:productId` | Remove item do carrinho |
| DELETE | `/api/cart/:userId`               | Limpa o carrinho           |

> Documentação Swagger: `http://localhost:3002/docs`

---

## Documentação Técnica

| Documento                                        | Descrição                                 |
|--------------------------------------------------|-------------------------------------------|
| [Fluxos de Funcionalidades](./docs/system-feature-flows.md) | Fluxo interno de cada feature |
| [Modelo de Dados](./docs/data-model.md)          | Entidades, relacionamentos e enums        |
| [Backlog](./backlog.md)                          | Status de desenvolvimento                 |

---

## Status do Projeto

```
[x] CRUD básico de carrinho (add, remove, clear)
[x] Validação de produto via Product Catalog
[x] Validação de usuário via User Service
[x] Health checks + Request ID + erro padronizado
[x] Swagger UI em /docs
[~] Migração de Map em memória para PostgreSQL
[ ] Testes de integração (controller + API)
[ ] Cache com Redis para sessões de carrinho
```

---

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](./LICENSE) para mais informações.

---

<p align="center">
  Feito com foco em qualidade por <a href="https://github.com/odevpedro">@odevpedro</a>
</p>
