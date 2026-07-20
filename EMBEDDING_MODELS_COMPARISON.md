# Confronto modelli embedding

Stato: in corso.

Data avvio test: 2026-07-20.

## Obiettivo

Confrontare almeno tre modelli embedding sullo stesso catalogo, con le stesse
query e lo stesso ranking business, per scegliere il miglior compromesso tra:

- qualita' dei risultati
- prestazioni nel browser
- stabilita' operativa e uso della cache

I modelli previsti sono:

1. `Xenova/paraphrase-multilingual-MiniLM-L12-v2`
2. `Xenova/multilingual-e5-small`
3. `Xenova/distiluse-base-multilingual-cased-v2`

## Regole di confronto

- Dataset: 1509 prodotti.
- Top risultati osservati: 3.
- `semanticScore`: contributo del solo modello embedding.
- `businessBoost`: contributo delle regole business.
- `finalScore`: somma usata per il ranking finale.
- Gli score assoluti di modelli diversi non saranno confrontati direttamente.
- La qualita' verra' valutata dalla posizione e dalla pertinenza dei risultati.

## Modello 1 - MiniLM multilingual

### Configurazione

| Campo | Valore |
| --- | --- |
| Modello | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` |
| Runtime | Transformers.js nel frontend |
| Quantizzazione | `q4` |
| Pooling | `mean` |
| Normalizzazione | `true` |
| Dimensioni embedding | 384 |
| Prodotti con embedding SQLite | 1509/1509 |

### Prestazioni rilevate

| Misura | Risultato |
| --- | ---: |
| Selezione modello e indice pronto da SQLite | 448 ms |
| Ricostruzione del solo indice in memoria | 49 ms |
| Prima query, incluso caricamento modello dalla cache browser | 1327 ms |
| Query successive, media su 9 query | 19 ms |
| Query successive, minimo | 12 ms |
| Query successive, massimo | 29 ms |

Le misure sono state ripetute con la stessa strumentazione usata per E5 e con
i file del modello gia' presenti nella cache del browser. Servono come
confronto relativo sul computer della POC, non come benchmark hardware
generale.

### Risultati della prima batteria

#### Q01 - fondi sostenibili con rischio basso in euro

Valutazione: buona. Tutti i primi tre prodotti rispettano i vincoli espliciti.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | FR0007493549 | CAAM TRESO ETAT | 1 | 0.5788 | 0.9400 | 1.5188 |
| 2 | FR0010213355 | GROUPAMA ENTREPRISES-IC | 1 | 0.5397 | 0.9400 | 1.4797 |
| 3 | IE00B62L8426 | PIMCO LOW AVG DURATION | 2 | 0.5868 | 0.8600 | 1.4468 |

Nota: il ranking finale e' fortemente sostenuto dalle regole su rischio,
sostenibilita' e valuta.

#### Q07 - fondi obbligazionari corporate

Valutazione: parzialmente buona. Due risultati sono coerenti, mentre il secondo
risultato non appare pertinente al tema obbligazionario corporate.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | GB0032137860 | M&G CORPORATE BOND | 0.5565 | 0 | 0.5565 |
| 2 | GB00BYWYZ460 | SURE VENTURES PLC | 0.5436 | 0 | 0.5436 |
| 3 | GB00B739JW74 | M&G GLOBAL MACRO BOND | 0.5434 | 0 | 0.5434 |

#### Q20 - prodotto prudente per un investitore conservativo

Valutazione: buona. I primi tre prodotti hanno SRRI 1.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | IE0008005567 | SHORT-TERM INV-USD LIQ PT-IA | 1 | 0.4713 | 0.5600 | 1.0313 |
| 2 | FR0010288423 | HSBC MONETAIRE ETAT | 1 | 0.4592 | 0.5600 | 1.0192 |
| 3 | FR0007493549 | CAAM TRESO ETAT | 1 | 0.4316 | 0.5600 | 0.9916 |

#### Q21 - strumenti difensivi in euro

Valutazione: buona. Tutti i primi tre prodotti sono in EUR e hanno SRRI 1-2.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | IE00BYQQ0654 | BLACKROCK EURO CASH | 1 | 0.5155 | 0.7200 | 1.2355 |
| 2 | FR0007479944 | CPR 3-5 EURO SR | 2 | 0.5671 | 0.6400 | 1.2071 |
| 3 | IT0000380649 | EUROMOB EUR AGG | 2 | 0.5454 | 0.6400 | 1.1854 |

#### Q22 - soluzioni piu aggressive per crescita

Valutazione: debole. Il modello riconosce bene il concetto di crescita, ma solo
uno dei primi tre risultati espone un rischio alto verificabile.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | GG00B3BTVQ94 | ORYX INTERNATIONAL GROWTH | ND | 0.3923 | 0 | 0.3923 |
| 2 | IE00BD1DJ122 | COMGEST GROWTH JPN | 6 | 0.3462 | 0 | 0.3462 |
| 3 | GB00B23X9910 | M&G UK GROWTH | ND | 0.3438 | 0 | 0.3438 |

#### Q23 - prodotti orientati alla sostenibilita

Valutazione: buona sui dati disponibili. Tutti i primi tre prodotti hanno il
flag `sustainable=true`.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | DK0061676400 | WASTE PLASTIC UPCYCLING | 0.4833 | 0.2200 | 0.7033 |
| 2 | ES0171613005 | NATAC NATURAL INGREDIENTS | 0.3990 | 0.2200 | 0.6190 |
| 3 | DK0061278199 | FOM TECHNOLOGIES | 0.3968 | 0.2200 | 0.6168 |

#### Q25 - prodotti automotive

Valutazione: buona. I primi tre risultati appartengono al tema automotive.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | PTSCT0AP0018 | TOYOTA CAETANO PORTUGAL | 0.4943 | 0.5500 | 1.0443 |
| 2 | US88160R1014 | TESLA INC | 0.4063 | 0.5500 | 0.9563 |
| 3 | NL0011585146 | FERRARI NV | 0.3993 | 0.5500 | 0.9493 |

Nota: il boost business automotive contribuisce in modo determinante.

#### Query tematica - prodotti di aziende farmaceutiche

Valutazione: buona. Tutti i primi tre risultati sono aziende farmaceutiche.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | US58933Y1055 | MERCK & CO. | 0.5188 | 0.5500 | 1.0688 |
| 2 | DK0062498333 | NOVO NORDISK | 0.4974 | 0.5500 | 1.0474 |
| 3 | CH0012005267 | NOVARTIS | 0.4882 | 0.5500 | 1.0382 |

Nota: il boost business farmaceutico contribuisce in modo determinante.

#### Query entita' - dammi le azioni di amazon

Valutazione: insufficiente per una ricerca diretta di entita'. Amazon viene
trovata, ma Apple viene classificata al primo posto.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | US0378331005 | APPLE INC | 0.3629 | 0 | 0.3629 |
| 2 | US0231351067 | AMAZON.COM INC | 0.3091 | 0 | 0.3091 |
| 3 | LU2380748603 | MARLEY SPOON GROUP | 0.2999 | 0 | 0.2999 |

### Sintesi provvisoria MiniLM

Punti forti:

- caricamento da cache rapido
- query warm intorno ai 19 ms nel test corrente
- buona comprensione multilingual di rischio, difensivo e sostenibilita'
- risultati tematici efficaci quando supportati dal ranking business

Punti deboli:

- ricerca esatta di aziende non affidabile senza una regola dedicata
- alcuni falsi positivi nelle query puramente semantiche
- le regole business possono nascondere i limiti del modello

Questa valutazione resta provvisoria fino al completamento di DistilUSE.

## Modello 2 - Multilingual E5 small

### Configurazione

| Campo | Valore |
| --- | --- |
| Modello | `Xenova/multilingual-e5-small` |
| Runtime | Transformers.js nel frontend |
| Quantizzazione | `q4` |
| Pooling | `mean` |
| Normalizzazione | `true` |
| Prefisso query | `query: ` |
| Prefisso prodotti | `passage: ` |
| Dimensioni embedding | 384 |
| Prodotti con embedding SQLite | 1509/1509 |

### Prestazioni rilevate

| Misura | Risultato |
| --- | ---: |
| Prima generazione completa di 1509 embedding | 375957 ms |
| Selezione modello e indice pronto da SQLite | 628 ms |
| Ricostruzione del solo indice in memoria | 27 ms |
| Prima query, incluso caricamento modello dalla cache browser | 1513 ms |
| Query successive, media su 9 query | 21 ms |
| Query successive, minimo | 16 ms |
| Query successive, massimo | 30 ms |

Il primo ciclo comprende download/caricamento del modello, inferenza sui 1509
prodotti e salvataggio progressivo. La misura della prima query e' stata invece
eseguita dopo il refresh, con i file del modello gia' presenti nella cache del
browser. Le misure warm sono quelle interne alla ricerca semantica e non
includono il tempo fisso di attesa dell'automazione UI.

### Risultati della prima batteria

#### Q01 - fondi sostenibili con rischio basso in euro

Valutazione: buona. I tre prodotti hanno SRRI 1, valuta EUR e
`sustainable=true`.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | FR0010213355 | GROUPAMA ENTREPRISES-IC | 1 | 0.8516 | 0.9400 | 1.7916 |
| 2 | FR0010885210 | NATIXIS TRESORERIE PLUS | 1 | 0.8516 | 0.9400 | 1.7916 |
| 3 | FR0007493549 | CAAM TRESO ETAT | 1 | 0.8493 | 0.9400 | 1.7893 |

#### Q07 - fondi obbligazionari corporate

Valutazione: buona ma non perfetta. Tutti i risultati sono obbligazionari o
creditizi; Algebris e' il match piu' esplicito sul credito corporate.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | IT0001079398 | INVESTIPER OBBLIGAZIONARIO GLOBALE | 0.8699 | 0 | 0.8699 |
| 2 | IE00B8XCT900 | ALGEBRIS FINANCIAL CREDIT | 0.8691 | 0 | 0.8691 |
| 3 | FR0013279940 | ODDO OBLIGATIONS COURT TERM | 0.8678 | 0 | 0.8678 |

#### Q20 - prodotto prudente per un investitore conservativo

Valutazione: buona. I primi tre prodotti hanno SRRI 1.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | IE0008005567 | SHORT-TERM INV-USD LIQ PT-IA | 1 | 0.8462 | 0.5600 | 1.4062 |
| 2 | FR0010885210 | NATIXIS TRESORERIE PLUS | 1 | 0.8387 | 0.5600 | 1.3987 |
| 3 | FR0010213355 | GROUPAMA ENTREPRISES-IC | 1 | 0.8340 | 0.5600 | 1.3940 |

#### Q21 - strumenti difensivi in euro

Valutazione: buona. I tre prodotti sono in EUR e hanno SRRI 1.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | IE00BYQQ0654 | BLACKROCK EURO CASH | 1 | 0.8364 | 0.7200 | 1.5564 |
| 2 | FR0010885210 | NATIXIS TRESORERIE PLUS | 1 | 0.8299 | 0.7200 | 1.5499 |
| 3 | FR0010213355 | GROUPAMA ENTREPRISES-IC | 1 | 0.8287 | 0.7200 | 1.5487 |

#### Q22 - soluzioni piu aggressive per crescita

Valutazione: mista ma migliore della baseline. Il primo e il terzo risultato
hanno rischio alto (SRRI 6 e 7); il secondo ha SRRI 4.

| Pos | ISIN | Nome | SRRI | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | IE00BD1DJ122 | COMGEST GROWTH JPN | 6 | 0.8489 | 0 | 0.8489 |
| 2 | DK0061535507 | LOYAL SOLUTIONS | 4 | 0.8465 | 0 | 0.8465 |
| 3 | IT0005594418 | NEXT GEOSOLUTIONS EUROPE | 7 | 0.8458 | 0 | 0.8458 |

#### Q23 - prodotti orientati alla sostenibilita

Valutazione: molto buona. Tutti i risultati dichiarano la sostenibilita' anche
nel nome e hanno `sustainable=true`.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | AT0000785381 | RAIFFEISEN BILANCIATO SOSTENIBILE | 0.8563 | 0.2200 | 1.0763 |
| 2 | AT0000A1TB59 | RAIFFEISEN AZIONARIO SOSTENIBILE EM | 0.8517 | 0.2200 | 1.0717 |
| 3 | AT0000A105C5 | RAIFFEISEN SOSTENIBILE DIVERSIFICATO | 0.8511 | 0.2200 | 1.0711 |

#### Q25 - prodotti automotive

Valutazione: buona. I tre risultati sono aziende automotive; il boost business
contribuisce in modo determinante al ranking.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | NL0011585146 | FERRARI NV | 0.8576 | 0.5500 | 1.4076 |
| 2 | DE0007664039 | VOLKSWAGEN AG-PREF | 0.8534 | 0.5500 | 1.4034 |
| 3 | NL00150001Q9 | STELLANTIS NV | 0.8512 | 0.5500 | 1.4012 |

#### Query tematica - prodotti di aziende farmaceutiche

Valutazione: buona. Tutti i primi tre risultati sono aziende farmaceutiche; il
boost business contribuisce in modo determinante.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | DE000BAY0017 | BAYER AG | 0.8684 | 0.5500 | 1.4184 |
| 2 | ATBIOGENA005 | BIOGENA GROUP INVEST | 0.8674 | 0.5500 | 1.4174 |
| 3 | US58933Y1055 | MERCK & CO. | 0.8649 | 0.5500 | 1.4149 |

#### Query entita' - dammi le azioni di amazon

Valutazione: molto buona. Amazon e' correttamente al primo posto senza boost o
regole dedicate, risolvendo il principale errore osservato con MiniLM.

| Pos | ISIN | Nome | Semantic | Boost | Finale |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | US0231351067 | AMAZON.COM INC | 0.8773 | 0 | 0.8773 |
| 2 | NL00150012L7 | NEWAMSTERDAM PHARMA | 0.8596 | 0 | 0.8596 |
| 3 | AT0000A18XM4 | AMS AG | 0.8579 | 0 | 0.8579 |

### Sintesi provvisoria E5

Punti forti:

- Amazon al primo posto nella ricerca diretta di entita'
- ranking obbligazionario piu' coerente rispetto alla baseline MiniLM
- risultati molto buoni su sostenibilita', prudenza e strumenti difensivi
- inferenza warm molto rapida nel test corrente
- cache SQLite separata e completa per tutti i 1509 prodotti

Punti deboli:

- prima generazione completa lunga, circa 6 minuti e 16 secondi
- il tema aggressivo/crescita contiene ancora un risultato solo mediamente rischioso
- automotive e farmaceutico restano fortemente dipendenti dai boost business
- i secondi risultati della ricerca Amazon sono solo somiglianze lessicali

## Confronto complessivo

| Modello | Qualita' | Cache start | Prima query | Query warm | Stato |
| --- | --- | ---: | ---: | ---: | --- |
| MiniLM multilingual | Buona con limiti sulle entita' | 448 ms | 1327 ms | 19 ms | Baseline completata |
| Multilingual E5 small | Migliore nei primi test | 628 ms | 1513 ms | 21 ms | Batteria completata |
| DistilUSE multilingual | Da misurare | - | - | - | Non eseguito |

E5 e' il candidato migliore dopo due modelli, soprattutto per la ricerca di
entita' e la coerenza dei risultati senza boost. Il vincitore verra' comunque
determinato solo dopo avere completato DistilUSE con la stessa batteria.
