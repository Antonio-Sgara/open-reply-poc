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

### Stato attuale importante

La POC oggi funziona come flusso end-to-end e la ricerca semantica nella UI indicizza il dataset locale:

In pratica:

```text
src/products.json -> indice semantico -> ricerca
```

Il catalogo classico continua invece a usare:

```text
prodotti caricati dalla tabella/API -> tabella standard
```

Questa separazione e' intenzionale per la POC: la ricerca classica resta invariata, mentre la semantica lavora su un dataset locale piu' ampio e stabile.

### Limiti attuali

#### 1. Embedding ancora mock

La POC simula il comportamento del modello, ma non usa ancora un transformer reale.

Conseguenza:

- funziona bene con parole esplicite presenti o quasi presenti nei campi
- funziona peggio con frasi naturali piu' ambigue
- non capisce davvero il significato come farebbe un modello embedding

#### 2. Modalita' "simili a prodotto" da rifinire

La modalita' "simili a X" e' implementata, ma resta da rifinire.

Miglioramenti possibili:

- mostrare nei log il punteggio usato per scegliere il prodotto sorgente
- gestire disambiguazione se piu' prodotti matchano lo stesso nome
- consentire query per ISIN esplicito
- aggiungere un titolo UI tipo `Prodotti simili a ...`
- combinare similarita' prodotto con vincoli business aggiuntivi, per esempio `simili a investiper ma meno rischiosi`

#### 3. Embedding ancora mock

La POC simula il comportamento del modello, ma non usa ancora un transformer reale.

Conseguenza:

- funziona bene con query esplicite e regole business
- funziona peggio con frasi naturali molto ambigue
- non capisce davvero il significato come farebbe un modello embedding

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

1. loggare candidati sorgente e punteggio di match
2. gestire casi con piu' prodotti sorgente simili
3. supportare query per ISIN, per esempio `simili a IT0001079398`
4. valutare vincoli aggiuntivi, per esempio `simili a investiper ma meno rischiosi`
5. valutare un titolo UI dedicato, senza sporcare troppo il catalogo reale

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

#### Task 4 - Cache embedding prodotti

Obiettivo:

- evitare di rigenerare gli embedding dei prodotti a ogni caricamento

Opzioni:

- cache in memoria
- `localStorage` per MVP
- `IndexedDB` se gli embedding diventano pesanti
- JSON precomputato in una fase successiva

#### Task 5 - Preparare checklist query demo

Query minime da usare per validazione:

```text
fondi sostenibili con rischio basso in euro
fondi con rischio kiid basso
prodotti con cedola
fondi obbligazionari corporate
fondi dinamici con rischio alto
prodotti eco sostenibili con pai
fondi simili a investiper
```

Per ogni query va verificato:

- i primi risultati sono coerenti?
- i campi business confermano il ranking?
- i log spiegano perche' un prodotto e' salito?
- ci sono risultati sorprendenti da correggere?

### Ordine consigliato da qui

Ordine pragmatico:

1. mostrare o rendere piu' leggibili score e motivazioni in modalita' POC
2. rifinire "simili a X"
3. preparare checklist query demo completa
4. integrare `transformers.js`
5. aggiungere cache embedding

Motivo:

- ora il dataset locale e' collegato e abbastanza ampio per testare query realistiche
- il reranking business copre casi positivi, negativi e composti
- la modalita' prodotti simili e' presente, ma puo' essere resa piu' spiegabile
- solo dopo conviene introdurre il modello vero

Altrimenti il modello rischia di migliorare la semantica generale, ma lasciare poco chiaro perche' un prodotto salga o scenda nel ranking.
