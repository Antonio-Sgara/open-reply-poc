# POC Ricerca Semantica Prodotti

## Obiettivo

Questa POC serve a dimostrare una ricerca prodotti basata sul significato, non solo su filtri rigidi o match testuali esatti.

L'idea e' permettere a un utente di scrivere frasi naturali come:

- "cerco un fondo obbligazionario prudente in euro"
- "vorrei prodotti sostenibili con rischio basso"
- "fammi vedere fondi simili a questo ma meno rischiosi"
- "prodotti con cedola e rischio medio"

e ottenere prodotti rilevanti anche se la query non corrisponde esattamente ai nomi dei campi o ai valori tecnici del catalogo.

## Cosa NON e' questa POC

Non e':

- un rifacimento completo della piattaforma
- una search enterprise generale
- un motore con explainability perfetta fin da subito
- una sostituzione totale dei filtri tradizionali

E' invece:

- una demo credibile di ricerca semantica su catalogo prodotti
- una base tecnica per confrontare ricerca classica e ricerca per significato
- un modo per capire se embeddings + ranking semantico portano valore reale nel dominio prodotti

## Idea di fondo

La ricerca semantica funziona cosi':

1. ogni prodotto viene trasformato in una rappresentazione testuale
2. quel testo viene convertito in un embedding, cioe' un vettore numerico che rappresenta il significato
3. anche la query dell'utente viene convertita in embedding
4. si confronta il vettore della query con i vettori dei prodotti
5. i prodotti piu' vicini semanticamente vengono restituiti come risultati

In pratica:

- prodotto -> testo descrittivo -> embedding
- query utente -> embedding
- similarita' vettoriale -> ranking finale

## Perche' ci serve la sezione Catalogo Prodotti

La sezione `Catalogo Prodotti` serve come base realistica della POC.

Ci serve per avere:

- dati prodotto veri o quasi veri
- una UI credibile e vicina al sito reale
- un posto dove mostrare i risultati della ricerca semantica
- un confronto diretto con i filtri e la ricerca tradizionale

Quindi il catalogo non e' il fine: e' la superficie su cui innestare la semantic search.

## Esperienza utente desiderata

L'utente finale dovrebbe poter:

- entrare nel catalogo prodotti
- vedere i prodotti come oggi
- usare i filtri classici se vuole
- scrivere una frase libera in un box di ricerca semantica
- ottenere una lista di prodotti ordinata per rilevanza semantica

Opzionalmente:

- combinare query semantica + filtri classici
- vedere uno score di rilevanza
- vedere prodotti "simili a questo"

## Esempi di query utente da supportare

Esempi buoni per la POC:

- "cerco un fondo obbligazionario prudente in euro"
- "fondi sostenibili con basso rischio"
- "prodotti in euro con volatilita' contenuta"
- "fondi azionari globali con buon profilo ESG"
- "prodotti con cedola"
- "fondi difensivi per un investitore conservativo"
- "qualcosa di simile a questo fondo ma meno rischioso"
- "fondi corporate collocati dalla banca"

## Caratteristiche prodotto piu' importanti per la semantica

### Campi principali

Questi sono i campi piu' utili per rappresentare il significato del prodotto:

- `name`
- `managementCompany`
- `productType`
- `commercialAssetFirstLevel`
- `commercialAssetSecondLevel`
- `commercialAssetThirdLevel`
- `currency`
- `riskKiid`
- `ecoSustainable`
- `sustainable`
- `pai`
- `coupon`
- `isPlaced`

### Campi molto utili se disponibili

- descrizione prodotto
- politica di investimento
- `caaFirstLevelType`
- `bicType` / best in class
- indicatori di performance
- indicatori di rischio
- principali titoli sottostanti
- analisi fondamentale

### Campi poco utili per il significato

- `productId`
- `isin`
- flag tecnici di UI
- dati di workflow interno

Questi possono servire per identificazione o navigazione, ma aggiungono poco alla semantica.

## Come costruire il testo di un prodotto

Per ogni prodotto bisogna creare una frase o scheda testuale coerente, sempre con la stessa struttura.

### Versione strutturata

Esempio:

```text
Nome prodotto: RAIFFEISEN TOPDIVIDEND.
Societa': RAIFFEISEN KAPITALANLAGE.
Tipologia: Fondo.
Asset class primo livello: Obbligazionari.
Asset class secondo livello: Obbligazionari corporate.
Asset class terzo livello: Obbligazionari corporate finanziari.
Valuta: EUR.
Rischio KIID: 6.
Eco-sostenibile: no.
Sostenibile: no.
PAI: no.
Cedola: no.
Collocato: si'.
```

### Versione compatta

Esempio:

```text
Fondo RAIFFEISEN TOPDIVIDEND di RAIFFEISEN KAPITALANLAGE, area obbligazionaria corporate finanziaria, in euro, rischio KIID 6, non sostenibile, senza cedola, collocato.
```

### Regola pratica

Per la POC conviene partire con un testo strutturato e stabile, perche':

- e' piu' semplice da generare
- e' piu' facile da debuggare
- rende chiaro quali attributi entrano nell'embedding

## Architettura logica della POC

### Pipeline offline o iniziale

1. leggere il catalogo prodotti
2. normalizzare i campi utili
3. costruire il testo descrittivo per ogni prodotto
4. generare un embedding per ogni prodotto
5. salvare embedding + metadati

### Pipeline runtime

1. utente inserisce query libera
2. la query viene trasformata in embedding
3. si calcola la similarita' tra query e tutti i prodotti
4. si ordina per score
5. si restituiscono i top N prodotti
6. opzionalmente si applicano filtri classici sopra i risultati

## Tecnologie candidate

### Frontend

- React
- TypeScript
- UI catalogo prodotti gia' esistente nel progetto

### Motore embedding

Possibile scelta per la POC:

- `transformers.js`

Perche':

- permette di eseguire modelli transformer in JavaScript
- e' adatto a una demo veloce senza introdurre subito un backend ML complesso
- puo' essere usato per generare embeddings di query e prodotti

### Ranking / retrieval

- cosine similarity
- in alternativa dot product

### Storage iniziale

Per una prima POC basta anche:

- JSON locale
- struttura in memoria

Se poi cresce:

- piccolo indice locale
- eventualmente vector DB in una fase successiva

## Uso di `transformers.js`

L'idea pratica e':

1. scegliere un modello di embedding compatibile
2. usarlo per generare il vettore del testo prodotto
3. serializzare i vettori in un file locale o cache
4. usare lo stesso modello per l'embedding della query

### Nota importante

Perche' la POC sia coerente:

- prodotti e query devono essere embeddate con lo stesso modello
- il testo prodotto deve avere una struttura stabile
- i campi piu' importanti devono essere sempre presenti quando possibile

## Logica di matching

La logica base e':

1. embedding query
2. embedding prodotto
3. similarita' vettoriale
4. ordinamento decrescente per similarita'

Formula concettuale:

- piu' il vettore prodotto e' vicino al vettore query
- piu' il prodotto e' semanticamente rilevante

## Ricerca semantica vs filtri tradizionali

I filtri tradizionali restano utili.

La strategia migliore per la POC e':

- la semantica trova i candidati piu' rilevanti
- i filtri classici restringono o raffinano il risultato

Esempio:

- query: "fondi obbligazionari prudenti"
- filtro aggiuntivo: `currency = EUR`
- filtro aggiuntivo: `sustainable = true`

Questa combinazione rende la demo piu' credibile rispetto a una semantica completamente isolata.

## Due modalita' utili della POC

### 1. Semantic search libera

L'utente scrive una frase e ottiene prodotti rilevanti.

### 2. Similar products

Dato un prodotto gia' noto:

- si costruisce o recupera il suo embedding
- si cercano i prodotti piu' vicini
- si mostra "prodotti simili"

Questa seconda modalita' e' molto interessante per demo e confronto.

## Cosa fare lato frontend

### UI minima da aggiungere

- un box di input per la query semantica
- un pulsante cerca
- eventuale switch tra "ricerca classica" e "ricerca semantica"
- rendering dei risultati nella lista prodotti gia' esistente

### UI consigliata

- badge o label "risultati semantici"
- score di similarita' opzionale
- messaggio che spiega che la ricerca interpreta il significato della frase
- eventuale sezione "prodotti simili"

### Comportamento desiderato

- se la query e' vuota, si usa il catalogo standard
- se la query e' presente, si attiva il ranking semantico
- i filtri classici restano compatibili

## Step tecnici lato frontend

Questi sono gli step tecnici principali da eseguire lato FE per implementare la POC.

### 1. Definire i dati semantici di partenza

