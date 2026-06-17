# Backlog — Cart Service

> Registro vivo do progresso do projeto. Atualizado a cada mudanca de estado de uma funcionalidade.
> **Ultima atualizacao:** 2026-06-16

---

## Sobre o Projeto

API REST responsavel pelo gerenciamento do carrinho de compras ativo de cada cliente, com validacao de produtos via Catalog Service e de usuarios via User Service.

**Versao atual:** `1.0.0`
**Repositorio:** [github.com/odevpedro/ecom-cart-service](https://github.com/odevpedro/ecom-cart-service)
**Stack principal:** Node.js 22, Express 4.21, PostgreSQL 15, Sequelize 6, Joi 17

---

## Legenda

| Simbolo | Significado |
|---------|-------------|
| `[ ]`   | Pendente |
| `[~]`   | Em andamento |
| `[x]`   | Concluido |
| `P0`    | Critico — bloqueia outras features |
| `P1`    | Alta prioridade |
| `P2`    | Media prioridade |
| `P3`    | Melhoria / nice-to-have |
| `XS` `S` `M` `L` `XL` | Estimativa de complexidade |

---

## Em Andamento

> Features atualmente sendo desenvolvidas. Idealmente, maximo de 2–3 itens simultaneos.

- [~] `P1` `M` **Migracao de Map em memoria para PostgreSQL** — Substituir o armazenamento em `Map` por tabelas no PostgreSQL usando Sequelize, mantendo compatibilidade com a API existente.

---

## Pendentes

> Ordenadas por prioridade. Itens de P0 e P1 devem entrar em "Em Andamento" primeiro.

- [ ] `P1` `M` **Testes de integracao (controller + API)** — Cobrir os endpoints HTTP com supertest, incluindo cenario de fallback dos clients HTTP e erros de validacao.
- [ ] `P2` `L` **Cache com Redis para sessoes de carrinho** — Reduzir latencia nas operacoes de leitura e escrita do carrinho utilizando Redis como camada de cache antes do PostgreSQL.

---

## Concluidas

> Features finalizadas com suas respectivas datas de conclusao e links de referencia.

- [x] `P0` `S` **CRUD basico de carrinho** (add, remove, clear, get) — 2026-06-01
- [x] `P0` `S` **Clientes HTTP com fallback** — ProductCatalogClient e UserClient com timeout de 5s e retorno null/false em caso de falha — 2026-06-01
- [x] `P1` `XS` **Health checks + Request ID** — Endpoints `/health`, `/live`, `/ready` e middleware `X-Request-ID` — 2026-06-01
- [x] `P2` `XS` **Swagger UI** — Documentacao interativa disponivel em `/docs` — 2026-06-01

---

## Bugs Conhecidos

> Problemas identificados que ainda nao foram corrigidos.

| ID | Descricao | Severidade | Reportado em |
|----|-----------|------------|--------------|

---

## Notas & Decisoes Pendentes

> Pontos em aberto que precisam de decisao antes de serem desenvolvidos.

- Definir estrategia de migracao dos dados existentes em `Map` para PostgreSQL sem downtime.

---

## Historico de Versoes

| Versao | Data | Principais entregas |
|--------|------|---------------------|
| `1.0.0` | 2026-06-01 | CRUD de carrinho, validacao externa, health checks, Swagger |
