# Checklist query demo semantic search

Questa checklist serve per validare la POC prima e dopo modifiche a ranking, dataset, logica "simili a X" o modello embedding.

Baseline mock attuale:

```text
SEMANTIC_SEARCH_MOCK_BASELINE.md
```

Obiettivo pratico:

- avere un set stabile di query demo
- capire cosa ci aspettiamo dai primi risultati
- confrontare il comportamento del mock con il futuro modello `transformers.js`
- intercettare regressioni nel ranking business

## Come usare la checklist

Per ogni query:

1. eseguire la ricerca nella pagina catalogo prodotti
2. controllare i primi 3-5 risultati
3. verificare i campi business indicati
4. aprire la console e controllare:
   - `semanticScore`
   - `businessBoost`
   - `finalScore`
   - `matchedRules`
   - eventuale sorgente scelta per `simili a X`

Nota:

- il modello attuale e' mock
- i controlli sui campi strutturati sono piu' affidabili della pura similarita' semantica
- quando arrivera' `transformers.js`, questa checklist diventera' il confronto prima/dopo

## Query core

| ID | Query | Obiettivo | Campi da controllare | Segnale atteso |
| --- | --- | --- | --- | --- |
| Q01 | `fondi sostenibili con rischio basso in euro` | Verificare query composta ESG + rischio + valuta | `sustainable`, `riskKiid`, `currency` | I primi risultati dovrebbero privilegiare `Sostenibile = Si'`, `EUR`, rischio basso o medio-basso |
| Q02 | `fondi con rischio kiid basso` | Verificare ordinamento per rischio basso | `riskKiid` | I prodotti con `riskKiid` piu' basso dovrebbero salire sopra quelli a rischio 4-5-6 |
| Q03 | `fondi con rischio kiid 3` | Verificare match puntuale sul rischio | `riskKiid` | I prodotti con `riskKiid = 3` dovrebbero avere boost maggiore, poi eventuali vicini |
| Q04 | `prodotti con cedola` | Verificare preferenza positiva su cedola | `coupon` | I primi risultati dovrebbero privilegiare `Cedola = Si'` |
| Q05 | `prodotti senza cedola` | Verificare preferenza negativa su cedola | `coupon` | I primi risultati dovrebbero privilegiare `Cedola = No`; prodotti con cedola devono essere penalizzati |
| Q06 | `prodotti eco sostenibili con pai` | Verificare preferenze booleane ESG | `ecoSustainable`, `pai`, `sustainable` | I primi risultati dovrebbero privilegiare prodotti eco-sostenibili e PAI |
| Q07 | `fondi obbligazionari corporate` | Verificare asset class e semantica testuale | `commercialAssetFirstLevel`, `commercialAssetSecondLevel`, `name` | Dovrebbero salire fondi obbligazionari/corporate se presenti nel testo prodotto |
| Q08 | `fondi dinamici con rischio alto` | Verificare query rischio alto | `riskKiid` | I prodotti con rischio alto dovrebbero salire rispetto a rischio 1-2 |

## Query negative e composte

| ID | Query | Obiettivo | Campi da controllare | Segnale atteso |
| --- | --- | --- | --- | --- |
| Q09 | `fondi non sostenibili` | Verificare intento negativo ESG | `sustainable` | Prodotti con `Sostenibile = No` dovrebbero essere favoriti |
| Q10 | `fondi senza pai` | Verificare intento negativo PAI | `pai` | Prodotti con `PAI = No` dovrebbero essere favoriti |
| Q11 | `fondi non collocati` | Verificare intento negativo su collocamento | `isPlaced` / `Collocato` | Prodotti non collocati dovrebbero salire se presenti nel dataset |
| Q12 | `fondi sostenibili senza cedola` | Verificare mix positivo + negativo | `sustainable`, `coupon` | Dovrebbero salire prodotti sostenibili e senza cedola |
| Q13 | `fondi in euro senza cedola con rischio basso` | Verificare query multi-vincolo | `currency`, `coupon`, `riskKiid` | Dovrebbero salire prodotti EUR, senza cedola, con rischio basso |

## Query prodotti simili