Bisogna decidere quali campi prodotto entrano nella rappresentazione semantica.

Set iniziale consigliato:

- `name`
- `managementCompany`
- `productType`
- `commercialAssetFirstLevel`
- `commercialAssetSecondLevel`
- `commercialAssetThirdLevel`
- `currency`
- `riskKiid`
- `ecoSustainable`
- `sustainable`
- `pai`
- `coupon`
- `isPlaced`
- eventuale descrizione prodotto

Output atteso:

- un tipo TypeScript dedicato, per esempio `SemanticProductSource`

### 2. Creare la funzione che costruisce il testo semantico

Serve una funzione tipo:

- `buildProductSemanticText(product)`

Questa funzione deve trasformare i campi business del prodotto in una frase o scheda testuale stabile.

Esempio concettuale:

```ts
"Fondo obbligazionario corporate in euro, rischio KIID 3, sostenibile, senza cedola."
```

Output atteso:

- una stringa coerente per ogni prodotto

### 3. Integrare il motore di embedding

Qui entra in gioco `transformers.js`.

Serve un modulo frontend che:

- carica il modello di embedding
- espone una funzione tipo `embedText(text)`
- restituisce il vettore del testo

Output atteso:

- un servizio FE per generare embedding da testo

### 4. Costruire l'indice semantico dei prodotti

Partendo dai prodotti del catalogo, bisogna creare una struttura dati tipo:

```ts
{
  productId,
  semanticText,
  embedding,
  rawProduct
}
```

Per la POC ci sono due strade:

- generare embeddings lato browser all'avvio
- pre-generare embeddings e caricarli da JSON

Per il primo MVP FE, la soluzione piu' pragmatica e':

- indice precomputato oppure cache locale

### 5. Implementare la similarita' vettoriale

Serve una funzione tipo:

- `cosineSimilarity(a, b)`

Questa funzione confronta:

- embedding della query
- embedding del prodotto

Output atteso:

- uno score numerico di rilevanza

### 6. Creare il flusso di ricerca semantica

Quando l'utente inserisce una query:

1. si legge il testo
2. si genera l'embedding della query
3. si confronta la query con tutti gli embeddings prodotto
4. si ordina per score
5. si prendono i top N risultati

Output atteso:

- una funzione tipo `searchProductsByMeaning(query, index)`

### 7. Integrare la UI nella pagina catalogo

Nel frontend prodotti bisogna aggiungere:

- input per la query semantica
- bottone cerca
- stato di loading
- rendering dei risultati dentro la lista prodotti esistente

Comportamento consigliato:

- nessuna query -> catalogo standard
- query presente -> ranking semantico
- filtri classici ancora utilizzabili

### 8. Gestire stato, cache e performance

Lato FE bisogna prevedere:

- loading del modello
- loading dell'indice
- gestione errori
- eventuale cache locale degli embeddings
- debounce dell'input se si vuole ricerca live

Questo e' importante perche' `transformers.js` puo' essere pesante al primo caricamento.

### 9. Aggiungere la modalita' "prodotti simili"

Una volta creato l'indice, si puo' aggiungere facilmente una funzione tipo:

- `findSimilarProducts(productId)`

Logica:

- si recupera l'embedding del prodotto corrente
- si cercano i vettori piu' vicini
- si mostra una lista di prodotti simili

### 10. Rifinire la UX della POC

Ultimi miglioramenti consigliati:

- badge `Risultati semantici`
- score di similarita' opzionale
- messaggio esplicativo sul fatto che la ricerca interpreta il significato
- fallback chiaro se non ci sono risultati

## Ordine consigliato di implementazione lato FE

1. definire il tipo dati semantico
2. creare `buildProductSemanticText`
3. integrare `transformers.js`
4. costruire l'indice prodotti
5. implementare cosine similarity
6. implementare la funzione di ricerca semantica
7. integrare la UI nel catalogo
8. ottimizzare cache e performance
9. aggiungere "prodotti simili"

## Cosa fare lato logica applicativa

### Step minimi

1. definire la funzione che crea il testo semantico del prodotto
2. definire una funzione che genera embeddings
3. definire una struttura dati per salvare:
   - `productId`
   - testo prodotto
   - embedding
   - eventuali metadati utili
4. definire la funzione di similarita'
5. definire il ranking finale
6. collegare il tutto alla UI del catalogo

## Strategia pratica consigliata

### Fase 1 - MVP

- usare un sottoinsieme chiaro di campi prodotto
- generare embedding offline o all'avvio
- salvare gli embeddings localmente
- permettere query semantiche e mostrare top 10 risultati

### Fase 2 - Miglioramento qualitativo

- aggiungere descrizioni prodotto
- migliorare il template testuale
- pesare meglio alcuni campi
- aggiungere similar products

### Fase 3 - Raffinamento

- combinare scoring semantico e filtri
- aggiungere explainability minima
- valutare un indice vettoriale piu' strutturato

## Possibile struttura tecnica

Esempio concettuale:

```text
src/
  semantic-search/
    buildProductSemanticText.ts
    generateEmbeddings.ts
    similarity.ts
    semanticSearch.ts
    semanticTypes.ts
    semanticIndex.json
```

## Funzioni chiave da prevedere

### `buildProductSemanticText(product)`

Costruisce il testo descrittivo del prodotto a partire dai campi business.

### `embedText(text)`

Genera l'embedding di un testo usando il modello scelto.

### `buildSemanticIndex(products)`

Genera l'indice dei prodotti:

- testo
- embedding
- metadati

### `searchProductsByMeaning(query, productsIndex)`

Dato il testo della query:

- genera embedding query
- calcola similarita'
- ordina i risultati
- restituisce i migliori

### `findSimilarProducts(productId, productsIndex)`

Trova prodotti simili a un prodotto dato.

## Criteri di successo della POC

La POC e' riuscita se:

- un utente puo' scrivere frasi naturali
- i risultati sembrano coerenti con il significato della query
- la demo si appoggia al catalogo prodotti reale
- si vede chiaramente la differenza rispetto a una semplice ricerca per stringa

## Rischi da tenere a mente

### Testo prodotto troppo povero

Se il testo e' troppo scarno, l'embedding sara' debole.

### Campi troppo tecnici o rumorosi

Se si inseriscono troppi campi inutili, il significato si sporca.

### Aspettative troppo alte

La POC deve mostrare valore, non perfezione assoluta.

### Ambiguita' delle query utente

Parole come "prudente", "difensivo", "aggressivo" non corrispondono sempre a un singolo campo; la semantica serve proprio ad assorbire questa vaghezza.

## Decisioni consigliate

Per partire in modo pragmatico:

- usare `transformers.js`
- partire con embeddings su testo strutturato prodotto
- usare cosine similarity
- salvare un indice locale semplice
- integrare tutto nella UI del catalogo prodotti

## Logica sottostante, spiegata in modo semplice

La ricerca classica funziona cosi':

- o trovi esattamente quel termine
- o selezioni manualmente i filtri corretti

La ricerca semantica invece prova a capire il senso della richiesta.

Esempio:

- query: "fondi prudenti in euro"

La logica non cerca solo la stringa "prudenti", ma prova a collegarla a segnali come:

- rischio KIID basso o medio-basso
- asset class meno aggressive
- valuta EUR
- eventuali descrizioni coerenti

Quindi non ragiona solo per uguaglianza testuale, ma per vicinanza di significato.

## Prompt utile per riaprire una nuova chat

Se questa POC viene ripresa in una nuova chat, un buon prompt iniziale puo' essere:

```text
Voglio implementare la POC di ricerca semantica descritta nel file SEMANTIC_SEARCH_POC_HANDOFF.md.
Partiamo dal catalogo prodotti esistente e costruiamo:
1. la funzione che genera il testo semantico dei prodotti
2. la pipeline embeddings con transformers.js
3. la similarita' vettoriale
4. l'integrazione nella UI del catalogo
Guidami in modo operativo, file per file.
```

## Sintesi finale

La logica della POC e' questa:

- usare il catalogo prodotti come base reale
- trasformare i prodotti in testo significativo
- generare embeddings con un modello condiviso
- confrontare la query utente con i prodotti tramite similarita'
- mostrare i risultati nella UI del catalogo

La POC non deve essere perfetta: deve essere chiara, credibile e dimostrare che una ricerca per significato puo' aiutare davvero a trovare prodotti finanziari.

---

## Aggiornamento operativo - 2026-06-08

Questa sezione descrive lo stato attuale della POC dopo i primi interventi tecnici.

### Task svolti

#### 1. Creata la base tecnica della ricerca semantica

E' stata creata la cartella:

