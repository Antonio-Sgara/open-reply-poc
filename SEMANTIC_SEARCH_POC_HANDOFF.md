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

### Stato attuale importante

La POC oggi funziona come flusso end-to-end, ma la ricerca semantica nella UI indicizza ancora i prodotti presenti nello stato `products` del componente catalogo.

In pratica:

```text
prodotti caricati dalla tabella/API -> indice semantico -> ricerca
```

Il nuovo file:

```text
src/products.json
```

non e' ancora collegato alla pipeline UI.

Quindi, finche' non viene collegato, la ricerca continua a lavorare sul batch caricato dalla tabella, non sui 509 prodotti del JSON.

### Limiti attuali

#### 1. Embedding ancora mock

La POC simula il comportamento del modello, ma non usa ancora un transformer reale.

Conseguenza:

- funziona bene con parole esplicite presenti o quasi presenti nei campi
- funziona peggio con frasi naturali piu' ambigue
- non capisce davvero il significato come farebbe un modello embedding

#### 2. Ranking numerico non ancora business-aware

Query come:

```text
fondi con rischio kiid basso
```

non garantiscono ancora che `riskKiid: 3` venga sempre prima di `riskKiid: 4`.

Motivo:

- `riskKiid` oggi entra come testo
- lo score e' principalmente vettoriale/mock
- manca un reranking esplicito per campi numerici e booleani

#### 3. Dataset JSON non ancora usato dalla UI

`src/products.json` e' pronto, ma deve essere collegato alla ricerca per indicizzare 509 prodotti invece dei soli prodotti caricati a pagina.

#### 4. Modalita' "simili a prodotto" non ancora esposta

La funzione tecnica:

```ts
findSimilarProducts(productId, index)
```

esiste, ma non e' ancora collegata a:

- UI
- parsing query tipo "fondi simili a investiper"
- ricerca del prodotto sorgente per nome/ISIN

### Prossimi task consigliati

#### Task 1 - Collegare `src/products.json` alla ricerca semantica

Obiettivo:

- usare i 509 prodotti locali come indice semantico della POC
- non limitarsi ai 10 prodotti caricati dalla tabella

Possibile approccio:

1. importare `src/products.json` nel componente catalogo o in un servizio dedicato
2. passare quel dataset a `useSemanticProductSearch`
3. mantenere la tabella standard per la ricerca classica
4. quando la ricerca semantica e' attiva, mostrare i risultati dal JSON

Decisione da prendere:

- usare sempre `products.json` per la semantica
- oppure usare `products.json` solo in modalita' POC/debug

#### Task 2 - Aggiungere ranking business sopra lo score semantico

Obiettivo:

- rendere coerenti query esplicite su campi finanziari

Regole consigliate:

- se la query contiene `rischio basso`, favorire `riskKiid` piu' basso
- se la query contiene `prudente` o `difensivo`, favorire `riskKiid <= 3`
- se la query contiene `rischio alto` o `dinamico`, favorire `riskKiid >= 5`
- se la query contiene `kiid 3`, favorire `riskKiid === 3`
- se la query contiene `sostenibile`, favorire `sustainable === true`
- se la query contiene `eco`, favorire `ecoSustainable === true`
- se la query contiene `pai`, favorire `pai === true`
- se la query contiene `cedola`, favorire `coupon === true`
- se la query contiene `euro` o `eur`, favorire `currency === "EUR"`

Output desiderato:

```ts
finalScore = semanticScore + businessBoost
```

e nei log:

```text
semanticScore
businessBoost
finalScore
matchedRules
```

#### Task 3 - Mostrare score e motivazioni in modalita' POC

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

#### Task 4 - Implementare "simili a X"

Obiettivo:

supportare query come:

```text
trovami fondi simili a investiper
```

Micro-task:

1. rilevare pattern `simili a ...`
2. estrarre il nome prodotto cercato
3. cercare nel catalogo locale il prodotto sorgente per nome o ISIN
4. se ci sono piu' match, scegliere il migliore o chiedere disambiguazione
5. recuperare il suo embedding
6. chiamare `findSimilarProducts(productId, index)`
7. escludere il prodotto sorgente dai risultati
8. mostrare risultati con titolo tipo `Prodotti simili a ...`

#### Task 5 - Sostituire il mock con `transformers.js`

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

#### Task 6 - Cache embedding prodotti

Obiettivo:

- evitare di rigenerare gli embedding dei prodotti a ogni caricamento

Opzioni:

- cache in memoria
- `localStorage` per MVP
- `IndexedDB` se gli embedding diventano pesanti
- JSON precomputato in una fase successiva

#### Task 7 - Preparare checklist query demo

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

1. collegare `src/products.json` alla ricerca semantica
2. aggiungere reranking business
3. migliorare log con `semanticScore`, `businessBoost`, `finalScore`
4. validare con query demo
5. implementare "simili a X"
6. integrare `transformers.js`
7. aggiungere cache embedding

Motivo:

- prima serve un dataset abbastanza ampio
- poi serve ranking coerente con le regole finanziarie esplicite
- solo dopo conviene introdurre il modello vero

Altrimenti il modello rischia di migliorare la semantica generale, ma lasciare irrisolti problemi business come `riskKiid` ordinato male.