| ID | Query | Obiettivo | Campi da controllare | Segnale atteso |
| --- | --- | --- | --- | --- |
| Q14 | `fondo simile a AT0000712716` | Verificare similar products per ISIN presente | `isin`, `managementCompany`, `riskKiid`, `asset class` | Il prodotto sorgente deve essere escluso; i risultati devono essere vicini al prodotto sorgente |
| Q15 | `fondo simile a AT0000712716 ma meno rischiosi` | Verificare vincolo relativo sul rischio | `riskKiid` | I prodotti con `riskKiid` minore del sorgente devono salire |
| Q16 | `fondo simile a AT0000712716 con cedola` | Verificare similarita' + vincolo positivo | `coupon` | I primi risultati dovrebbero privilegiare `Cedola = Si'` |
| Q17 | `fondo simile a AT0000712716 senza cedola` | Verificare similarita' + vincolo negativo | `coupon` | I primi risultati dovrebbero privilegiare `Cedola = No` |
| Q18 | `fondi simili a investiper` | Verificare risoluzione sorgente testuale ambigua | log `sourceCandidates`, `ambiguousSource` | Nei log devono comparire candidati sorgente; se ambigua, `ambiguousSource` deve segnalarlo |
| Q19 | `fondo simile a AT0000495304` | Verificare sorgente assente | log `Prodotto sorgente non trovato` | Se il prodotto non e' nel dataset POC, deve restituire zero risultati e non fare fallback |

## Query per confronto dopo `transformers.js`

Queste query sono utili soprattutto quando il mock verra' sostituito da un modello reale, perche' richiedono piu' comprensione semantica e meno match letterale.

| ID | Query | Obiettivo | Campi da controllare | Segnale atteso |
| --- | --- | --- | --- | --- |
| Q20 | `cerco un prodotto prudente per un investitore conservativo` | Testare sinonimi di rischio basso | `riskKiid`, asset class | Con modello reale dovrebbero salire prodotti a rischio basso/medio-basso |
| Q21 | `strumenti difensivi in euro` | Testare lessico non tecnico | `riskKiid`, `currency`, asset class | Con modello reale dovrebbero salire prodotti EUR e meno rischiosi |
| Q22 | `soluzioni piu' aggressive per crescita` | Testare sinonimi di rischio alto | `riskKiid`, asset class azionaria | Con modello reale dovrebbero salire prodotti piu' dinamici/rischiosi |
| Q23 | `prodotti orientati alla sostenibilita'` | Testare sinonimi ESG | `sustainable`, `ecoSustainable`, `pai` | Con modello reale dovrebbero salire prodotti con segnali ESG anche senza parola esatta |

## Query future per prodotti aggiuntivi / tematici

Queste query richiedono un dataset esteso e un piccolo server API prodotti.

| ID | Query | Obiettivo | Campi da controllare | Segnale atteso |
| --- | --- | --- | --- | --- |
| Q24 | `prodotti collegati a Tesla` | Verificare ricerca per azienda/sottostante | `companyName`, `ticker`, `underlyings`, `theme` | Dovrebbero salire prodotti con esposizione o collegamento a Tesla |
| Q25 | `prodotti automotive` | Verificare ricerca per settore/tema | `sector`, `industry`, `theme` | Dovrebbero salire prodotti collegati ad automotive |
| Q26 | `prodotti tech americani` | Verificare combinazione settore + area geografica | `sector`, `country`, `currency`, `underlyings` | Dovrebbero salire prodotti tech/USA se presenti |
| Q27 | `strumenti legati alle auto elettriche` | Verificare sinonimi tematici | `theme`, `industry`, `underlyings` | Dovrebbero salire prodotti legati a EV, automotive, Tesla o simili |

Prerequisiti:

- lista prodotti aggiuntivi normalizzata
- server API locale read-only
- campi tema/settore/sottostanti nel testo semantico
- query understanding per riconoscere aziende, settori e temi

## Open point performance/rendimento dinamico

Query come:

```text
fondo con rendimento alto ma rischio basso
```

oggi sono supportate solo in parte.

Con i dati attuali si puo' valutare:

- `rischio basso` tramite `riskKiid`

Non si puo' valutare davvero:

- `rendimento alto`
- `performance alta`
- `buon rapporto rischio/rendimento`

Decisione per la prima POC:

- non basare la demo principale su performance/rendimento
- trattare performance e rendimento come dati dinamici opzionali
- se l'utente chiede `rendimento alto`, la query understanding deve segnalarlo come vincolo non supportato o non disponibile
- concentrare la POC su dati piu' stabili: azienda, tema, settore, sottostanti, rischio, valuta, cedola, sostenibilita'

Eventuale fase successiva:

- aggiungere performance solo con data aggiornamento (`asOfDate`)
- evitare ranking forte su dati non aggiornati
- rigenerare baseline se questi campi diventano disponibili

## Open point query understanding

Prima o insieme al modello embedding serve valutare uno step di interpretazione query:

```text
input utente -> intenti/vincoli strutturati -> query normalizzata -> embedding/ranking
```

Esempi di output utili:

```text
rischio basso -> riskKiid low
rendimento alto -> performance high
Tesla -> company/theme/underlying
simile a AT0000712716 -> similar_products
```

Questo step deve anche segnalare vincoli non supportati dai dati, per esempio `performance` quando mancano dati rendimento.

## Campi console da annotare

Per ogni query di regressione annotare almeno:

```text
query
top 3 ISIN
top 3 riskKiid
top 3 coupon
top 3 sustainable
semanticScore
businessBoost
finalScore
matchedRules
note qualitative
```

Per query `simili a X` annotare anche:

```text
sourceQuery
sourceProduct
sourceCandidates
ambiguousSource
constraintQuery
```

## Criteri di regressione

Una modifica peggiora la POC se:

- una query con vincolo strutturato ignora il campo richiesto
- `riskKiid basso` porta stabilmente in alto prodotti con rischio alto
- `con cedola` porta stabilmente in alto prodotti senza cedola
- `senza cedola` porta stabilmente in alto prodotti con cedola
- `simile a ISIN presente` non trova il sorgente
- `simile a ISIN assente` fa fallback a risultati generici
- nei log spariscono score, boost o regole applicate

## Stato attuale

Stato al momento della creazione:

- dataset POC: `src/products.json`
- prodotti deduplicati: 509
- embedding: mock deterministico
- ranking business: attivo
- modalita' `simili a X`: attiva
- vincoli business su `simili a X`: attivi