```text
src/semantic-search/
```

con questi file:

```text
src/semantic-search/semanticTypes.ts
src/semantic-search/buildProductSemanticText.ts
src/semantic-search/similarity.ts
src/semantic-search/embeddingService.ts
src/semantic-search/semanticSearch.ts
src/semantic-search/useSemanticProductSearch.ts
src/semantic-search/debug.ts
```

Responsabilita' dei file:

- `semanticTypes.ts`: tipi TypeScript per prodotto semantico, embedding, item indicizzato e risultato.
- `buildProductSemanticText.ts`: trasforma un prodotto in testo descrittivo stabile.
- `similarity.ts`: implementa `cosineSimilarity`.
- `embeddingService.ts`: contiene un embedding mock/deterministico usato per simulare il modello.
- `semanticSearch.ts`: costruisce l'indice, cerca per significato e contiene la base per prodotti simili.
- `useSemanticProductSearch.ts`: hook React che collega prodotti, indice, query e risultati.
- `debug.ts`: abilita/disabilita log di debug della pipeline semantica.

#### 2. Implementata la generazione del testo semantico

La funzione:

```ts
buildProductSemanticText(product)
```

usa i campi reali dei prodotti:

- `productId`
- `isin`
- `name` / `productName`
- `managementCompany`
- `sicav`
- `productType`
- `caaFirstLevelType`
- `commercialAssetFirstLevel`
- `commercialAssetSecondLevel`
- `commercialAssetThirdLevel`
- `currency`
- `riskKiid`
- `sustainable`
- `ecoSustainable`
- `pai`
- `bestInClass`
- `coupon`
- `isPlaced`
- `preferred`

Inoltre traduce `riskKiid` in un profilo testuale indicativo:

- `1-2`: rischio basso, profilo prudente
- `3-4`: rischio medio-basso, profilo moderato
- `5`: rischio medio
- `6-7`: rischio alto, profilo dinamico

Nota: questa regola e' utile per il mock, ma andra' raffinata con ranking business.

#### 3. Implementato embedding mock

Per ora non e' ancora stato collegato `transformers.js`.

Il file:

```text
src/semantic-search/embeddingService.ts
```

genera un vettore deterministico basato su token, sinonimi e hashing.

Questo serve a simulare il comportamento futuro:

```text
testo -> embedding -> similarity -> ranking
```

La parte da sostituire con il modello vero e':

```ts
embedText(text)
```

Il resto della pipeline dovrebbe rimanere quasi invariato.

#### 4. Implementata ricerca semantica end-to-end

Sono state implementate:

```ts
buildSemanticIndex(products)
searchProductsByMeaning(query, index)
findSimilarProducts(productId, index)
```

La ricerca oggi:

1. riceve la query utente
2. genera l'embedding mock della query
3. confronta la query con gli embedding prodotto
4. calcola cosine similarity
5. ordina per score decrescente
6. restituisce i risultati

#### 5. Integrata una UI minima nel catalogo prodotti

Nel componente:

```text
src/components/widget/WidgetProductList/WidgetProductList.tsx
```

e' stato aggiunto un pannello:

```text
Ricerca semantica
```

con:

- input testuale per query libera
- bottone `Cerca`
- bottone `Reset`
- stato di indicizzazione/risultati
- sostituzione temporanea della lista prodotti con i risultati semantici quando la ricerca e' attiva

Lo stile e' stato aggiunto in:

```text
src/components/widget/WidgetProductList/WidgetProductList.scss
```

#### 6. Aggiunti log di debug

Il file:

```text
src/semantic-search/debug.ts
```

contiene:

```ts
export const SEMANTIC_SEARCH_DEBUG = true;
```

Quando e' `true`, la console mostra log prefissati con:

```text
[semantic-search]
```

La pipeline logga:

- submit della query utente
- numero di prodotti caricati
- avvio e fine indicizzazione
- testi semantici prodotti
- token dell'embedding mock
- dimensioni attive del vettore
- query normalizzata
- score calcolati
- risultati ordinati in `console.table`

Per spegnere i log:

```ts
export const SEMANTIC_SEARCH_DEBUG = false;
```

#### 7. Verifica tecnica eseguita

Sono stati eseguiti:

```text
npm run typecheck
npm run build
```

Entrambi passano.

Restano warning gia' presenti nel progetto:

- deprecazioni Sass `@import`
- warning Vite/lightningcss su `:export`
- warning chunk size

Questi warning non bloccano la build e non sono stati introdotti dalla logica semantica.

#### 8. Aggiunto dataset prodotti locale

E' stato aggiunto:

```text
src/products.json
```

Il file iniziale conteneva `510` prodotti.

E' stata fatta una deduplica:

- duplicati per `productId`: `0`
- duplicati per `isin`: `1`
- prodotti finali: `509`

Duplicato rimosso:

```json
{
  "productId": 41947,
  "isin": "IM00B1Z40704",
  "name": "GULF INVESTMENT FUND PLC (USD) MUTUAL FUND",
  "currency": "USD"
}
```

Il file finale non ha duplicati per `productId` o `isin`.

#### 9. Collegato il dataset locale alla ricerca semantica

Il file:

```text
src/products.json
```

e' stato importato in:

```text
src/components/widget/WidgetProductList/WidgetProductList.tsx
```

La ricerca semantica ora usa i `509` prodotti locali tramite:

```ts
useSemanticProductSearch(semanticDatasetProducts)
```

La tabella classica resta invece collegata al normale flusso API/stato `products`.

Comportamento attuale:

- senza query semantica: UI catalogo standard con prodotti caricati dalla tabella/API
- con query semantica attiva: risultati calcolati sui 509 prodotti di `src/products.json`

I log di submit ora distinguono:

- `loadedTableProducts`
- `semanticDatasetProducts`

#### 10. Aggiunto reranking business

E' stato aggiunto il file:

```text
src/semantic-search/businessRanking.ts
```

La ricerca ora calcola:

```ts
finalScore = semanticScore + businessBoost
```

Nel risultato vengono mantenuti:

- `score`: score finale usato per ordinare
- `semanticScore`: similarity vettoriale/mock
- `businessBoost`: boost derivato da regole business
- `finalScore`: somma di `semanticScore` e `businessBoost`
- `matchedRules`: elenco delle regole applicate

Regole implementate:

- `rischio basso`, `kiid basso`, `kid basso`, `srri basso`, `prudente`, `difensivo`, `conservativo`: favoriscono `riskKiid` piu' basso
- `rischio alto`, `kiid alto`, `kid alto`, `srri alto`, `dinamico`, `aggressivo`: favoriscono `riskKiid` piu' alto
- `kiid 3`, `kid 3`, `srri 3`, `rischio 3`: favoriscono il valore esatto o valori vicini
- `sostenibile`, `sostenibili`, `esg`: favoriscono `sustainable === true`
- `eco`, `ecosostenibile`, `eco sostenibile`: favoriscono `ecoSustainable === true`
- `pai`: favorisce `pai === true`
- `cedola`, `cedolare`, `distribuzione`: favoriscono `coupon === true`
- `euro`, `eur`: favoriscono `currency === "EUR"`
- `collocato`, `collocati`, `collocamento`: favoriscono `isPlaced === true`

I log della ricerca ora mostrano:

- `semanticScore`
- `businessBoost`
- `finalScore`
- `matchedRules`

Verifica fatta:

```text
fondi con rischio kiid basso
```

I primi risultati in UI risultano ordinati con `riskKiid` basso, partendo da KIID `1` e `2`.

#### 11. Esempio salvato di trasformazione prodotto

Questo esempio serve per spiegare e debuggare la pipeline attuale:

```text
prodotto JSON -> testo semantico -> token/sinonimi -> vettore mock -> ranking
```

Prodotto usato:

```json
{
  "productId": 8350,
  "isin": "AT0000712716",
  "name": "RAIFFEISEN-HEALTHCARE AKTIENFONDS",
  "riskKiid": 5,
  "currency": "EUR",
  "sustainable": true,
  "ecoSustainable": true,
  "pai": true,
  "coupon": false,
  "isPlaced": true
}
```

Testo semantico generato:

```text
Nome prodotto: RAIFFEISEN-HEALTHCARE AKTIENFONDS. ISIN: AT0000712716. Societa di gestione: RAIFFEISEN KAPITALANLAGE GES.MBH. Sicav: Raiffeisen Capital Management. Tipologia prodotto: Fondi comuni. Categoria tecnica: OTHER. Asset class primo livello: Altro. Asset class secondo livello: Altro. Asset class terzo livello: Altro. Valuta: EUR. Rischio KIID: 5. Profilo rischio: rischio medio. Sostenibile: si. Eco-sostenibile: si. PAI: si. Best in class: no. Cedola: senza cedola. Collocato: si. Preferito: si.
```

