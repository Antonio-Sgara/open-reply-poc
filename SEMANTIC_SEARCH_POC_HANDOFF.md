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
