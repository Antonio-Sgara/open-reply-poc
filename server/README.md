# Semantic Search POC API

Backend locale per la POC.

Stack:

- Node.js
- Express
- SQLite tramite `node:sqlite`

Il server legge:

```text
server/data/products-base.json
server/data/products-extra.json
```

e popola:

```text
server/data/semantic-search.db
```

## Avvio

```bash
npm run api
```

Default:

```text
http://127.0.0.1:3001
```

## Dati caricati

Al momento il server carica:

- 509 prodotti base dalla POC
- 1000 prodotti aggiuntivi
- 1509 prodotti totali dopo deduplica per ISIN

## Endpoint

### Health

```text
GET /health
```

Restituisce stato server, conteggi e lista completa prodotti.

### Lista prodotti completa

```text
GET /api/products
```

Parametri opzionali:

```text
source=base
source=extra
```

La ricerca testuale non passa da questo endpoint.

### Ricerca semplice

```text
GET /api/products/search?q=TESLA
```

### Dettaglio prodotto

```text
GET /api/products/:id
```

`:id` puo' essere `productId` o `isin`.

### Endpoint compatibile catalogo

```text
POST /products?page=0&size=20
```

Restituisce una response paginata:

```json
{
  "content": [],
  "number": 0,
  "numberOfElements": 20,
  "totalElements": 1509,
  "totalPages": 76,
  "last": false
}
```

Supporta anche:

```text
types=FUND
preferred=true
```

## Note

- Il DB SQLite viene rigenerato dai JSON a ogni avvio per la tabella `products`.
- La tabella `product_embeddings` e' gia' prevista per una fase successiva.
- Le performance/rendimenti non sono inclusi nella prima POC perche' sono dati dinamici.