Esempi di token estratti:

```text
raiffeisen
healthcare
aktienfonds
fondi
eur
rischio
kiid
medio
sostenibile
eco
pai
cedola
collocato
moderato
euro
fondo
```

Vettore mock attuale a 128 dimensioni:

```json
[
  0, 0, 0, 7, 0, 1, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0,
  2, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 3, 1,
  0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
  0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
  0, 0, 0, 0, 0, 1, 5, 0, 1, 0, 0, 0, 1, 0, 3, 0,
  0, 0, 0, 0, 1, 0, 0, 3, 1, 0, 0, 0, 1, 2, 0, 0,
  4, 0, 1, 2, 1, 0, 0, 0, 4, 1, 0, 1, 0, 0, 0, 0
]
```

Nota: questo vettore non e' un embedding reale. E' il vettore mock/deterministico generato oggi da token, sinonimi e hashing. Quando verra' integrato `transformers.js`, il testo semantico restera' utile ma il vettore verra' prodotto dal modello.

#### 12. Validazione iniziale reranking business

Sono state provate in browser le query demo principali, con risultati calcolati sui `509` prodotti locali.

Query:

```text
fondi con rischio kiid basso
```

Esito:

- primi risultati con `riskKiid` `1`
- alcuni risultati successivi con `riskKiid` `2`
- ranking coerente con l'intento "rischio basso"

Query:

```text
fondi con rischio alto
```

Esito:

- primi risultati con `riskKiid` `7`
- ranking coerente con l'intento "rischio alto"

Query:

```text
fondi sostenibili in euro
```

Esito:

- primi risultati in `EUR`
- primi risultati con `sustainable === true`
- molti risultati anche con `ecoSustainable === true` e `pai === true`

Query:

```text
prodotti con cedola
```

Esito:

- primi risultati con `coupon === true`

Query:

```text
prodotti eco sostenibili con pai
```

Esito:

- primi risultati con `ecoSustainable === true`
- primi risultati con `sustainable === true`
- primi risultati con `pai === true`

Conclusione:

- il reranking business funziona sui casi positivi principali
- non sono stati fatti ulteriori cambi di peso in questa validazione
- la validazione successiva ha aggiunto anche la gestione delle query negative

#### 13. Aggiunta gestione query negative

Il file:

```text
src/semantic-search/businessRanking.ts
```

ora riconosce intenti negativi con parole come:

- `senza`
- `non`
- `no`
- `escludi`
- `esclusi`
- `escluse`

Campi gestiti:

- `coupon`
- `sustainable`
- `ecoSustainable`
- `pai`
- `isPlaced`

Logica:

- se la query chiede un campo positivo, il prodotto con campo `true` riceve boost
- se la query chiede un campo negativo, il prodotto con campo `false` riceve boost
- se la query chiede un campo negativo e il prodotto ha campo `true`, riceve penalita'

Esempio:

```text
fondi senza cedola
```

premia:

```text
coupon === false
```

e penalizza:

```text
coupon === true
```

Query negative validate in browser:

```text
fondi senza cedola
prodotti non sostenibili
prodotti senza pai
prodotti non eco sostenibili
```

Esiti:

- `fondi senza cedola`: primi risultati con `Cedola = No`
- `prodotti non sostenibili`: primi risultati con `Sostenibile = No`
- `prodotti senza pai`: primi risultati con `PAI = No`
- `prodotti non eco sostenibili`: primi risultati con `Eco-sostenibile = No`

#### 14. Validazione query composte

Sono state validate query con piu' vincoli positivi e negativi insieme.

Query:

```text
fondi sostenibili in euro senza cedola
```

Esito:

- primi risultati con `Sostenibile = Si`
- primi risultati con `Divisa = EUR`
- primi risultati con `Cedola = No`

Query:

```text
fondi prudenti non sostenibili
```

Esito:

- primi risultati con `riskKiid` basso, in particolare `1`, `2`, `3`
- primi risultati con `Sostenibile = No`

Query:

```text
prodotti con cedola ma rischio basso
```

Esito:

- primi risultati con `Cedola = Si`
- primi risultati con `riskKiid` basso, in particolare `2` e `3`

Query:

```text
prodotti eco sostenibili senza pai
```

Esito:

- primi risultati con `Eco-sostenibile = Si`
- primi risultati con `Sostenibile = Si`
- primi risultati con `PAI = No`

Conclusione:

- i boost positivi e negativi lavorano correttamente insieme sui casi provati
- non sono stati necessari cambi di peso in questa validazione
- il prossimo sviluppo funzionale consigliato e' la modalita' "simili a X"

#### 15. Implementata modalita' "simili a X"

E' stato aggiunto il file:

```text
src/semantic-search/similarProducts.ts
```

Responsabilita':

- riconoscere query come `fondi simili a investiper`
- estrarre il nome/identificativo del prodotto sorgente
- risolvere il prodotto sorgente cercando per:
  - `isin`
  - `productId`
  - `name`
  - `productName`
  - campi testuali correlati
- usare l'embedding del prodotto sorgente
- cercare i prodotti piu' vicini nell'indice
- escludere il prodotto sorgente dai risultati

La funzione:

```ts
searchProductsByMeaning(query, index)
```

ora intercetta prima l'intento "simili a X".

Se l'intento viene riconosciuto:

```text
query -> prodotto sorgente -> embedding sorgente -> prodotti simili
```

Se non viene riconosciuto:

```text
query -> embedding query -> ricerca semantica standard + business ranking
```

Pattern supportati:

```text
simili a X
simile a X
fondi simili a X
prodotti simili a X
trovami fondi simili a X
cerca prodotti simili a X
```

Query validata in browser:

```text
fondi simili a investiper
```

Nel dataset locale esistono due prodotti Investiper:

```json
[
  {
    "productId": 42379,
    "isin": "IT0001079398",
    "name": "INVESTIPER OBBLIGAZIONARIO GLOBALE GIA' OBBLIG.M.TERMINE POR",
    "riskKiid": 3,
    "currency": "EUR"
  },
  {
    "productId": 42381,
    "isin": "IT0001079406",
    "name": "INVESTIPER OBBLIGAZ.MEDIO TERMINE NOMINATIVO",
    "currency": "EUR"
  }
]
```

Esito:

- la query restituisce `20` risultati semantici
- i risultati non includono il prodotto sorgente Investiper
- i primi risultati sono prodotti in `EUR`, con `riskKiid` principalmente `3` o `4`, coerenti con il profilo sorgente nel mock attuale

Nota:

- la risoluzione sorgente oggi sceglie il match testuale migliore
- se in futuro ci sono molti prodotti con nome simile, puo' servire una UI di disambiguazione o un criterio piu' esplicito
- con il modello vero la similarita' tra prodotti dovrebbe migliorare perche' l'embedding sorgente sara' semantico, non mock/hash

#### 16. Validazione qualitativa "simili a ISIN"

Sono stati analizzati manualmente due casi di ricerca per prodotto simile usando ISIN.

Caso 1:

```text
fondo simile a AT0000495304
```

Risultati osservati:

```text
GG00B1YQ6R97
AT0000A1TB42
AT0000A1JU74
```

Valutazione:

- `AT0000495304` non e' presente in `src/products.json`
- quindi la POC non puo' recuperare davvero il prodotto sorgente dal dataset locale
- i risultati non sono affidabili come "prodotti simili"

Dettaglio qualitativo:

- `GG00B1YQ6R97`: poco convincente, GBP, non Raiffeisen, asset `Altro`, rischio non presente
- `AT0000A1TB42`: parzialmente plausibile per societa', EUR e rischio, ma differisce su sostenibilita', PAI e cedola
- `AT0000A1JU74`: solo parzialmente simile, rischio diverso e cedola/sostenibilita' diverse

Conclusione:

- serve gestire esplicitamente il caso `prodotto sorgente non trovato`
- in quel caso la UI o i log dovrebbero dire che non e' stata fatta una vera ricerca per similarita' prodotto

Caso 2:

```text
fondo simile a AT0000712716
```

Prodotto sorgente:

```json
{
  "productId": 8350,
  "isin": "AT0000712716",
  "name": "RAIFFEISEN-HEALTHCARE AKTIENFONDS",
  "managementCompany": "RAIFFEISEN KAPITALANLAGE GES.MBH",
  "riskKiid": 5,
  "currency": "EUR",
  "coupon": false,
  "sustainable": true,
  "ecoSustainable": true,
  "pai": true,
  "isPlaced": true
}
```

Risultati osservati:

```text
AT0000677927
AT0000A0LSJ0
AT0000765599
```

Valutazione:

- `AT0000677927`: molto simile sui campi disponibili
- `AT0000A0LSJ0`: molto simile sui campi disponibili
- `AT0000765599`: abbastanza simile, ma con `riskKiid` 4 invece di 5

Campi condivisi rilevanti:

- societa' Raiffeisen
- valuta EUR
- fondo
- cedola no
- sostenibile si
- eco-sostenibile si
- PAI si
- collocato si
- rischio vicino o uguale

Conclusione:

- quando il prodotto sorgente e' presente nel dataset, la modalita' "simili a ISIN" produce risultati plausibili sui campi oggi disponibili
- manca pero' informazione settoriale/tematica ricca: il sorgente e' Healthcare, ma i risultati non sono necessariamente Healthcare
- molte asset class nel dataset sono `Altro`, quindi la POC non puo' ancora distinguere bene settore, strategia o sottocategoria reale

Miglioramento consigliato:

- aggiungere descrizioni prodotto o campi asset class piu' informativi
- gestire esplicitamente sorgente non trovato
- loggare quale prodotto sorgente e' stato scelto
- eventualmente mostrare disambiguazione se piu' prodotti matchano lo stesso nome/ISIN

#### 17. Gestito "prodotto sorgente non trovato"

La modalita' "simili a X" ora distingue correttamente:

- intento `simili a X` non presente: usa la ricerca semantica standard
- intento `simili a X` presente e prodotto sorgente trovato: usa la ricerca prodotti simili
- intento `simili a X` presente ma prodotto sorgente non trovato: restituisce zero risultati e non fa fallback alla ricerca standard

File modificati:

```text
src/semantic-search/similarProducts.ts
src/semantic-search/semanticSearch.ts
```

Comportamento implementato:

```text
fondo simile a AT0000495304
```

Dato che `AT0000495304` non e' presente in `src/products.json`, la POC restituisce:

```text
0 risultati semantici su 509 prodotti
```

e logga:

```text
Mode: similar-products
Ricerca sorgente: at0000495304
Risultati: []
```

Verifica di regressione:

```text
fondo simile a AT0000712716
```

continua a funzionare e restituisce `20` risultati, con primi match:

```text
AT0000677927
AT0000A0LSJ0
AT0000765599
```

Conclusione:

- il caso "sorgente non trovato" ora e' esplicito e non produce piu' risultati fuorvianti
- resta da migliorare la comunicazione UI, per esempio con un messaggio dedicato "prodotto sorgente non trovato nel dataset POC"

#### 18. Log candidati sorgente per "simili a X"

La risoluzione del prodotto sorgente ora restituisce anche i candidati trovati.

File modificati:

```text
src/semantic-search/similarProducts.ts
src/semantic-search/semanticSearch.ts
```

Nuovo tipo logico:

```ts
SimilarProductsSourceCandidate
```

Campi principali:

- `productId`
- `isin`
- `name`
- `score`
- `product`

Nei log della modalita' prodotti simili ora vengono mostrati:

- query originale
- stringa sorgente estratta
- tabella candidati sorgente
- punteggio di match testuale
- prodotto sorgente scelto
- risultati simili finali

Verifiche:

```text
fondi simili a investiper
```

Risultato:

- continua a restituire `20` risultati
- nei log sono visibili i candidati sorgente, inclusi i prodotti Investiper presenti nel dataset

```text
fondo simile a AT0000495304
```

Risultato:

- restituisce `0` risultati
- nei log la tabella candidati sorgente e' vuota
- non viene eseguito fallback alla ricerca semantica standard

#### 19. Flag ambiguita' sorgente per "simili a X"

La modalita' "simili a X" ora segnala nei log se la scelta del prodotto sorgente e' ambigua.

File modificati:

```text
src/semantic-search/similarProducts.ts
src/semantic-search/semanticSearch.ts
```

Logica:

- vengono ordinati i candidati sorgente per `score`
- se i primi due candidati hanno uno score molto vicino, viene impostato:

```ts
ambiguousSource: true
```

- la ricerca continua comunque scegliendo il primo candidato
- la UI resta invariata
- il dettaglio dell'ambiguita' resta nei log, coerentemente con la scelta POC di non sporcare il catalogo

Soglia attuale:

```ts
AMBIGUOUS_SOURCE_SCORE_DISTANCE = 10
```

Nei log viene stampato:

```text
Sorgente ambigua: true/false
```

Questo serve soprattutto per query come:

```text
fondi simili a investiper
```

dove nel dataset possono esistere piu' prodotti compatibili con la stessa parola.

#### 20. Vincoli business nella modalita' "simili a X"

La modalita' "simili a X" ora supporta anche vincoli aggiuntivi scritti nella stessa query.

File modificati:

```text
src/semantic-search/similarProducts.ts
src/semantic-search/semanticSearch.ts
```

Query supportate:

```text
fondo simile a AT0000712716 senza cedola
fondo simile a AT0000712716 con cedola
fondo simile a AT0000712716 ma meno rischiosi
```

Logica implementata:

- `similarProducts.ts` estrae la parte sorgente e la parte vincolo
- se trova `ma`, divide la query in sorgente + vincolo
- se trova un ISIN seguito da altri termini, usa l'ISIN come sorgente e il resto come vincolo
- `semanticSearch.ts` calcola la similarita' rispetto al prodotto sorgente
- se esiste un vincolo, applica anche il ranking business
- per `meno rischiosi` e simili confronta il `riskKiid` del candidato con il `riskKiid` del prodotto sorgente

Esempi di verifica UI:

```text
fondo simile a AT0000712716
```

Primi risultati osservati:

```text
AT0000677927 - riskKiid 5 - cedola No
AT0000A0LSJ0 - riskKiid 5 - cedola No
AT0000765599 - riskKiid 4 - cedola No
```

```text
fondo simile a AT0000712716 ma meno rischiosi
```

Primi risultati osservati:

```text
FR0010213355 - riskKiid 1
FR0010885210 - riskKiid 1
FR0007493549 - riskKiid 1
AT0000785209 - riskKiid 2
AT0000859541 - riskKiid 2
```

```text
fondo simile a AT0000712716 con cedola
```

Primi risultati osservati:

```text
AT0000A0PG42 - cedola Si'
AT0000A0PG34 - cedola Si'
AT0000A0PG59 - cedola Si'
AT0000A2E091 - cedola Si'
AT0000859541 - cedola Si'
```

Nei log della console ora vengono mostrati:

- query originale
- prodotto sorgente scelto
- candidati sorgente
- eventuale sorgente ambigua
- vincoli aggiuntivi, oppure `nessuno`
- score semantico
- boost business
- score finale
- regole applicate

Nota:

- la UI resta invariata
- il dettaglio tecnico resta nelle loggate, come scelta esplicita della POC
- il modello e' ancora mock, quindi il vincolo business e' affidabile sui campi strutturati, mentre la similarita' semantica resta simulata

#### 21. Checklist query demo

E' stata creata una checklist tecnica dedicata per validare la POC prima e dopo modifiche a ranking, dataset, logica "simili a X" e futuro modello embedding.

File creato:

```text
SEMANTIC_SEARCH_QUERY_CHECKLIST.md
```

Contiene:

- query core per rischio, cedola, sostenibilita', valuta e asset class
- query negative e composte
- query specifiche per `simili a X`
- query da usare soprattutto dopo `transformers.js`
- campi console da annotare
- criteri di regressione

Scopo:

- avere una base stabile di test manuali
- confrontare il comportamento prima/dopo `transformers.js`
- evitare valutazioni solo qualitative
- capire subito se una modifica rompe ranking business o risoluzione sorgente

#### 22. Baseline score mock

E' stata eseguita la checklist con l'embedding mock attuale ed e' stata salvata una baseline completa degli score prima di introdurre `transformers.js`.

File creato:

```text
SEMANTIC_SEARCH_MOCK_BASELINE.md
```

Contiene, per 23 query:

- query eseguita
- obiettivo della query
- numero risultati
- top 3 prodotti
- `semanticScore`
- `businessBoost`
- `finalScore`
- `matchedRules`
- per query `simili a X`: sorgente scelta, candidati sorgente, vincolo e flag ambiguita'

Nota tecnica emersa durante la baseline:

- la divisione sorgente/vincolo in `simili a X` non deve usare i token arricchiti con sinonimi
- e' stata corretta la duplicazione del vincolo, per esempio `con cedola cedola`
- file corretto: `src/semantic-search/similarProducts.ts`

#### 23. Open point query understanding / query rewrite

E' stato aggiunto un task architetturale prima o insieme all'integrazione del modello vero:

```text
Usare un modello anche per interpretare il testo utente e trasformarlo in una query strutturata/normalizzata prima dell'embedding.
```

Pipeline desiderata:

```text
input utente
-> query understanding / query rewrite
-> intenti e vincoli strutturati
-> query semantica normalizzata
-> embedding
-> retrieval vettoriale
-> ranking business
```

Esempio:

```text
fondo con rendimento alto ma rischio basso
```

Output desiderato:

```json
{
  "intent": "search_products",
  "semanticQuery": "fondo con alto rendimento e basso rischio",
  "constraints": {
    "riskKiid": "low",
    "performance": "high"
  },
  "unsupportedConstraints": []
}
```

Se mancano dati performance, la stessa query dovrebbe poter produrre:

```json
{
  "intent": "search_products",
  "constraints": {
    "riskKiid": "low"
  },
  "unsupportedConstraints": ["performance"]
}
```

Scopo:

- capire meglio sinonimi e frasi naturali
- trasformare richieste vaghe in vincoli business espliciti
- loggare cosa il sistema ha capito
- distinguere cio' che si puo' cercare da cio' che manca nei dati
- evitare che tutta la responsabilita' cada sull'embedding

Task tecnico collegato:

- creare un modulo tipo `queryUnderstanding.ts`
- definire un tipo `ParsedSemanticQuery`
- estrarre intenti come `search_products`, `similar_products`, `compare_products`
- estrarre vincoli come rischio, cedola, sostenibilita', valuta, performance
- distinguere vincoli supportati e non supportati
- usare l'output sia per embedding sia per ranking business
- aggiungere log dedicati nella console POC

#### 24. Open point prodotti aggiuntivi / prodotti tematici

E' stata segnalata una lista di prodotti aggiuntivi rispetto al catalogo attuale, con altre tipologie di prodotti e prodotti associati ad aziende/temi, per esempio aziende automobilistiche come Tesla.

Obiettivo funzionale:

```text
Permettere al consulente di fare ricerche tematiche, per esempio prodotti collegati a Tesla, automotive, tecnologia, energia, ecc.
```

Questo richiede di arricchire il dataset semantico con informazioni che oggi non sono presenti nei 509 fondi locali.

Campi potenzialmente utili:

- `issuer`
- `companyName`
- `ticker`
- `sector`
- `theme`
- `industry`
- `underlyings`
- `exposure`
- `country`
- `productCategory`
- `description`
- eventuali metriche performance/rischio

Nota:

- questi prodotti potrebbero non essere fondi classici
- il tipo `SemanticProductSource` dovra' diventare piu' generale o essere esteso
- il testo semantico dovra' includere temi, sottostanti, emittente e settore
- la checklist andra' estesa con query tipo `prodotti collegati a Tesla`, `automotive`, `societa' tech`, ecc.

#### 25. Open point piccolo server API prodotti

Per usare i prodotti aggiuntivi nella POC serve un piccolo server che esponga un'API locale.

Obiettivo:

```text
Esporre via API i prodotti aggiuntivi e permettere al frontend di integrarli nell'indice semantico.
```

Endpoint minimi consigliati:

```text
GET /api/products
GET /api/products/:id
GET /api/products/search?q=...
```

Possibile struttura dati:

```text
server/
  products.json
  index.js
```

Oppure:

```text
src/server/
  products-extra.json
  productApi.ts
```

Scelte tecniche da valutare:

- usare Express o server Node minimale
- tenere il server separato dal frontend Vite
- aggiungere script `npm run api`
- aggiungere eventualmente script `npm run dev:all`
- normalizzare i prodotti API nello stesso formato semantico usato dal frontend

Task tecnico collegato:

- definire formato JSON dei prodotti aggiuntivi
- creare server locale read-only
- aggiungere endpoint lista/dettaglio/search
- aggiornare frontend per caricare anche prodotti API
- fondere prodotti locali + prodotti API nell'indice semantico
- aggiornare baseline e checklist

#### 26. Creato backend locale Node/Express/SQLite

E' stato creato un primo backend locale per la POC.

File/cartelle principali:

```text
server/index.js
server/README.md
server/data/products-base.json
server/data/products-extra.json
server/data/semantic-search.db
```

Script aggiunti:

```text
npm run api
npm run dev:all
```

Stack:

- Node.js
- Express
- SQLite tramite `node:sqlite`

Nota:

- `node:sqlite` e' sperimentale in Node 22, ma evita di installare un pacchetto SQLite nativo per la POC
- Express e' stato aggiunto alle dipendenze del progetto

Dati caricati:

```text
509 prodotti base
1000 prodotti aggiuntivi
1509 prodotti totali dopo deduplica per ISIN
```

Endpoint principali:

```text
GET /health
GET /api/products
GET /api/products/:id
GET /api/products/search?q=...
POST /products?page=0&size=20
```

Endpoint compatibile catalogo:

```text
POST /products
```

Restituisce una response paginata con:

```text
content
number
numberOfElements
totalElements
totalPages
last
```

Verifiche eseguite:

```text
GET /health -> 1509 prodotti
GET /api/products?q=TESLA -> restituisce TESLA INC
POST /products?page=0&size=3 -> restituisce response paginata
POST /products?page=0&size=3&types=FUND -> restituisce fondi paginati
```

Prossimo passo collegato:

- collegare il frontend al serverino
- decidere se usare il serverino solo per semantic search o anche per la tabella catalogo classica
- aggiornare la costruzione dell'indice semantico per usare `GET /api/products`

#### 27. Collegamento FE al bootstrap del server POC

Il frontend ora chiama il server POC quando si entra nella pagina catalogo prodotti.

File modificati:

```text
src/components/widget/WidgetProductList/WidgetProductList.tsx
server/index.js
server/README.md
```

Comportamento:

```text
mount pagina catalogo
-> GET http://127.0.0.1:3001/health
-> salva `products` in uno stato locale semplice
-> usa quei prodotti per costruire l'indice semantico
```

Fallback:

- se il server POC non e' disponibile, il frontend continua a usare `src/products.json`
- quindi la POC resta utilizzabile anche senza backend avviato

Decisione endpoint:

- `/health` restituisce stato, conteggi e lista prodotti completa
- `/api/products` non supporta piu' il filtro `q`
- la ricerca testuale API resta separata su `/api/products/search?q=...`

Nota:

- per ora la tabella catalogo classica continua a usare il flusso `fetchProducts`
- il collegamento al serverino e' usato per la semantic search/bootstrap dati POC
- resta da decidere se sostituire anche il catalogo classico con `POST /products` del serverino

### Stato attuale importante

La POC oggi funziona come flusso end-to-end e la ricerca semantica nella UI indicizza ancora il dataset locale:

In pratica:

```text
src/products.json -> indice semantico -> ricerca
```

Il catalogo classico continua invece a usare:

```text
prodotti caricati dalla tabella/API -> tabella standard
```

Questa separazione e' intenzionale per la POC: la ricerca classica resta invariata, mentre la semantica lavora su un dataset locale piu' ampio e stabile.

In parallelo e' ora disponibile un backend locale:

```text
server/data/products-base.json + server/data/products-extra.json -> SQLite -> API locale
```

Il frontend ora chiama `/health` del backend locale per popolare il dataset semantico, con fallback sul JSON locale.

### Limiti attuali

#### 1. Embedding ancora mock

La POC simula il comportamento del modello, ma non usa ancora un transformer reale.

Conseguenza:

- funziona bene con parole esplicite presenti o quasi presenti nei campi
- funziona peggio con frasi naturali piu' ambigue
- non capisce davvero il significato come farebbe un modello embedding

#### 2. Modalita' "simili a prodotto" da rifinire

La modalita' "simili a X" e' implementata e supporta anche vincoli business aggiuntivi.

Miglioramenti possibili:

- gestire disambiguazione se piu' prodotti matchano lo stesso nome
- mostrare in UI un messaggio dedicato se il prodotto sorgente non viene trovato
- aggiungere un titolo UI tipo `Prodotti simili a ...`

#### 3. Embedding ancora mock

La POC simula il comportamento del modello, ma non usa ancora un transformer reale.

Conseguenza:

- funziona bene con query esplicite e regole business
- funziona peggio con frasi naturali molto ambigue
- non capisce davvero il significato come farebbe un modello embedding

#### 4. Query understanding non ancora implementato

Oggi la query utente viene usata quasi direttamente:

```text
testo utente -> embedding/ranking
```

Manca ancora uno step esplicito:

```text
testo utente -> intenti/vincoli normalizzati -> embedding/ranking
```

Questo sara' utile soprattutto per query naturali complesse e per capire quando l'utente chiede dati non disponibili.

#### 5. Dataset ancora limitato ai prodotti locali

Il dataset semantico usato dalla UI attuale e' ancora `src/products.json`.

Il backend locale contiene gia':

- 509 prodotti base
- 1000 prodotti aggiuntivi
- SQLite locale
- API locale

Manca:

- decidere se collegare anche la tabella catalogo classica al backend locale
- arricchire i prodotti aggiuntivi con campi tema/settore/sottostanti se servono query tematiche robuste

### Prossimi task consigliati

#### Task 1 - Mostrare score e motivazioni in modalita' POC

Obiettivo:

- rendere la demo spiegabile
- capire perche' un prodotto e' stato ordinato in una certa posizione

Opzioni:

- aggiungere una colonna temporanea `score`
- aggiungere una label sotto il nome prodotto
- oppure loggare soltanto in console per non sporcare la UI

Per demo tecnica, almeno la console deve mostrare:

- score semantico
- boost business
- score finale
- motivi del boost

#### Task 2 - Rifinire "simili a X"

Obiettivo:

- rendere la modalita' piu' spiegabile e robusta

Micro-task consigliati:

1. decidere se la disambiguazione resta solo in console o se serve una micro-UI
2. mostrare in UI un messaggio dedicato quando il prodotto sorgente non viene trovato
3. valutare un titolo UI dedicato, senza sporcare troppo il catalogo reale
4. aggiungere query demo specifiche per `simili a X ma ...`

#### Task 3 - Sostituire il mock con `transformers.js`

Obiettivo:

- usare un vero modello embedding lato frontend

File principale da modificare:

```text
src/semantic-search/embeddingService.ts
```

Interfaccia da mantenere:

```ts
embedText(text): Promise<number[]>
```

Aspetti da gestire:

- caricamento modello una sola volta
- stato loading
- errori
- performance primo avvio
- eventuale download modello
- compatibilita' browser/Vite

Nota: il modello vero migliora il significato, ma non sostituisce il ranking business.

#### Task 4 - Query understanding / query rewrite

Obiettivo:

- interpretare il testo utente prima dell'embedding
- produrre una query normalizzata e vincoli strutturati
- loggare cosa il sistema ha capito

Output atteso:

```ts
interface ParsedSemanticQuery {
  originalQuery: string;
  semanticQuery: string;
  intent: "search_products" | "similar_products" | "compare_products";
  constraints: Record<string, unknown>;
  unsupportedConstraints: string[];
}
```

Esempi:

- `prudente` -> `riskKiid basso`
- `rendimento alto` -> `performance high`
- `simile a AT0000712716` -> intent `similar_products`
- `Tesla` -> tema/azienda/sottostante se presente nel dataset esteso

#### Task 5 - Server API prodotti aggiuntivi creato

Obiettivo:

- esporre la nuova lista prodotti passata dall'esterno
- includere prodotti diversi dai fondi attuali
- supportare ricerche tematiche su aziende/settori, per esempio automotive/Tesla

Micro-task consigliati:

1. completato: definire schema minimo dei prodotti aggiuntivi
2. completato: creare piccolo server locale read-only
3. completato: esporre `GET /api/products`
4. completato: esporre `GET /api/products/:id`
5. completato: esporre `GET /api/products/search?q=...`
6. completato: normalizzare prodotti base/extra in forma compatibile
7. completato: collegare frontend al bootstrap `/health`
8. completato: usare prodotti API nell'indice semantico, con fallback locale
9. da fare: decidere se collegare anche tabella catalogo classica al serverino

#### Task 6 - Cache embedding prodotti

Obiettivo:

- evitare di rigenerare gli embedding dei prodotti a ogni caricamento

Opzioni:

- cache in memoria
- `localStorage` per MVP
- `IndexedDB` se gli embedding diventano pesanti
- JSON precomputato in una fase successiva

#### Task 7 - Checklist query demo completata

Query minime da usare per validazione:

```text
fondi sostenibili con rischio basso in euro
fondi con rischio kiid basso
prodotti con cedola
fondi obbligazionari corporate
fondi dinamici con rischio alto
prodotti eco sostenibili con pai
fondi simili a investiper
fondo simile a AT0000712716 ma meno rischiosi
fondo simile a AT0000712716 con cedola
```

Per ogni query va verificato:

- i primi risultati sono coerenti?
- i campi business confermano il ranking?
- i log spiegano perche' un prodotto e' salito?
- ci sono risultati sorprendenti da correggere?

Checklist completa:

```text
SEMANTIC_SEARCH_QUERY_CHECKLIST.md
```

Baseline score mock:

```text
SEMANTIC_SEARCH_MOCK_BASELINE.md
```

### Open point dati performance dinamici

Le performance/rendimenti sono state rivalutate come dati dinamici, quindi non conviene renderle un prerequisito della prima POC.

```text
Performance, rendimento, NAV, prezzo e metriche giornaliere cambiano frequentemente.
```

Decisione:

- non basare la POC principale su performance/rendimento giornaliero
- non bloccare `transformers.js` o il server API su questi dati
- per query tipo `rendimento alto`, loggare/gestire il vincolo come non supportato o opzionale
- concentrarsi prima su dati piu' stabili: prodotto, emittente, settore, tema, sottostanti, asset class, rischio, valuta, cedola, sostenibilita'

Dati dinamici eventualmente gestibili in una fase successiva:

- `performanceYtd`
- `performance1Y`
- `performance3Y`
- `performance5Y`
- `yield`
- `volatility`
- `sharpeRatio`
- `maxDrawdown`
- `ter`
- eventuale cedola percentuale

Se verranno aggiunti piu' avanti:

- salvarli con `asOfDate` / data aggiornamento
- tenerli opzionali rispetto al ranking principale
- evitare di usarli per demo se non aggiornati o affidabili
- aggiornare `SemanticProductSource`
- aggiornare `buildProductSemanticText`
- aggiornare `businessRanking` per intenti come `rendimento alto`, `performance alta`, `buon rapporto rischio rendimento`
- rigenerare baseline score

### Ordine consigliato da qui

Ordine pragmatico:

1. decidere se sostituire anche la tabella catalogo classica o solo la semantic search
2. aggiornare testo semantico con campi stabili: tema, settore, azienda, sottostanti, emittente
3. introdurre query understanding / query rewrite
4. aggiornare checklist e baseline con query tematiche tipo Tesla/automotive
5. integrare `transformers.js`
6. rieseguire la checklist e confrontarla con `SEMANTIC_SEARCH_MOCK_BASELINE.md`
7. aggiungere cache embedding

Motivo:

- ora il dataset locale e' collegato e abbastanza ampio per testare query realistiche
- il reranking business copre casi positivi, negativi e composti
- la modalita' prodotti simili e' presente, ma puo' essere resa piu' spiegabile
- performance/rendimento sono dati dinamici e non sono centrali nella prima POC
- per query tematiche tipo Tesla servono prodotti aggiuntivi e campi tema/sottostante
- il query understanding aiuta a trasformare frasi naturali in vincoli e intenti espliciti

Altrimenti il modello rischia di capire meglio la richiesta, ma non avere comunque informazioni sufficienti per rispondere correttamente.

---

## Aggiornamento operativo - 2026-06-22

### Task svolto - Inserito modello embedding reale

Il mock embedding e' stato sostituito con una pipeline reale basata su:

```text
@huggingface/transformers
```

Pacchetto installato:

```text
@huggingface/transformers
```

File modificati:

```text
src/semantic-search/embeddingService.ts
src/semantic-search/semanticSearch.ts
package.json
package-lock.json
```

Modello configurato:

```text
Xenova/paraphrase-multilingual-MiniLM-L12-v2
```

Motivo della scelta:

- supporta `feature-extraction` in Transformers.js
- e' multilingua, utile per query italiane e dati prodotto misti
- e' piu' adatto della variante solo inglese per questa POC

Pipeline attuale:

```text
testo prodotto/query
-> pipeline("feature-extraction")
-> pooling mean
-> normalize true
-> vettore reale
-> cosine similarity
-> ranking business
```

La funzione pubblica e' rimasta invariata:

```ts
embedText(text): Promise<number[]>
```

Quindi il resto della pipeline continua a usare la stessa interfaccia.

### Fallback mantenuto

Dentro `embeddingService.ts` e' stato mantenuto un fallback mock.

Serve solo come protezione:

- se il modello non viene scaricato
- se la rete non e' disponibile
- se Transformers.js fallisce in runtime

In quel caso la console logga esplicitamente:

```text
Fallback embedding mock
```

e la POC non va in errore bloccante.

### Cache embedding in memoria

E' stata aggiunta una cache in memoria:

```ts
Map<string, Promise<SemanticEmbedding>>
```

Obiettivo:

- evitare di rigenerare piu' volte lo stesso embedding nella stessa sessione browser
- condividere la promise se lo stesso testo viene richiesto mentre il modello sta ancora lavorando

Nota:

- questa cache vive solo in memoria
- al refresh pagina viene persa
- resta ancora da fare una cache persistente o un precompute degli embedding

### Indicizzazione resa progressiva

Prima l'indice prodotti veniva costruito con:

```ts
Promise.all(...)
```

Questo era comodo con il mock, ma rischioso con un modello reale perche' poteva lanciare centinaia o migliaia di inferenze insieme.

Ora `buildSemanticIndex(products)` lavora in modo progressivo:

```text
prodotto 1 -> embedding
prodotto 2 -> embedding
...
```

e logga avanzamento ogni 25 prodotti:

```text
Avanzamento indice prodotti
```

Questo rende il primo caricamento piu' controllabile, anche se potenzialmente piu' lento.

### Impatto atteso

Al primo accesso alla pagina catalogo:

- il browser deve caricare Transformers.js
- il browser deve scaricare il modello da Hugging Face
- il browser deve generare gli embedding dei prodotti del dataset semantico

Quindi il primo giro puo' essere lento.

Dopo il primo caricamento:

- il modello resta caricato in memoria
- gli embedding gia' generati vengono riusati dalla cache in memoria
- le query successive dovrebbero essere piu' rapide

### Stato attuale dopo questo task

La POC non usa piu' solo l'embedding mock come motore principale.

Stato reale:

```text
embedding principale: Transformers.js
fallback: mock deterministico
cache: in memoria
precompute persistente: non ancora presente
query understanding: non ancora presente
```

### Prossimi task consigliati aggiornati

#### Task 1 - Validare runtime con modello reale

Obiettivo:

- aprire la pagina catalogo
- aspettare caricamento modello e indice
- eseguire la checklist query
- confrontare i risultati con `SEMANTIC_SEARCH_MOCK_BASELINE.md`

Da osservare:

- tempo primo caricamento
- eventuali errori download modello
- dimensione vettore reale
- score semantici rispetto alla baseline mock
- qualita' top 3/top 10 per query core

#### Task 2 - Cache persistente / precompute embedding

Obiettivo:

- evitare di rigenerare gli embedding di tutti i prodotti a ogni refresh

Opzioni:

- `localStorage` solo se la dimensione resta gestibile
- `IndexedDB` per MVP browser piu' robusto
- precompute lato Node e salvataggio su SQLite/JSON

Per la POC con backend locale, l'opzione piu' pulita sara':

```text
server Node -> genera/salva embedding -> FE carica prodotti + embedding
```

#### Task 3 - Query understanding / query rewrite

Obiettivo:

- trasformare l'input utente in una query normalizzata e vincoli strutturati prima dell'embedding

Esempio:

```text
fondo con rendimento alto ma rischio basso
```

deve diventare qualcosa tipo:

```json
{
  "semanticQuery": "fondo con rischio basso",
  "constraints": {
    "riskKiid": "low"
  },
  "unsupportedConstraints": ["performance"]
}
```

Questo task richiedera' un modello diverso dal modello embedding, perche' serve interpretare/riscrivere testo, non produrre vettori.

#### Task 4 - Arricchire testo semantico con campi tema/settore/sottostanti

Obiettivo:

- migliorare query tipo `prodotti automotive`, `Tesla`, `case farmaceutiche`
- usare in modo piu' solido i prodotti aggiuntivi del server POC

Campi utili:

- tema
- settore
- azienda
- emittente
- sottostanti
- descrizione

#### Task 5 - Rifinire UI/log dei prodotti simili

Obiettivo:

- mostrare meglio quando il prodotto sorgente non viene trovato
- rendere chiaro quale sorgente e' stata scelta
- lasciare in console candidati, ambiguita', score e vincoli

#### Task 6 - Definire similarita' per caratteristiche disponibili

Obiettivo:

- rendere la modalita' `prodotti simili a X` piu' coerente con i dati realmente disponibili
- evitare che sugli equity/prodotti extra la similarita' sembri casuale
- non dare per disponibili campi che oggi non abbiamo, come settore, industria, tema, descrizione o sottostanti

Problema osservato:

```text
prodotti simili a FR0014011QJ8
```

Il prodotto sorgente viene risolto correttamente tramite ISIN esatto ed escluso dai risultati, ma i prodotti restituiti possono sembrare poco simili dal punto di vista business.

Motivo:

- per i fondi base abbiamo campi finanziari abbastanza confrontabili: `riskKiid`, `currency`, `sustainable`, `ecoSustainable`, `pai`, `coupon`, `productType`, asset class, societa'/sicav
- per gli equity/prodotti extra abbiamo spesso campi piu' generici: `productType`, `caaFirstLevelType`, `riskKiid`, `currency`, `sustainable`, `ecoSustainable`, `pai`, `bicType`
- senza settore/industria/tema/descrizione, due equity possono risultare simili solo per rischio, valuta e flag ESG, anche se appartengono a business diversi

Decisione POC:

La similarita' deve essere esplicita e basata sui campi disponibili.

Prima versione consigliata:

```text
similarita' = embeddingScore
            + stesso productType
            + stesso caaFirstLevelType / asset class
            + rischio KIID vicino
            + stessa valuta
            + stessi flag sostenibilita'/eco/PAI/BIC/cedola
```

Per gli equity/prodotti extra:

- dare molto peso a `productType === EQUITY`
- dare peso a rischio vicino
- dare peso a `currency`
- dare peso a `sustainable`, `ecoSustainable`, `pai`, `bicType`
- evitare di fingere similarita' settoriale se il settore non e' presente

Output atteso nei log:

```text
similarityScore
characteristicsBoost
finalScore
matchedCharacteristics
sourceProduct
```

Task tecnici:

1. creare una funzione dedicata tipo `calculateCharacteristicsSimilarity(sourceProduct, candidateProduct)`
2. usare questa funzione dentro `findSimilarProducts`
3. separare nei log `embeddingScore`, `characteristicsBoost` e `finalScore`
4. aggiungere alla checklist casi `simili a ISIN` sia su fondi sia su equity
5. valutare solo dopo se arricchire il dataset con campi `sector`, `theme`, `industry`, `description`, `underlyings`

### Task svolto - Cache embedding prodotti su SQLite

Gli embedding dei prodotti vengono ora salvati nel DB SQLite del server POC.

File principali:

```text
server/semanticEmbeddings.js
server/index.js
src/semantic-search/semanticTypes.ts
src/semantic-search/semanticSearch.ts
src/components/widget/WidgetProductList/WidgetProductList.tsx
```

Tabella usata:

```text
product_embeddings
```

Chiave logica di riuso:

```text
isin
model_name
model_version
semantic_text_hash
```

Questo significa:

- se il prodotto e' gia' stato embeddato con lo stesso modello
- e il testo semantico prodotto non e' cambiato
- allora l'embedding viene letto da SQLite
- se cambia modello, versione, quantizzazione, pooling o testo semantico, l'embedding viene rigenerato

Versione modello corrente:

```text
model_name: Xenova/paraphrase-multilingual-MiniLM-L12-v2
model_version: task:feature-extraction|dtype:q4|pooling:mean|normalize:true|semanticText:v1
```

Comportamento server:

```text
avvio server
-> legge prodotti
-> controlla embedding in product_embeddings
-> genera solo quelli mancanti
-> salva embedding_json
-> /health restituisce prodotti + semanticEmbedding
```

Comportamento frontend:

```text
/health
-> prodotti con semanticEmbedding
-> buildSemanticIndex usa embedding precomputato
-> non rigenera embedding prodotto nel browser se gia' presente
```

Nota:

- la query utente viene ancora embedddata lato browser
- quindi il browser carica ancora il modello per la query
- pero' non deve piu' rigenerare i 1509 embedding prodotto a ogni refresh

Verifica eseguita:

```text
product_embeddings: 1509 righe
secondo avvio server: cached 1509, generated 0, failed 0
/health aggiornato: productsWithEmbedding 1509
dimensione embedding: 384
```

Nota operativa:

- durante il test esisteva gia' un server vecchio sulla porta `3001`
- il codice aggiornato e' stato verificato su `PORT=3002`
- per usare il nuovo comportamento in UI bisogna fermare il vecchio server su `3001` e riavviare `npm run api`
