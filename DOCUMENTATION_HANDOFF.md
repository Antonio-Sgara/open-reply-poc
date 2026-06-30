# Guida al progetto (per chi parte da zero)

Questa guida spiega **cos'è questo progetto** e **come funziona**, scritta per
una persona che non l'ha mai visto e non è per forza esperta. Niente parole
difficili: dove serve un termine tecnico, lo spieghiamo subito.

> C'è anche un altro documento, [`SEMANTIC_SEARCH_POC_HANDOFF.md`](./SEMANTIC_SEARCH_POC_HANDOFF.md),
> che racconta l'**idea** e l'**utilità** della ricerca semantica. Questo file invece
> spiega **com'è fatto dentro** e **dove mettere le mani**.

---

## 1. Cos'è questo progetto, in parole semplici

È una **demo** (in gergo "POC", cioè *proof of concept*: una prova per dimostrare
che un'idea funziona).

L'idea è questa: di solito per cercare un fondo di investimento devi usare filtri
rigidi (valuta = euro, rischio = basso, ecc.). Qui invece puoi **scrivere una frase
normale**, tipo:

> *"fondi sostenibili con rischio basso in euro"*

e il sistema capisce cosa intendi e ti mostra i prodotti giusti. Questa si chiama
**ricerca semantica** (cioè ricerca "per significato", non per parole esatte).

La demo mostra questa ricerca dentro una finta pagina di catalogo prodotti, simile
a quella della piattaforma reale di una banca.

---

## 2. Cosa serve per farlo partire sul tuo computer

Serve avere installato **Node.js** (versione 22). Node è il programma che fa girare
tutto questo codice.

Poi apri il terminale dentro la cartella del progetto e scrivi, una riga alla volta:

```bash
npm install     # scarica tutti i pezzi di cui il progetto ha bisogno (si fa una volta sola)
npm run dev     # avvia la demo
```

Dopo `npm run dev`, il terminale ti dà un indirizzo (tipo `http://localhost:5173`).
Aprilo nel browser e vedi la demo.

Per fermarla: nel terminale premi `Ctrl + C`.

> **La prima ricerca può essere lenta.** La demo usa un piccolo modello di
> intelligenza artificiale che viene **scaricato dal browser la prima volta** (serve
> quindi una connessione a internet al primo avvio). Dopo che è stato scaricato,
> resta in memoria e le ricerche diventano veloci. Se per qualche motivo non riesce
> a scaricarlo, la demo continua comunque a funzionare con un metodo più semplice
> di riserva (vedi §4).

Altri comandi che puoi vedere in giro (non servono per la demo di tutti i giorni):

| Comando | A cosa serve |
|---|---|
| `npm run build` | Prepara la versione "definitiva" pronta da pubblicare online |
| `npm run lint` | Controlla che il codice sia scritto in modo pulito |
| `npm run typecheck` | Controlla che non ci siano errori di tipo nel codice |

---

## 3. Come è organizzato il progetto

Quando apri la cartella vedi tanti file. Quelli che contano per capire sono pochi.
Tutto il codice vero sta nella cartella **`src`** ("source", cioè "sorgente").

Le parti più importanti dentro `src`:

| Cartella / file | Cos'è, detto semplice |
|---|---|
| **`semantic-search/`** | **Il cuore della demo.** Qui c'è il "cervello" che capisce le frasi e trova i prodotti giusti. È la parte interessante. |
| `products.json` | L'elenco dei prodotti finti su cui si cerca (circa 500 fondi). È come un piccolo "database" salvato in un file. |
| `pages/` | Le pagine che vedi a schermo (home, prodotti, profilo...). |
| `components/` | I "pezzi" riutilizzabili di interfaccia: pulsanti, tabelle, barre di ricerca, ecc. (come i mattoncini Lego con cui sono fatte le pagine). |
| `store/` | La "memoria" dell'app: dove vengono tenuti i dati mentre la usi. |
| `styles/`, `assets/` | L'aspetto grafico: colori, font, icone, immagini. |

Le altre cartelle sono dettagli tecnici: per capire la demo puoi ignorarle all'inizio.

---

## 4. Come funziona la ricerca semantica (il pezzo importante)

Questa è la parte da capire bene. La spieghiamo passo passo, con un'immagine mentale.

**Il problema:** il computer non capisce le parole come noi. Allora dobbiamo
trasformare sia i prodotti sia la tua frase in **numeri**, e poi confrontare i numeri.

Funziona così:

1. **Ogni prodotto viene "descritto" con una frase.**
   Per esempio un fondo diventa: *"Nome: ... Valuta: euro. Rischio basso. Sostenibile: sì..."*.

2. **Quella frase viene trasformata in una lista di numeri** (si chiama *embedding*:
   pensalo come una specie di "impronta digitale" fatta di numeri che rappresenta il
   significato della frase). A trasformare le frasi in numeri ci pensa un **modello
   di intelligenza artificiale** vero e proprio (un modello "leggero" e multilingue,
   capace di capire l'italiano), che gira direttamente nel browser.

3. **Anche la tua frase di ricerca** viene trasformata nella stessa lista di numeri.

4. **Si confrontano i numeri** della tua ricerca con quelli di ogni prodotto: più
   sono simili, più il prodotto è adatto.

5. **Si ordinano i prodotti** dal più adatto al meno adatto e si mostrano i primi.

In più c'è una piccola "intelligenza extra": il sistema riconosce parole chiave come
*rischio basso*, *cedola*, *sostenibile*, *euro*, *senza...* e dà una spinta (o una
penalità) ai prodotti giusti. Così se scrivi *"senza cedola"* evita i prodotti con
cedola.

**Due cose importanti da sapere:**

- **Usa una vera intelligenza artificiale.** Il modello (si chiama
  *paraphrase-multilingual-MiniLM*) viene scaricato e fatto girare dentro il browser,
  senza inviare niente a server esterni. È "leggero" apposta per poter funzionare sul
  computer dell'utente.
- **C'è un metodo di riserva.** Se il modello non si riesce a scaricare o a far
  partire (per esempio senza internet), la demo passa automaticamente a un metodo più
  semplice e "fatto in casa", così non si blocca mai. I risultati sono meno precisi,
  ma la ricerca continua a funzionare.

**Piccola ottimizzazione possibile:** trasformare i prodotti in numeri ogni volta
costa tempo. Il codice è già pronto per usare numeri **già calcolati in anticipo** e
salvati insieme ai prodotti (così la demo parte subito). Al momento il file dei
prodotti non li contiene ancora, quindi vengono calcolati al volo.

### I file dentro `semantic-search/` (se ti serve sapere chi fa cosa)

| File | Cosa fa |
|---|---|
| `buildProductSemanticText.ts` | Trasforma un prodotto nella frase che lo descrive (passo 1). |
| `embeddingService.ts` | Trasforma una frase nei numeri / "impronta" (passi 2 e 3). Qui dentro c'è il caricamento del modello di AI, la memoria temporanea dei risultati e il metodo di riserva. |
| `similarity.ts` | Confronta due "impronte" e dice quanto si somigliano (passo 4). |
| `businessRanking.ts` | L'intelligenza extra sulle parole chiave (rischio, cedola, ecc.). |
| `similarProducts.ts` | Gestisce le ricerche tipo *"prodotti simili a X"*. |
| `semanticSearch.ts` | Mette tutto in fila e produce il risultato finale. |
| `useSemanticProductSearch.ts` | Collega tutto questo alla pagina che vedi a schermo. |
| `debug.ts` | Scrive messaggi di controllo nella console del browser (utile per chi sviluppa). |

---

## 5. Dove appare la ricerca nella pagina

La barra di ricerca semantica si trova nella pagina **Prodotti** della demo.
Il codice che la disegna sta in
[`components/widget/WidgetProductList/WidgetProductList.tsx`](./src/components/widget/WidgetProductList/WidgetProductList.tsx).

C'è una casella di testo dove scrivi la frase (con un esempio già scritto come
suggerimento), un pulsante **Cerca** e un pulsante **Reset** per ricominciare.

Una nota utile: la ricerca semantica lavora **sui ~500 prodotti del file
`products.json`**, non sui prodotti che arrivano dal server della banca. Sono due
ricerche diverse che convivono nella stessa pagina.

---

## 6. Le cose da sapere per non sbagliare

Poche avvertenze pratiche, scritte semplice:

- **Per cambiare i prodotti della demo** modifica il file `src/products.json`.
- **Per cambiare quali parole capisce la ricerca** (sinonimi, regole) si lavora nei
  file `embeddingService.ts` e `businessRanking.ts` dentro `semantic-search/`.
- **C'è una password di test scritta direttamente nel codice** (in
  `src/store/store.ts`) che serve solo per far partire la demo in locale senza login.
  Va tolta prima di usare il progetto sul serio.
- **Alcuni file sono "spazzatura" rimasta lì** e si possono ignorare/cancellare:
  la cartella `src/__MACOSX/` e il file `README.mdgit` (nome sbagliato).
- **Il modello di AI si scarica la prima volta**: serve internet al primo avvio e la
  prima ricerca è più lenta. Se non si scarica, parte il metodo di riserva.
- **I messaggi di "debug"**: la demo scrive parecchi messaggi nella console del
  browser per far capire cosa sta facendo. Se vuoi una demo "pulita", si disattivano
  mettendo a `false` la riga `SEMANTIC_SEARCH_DEBUG` nel file
  `semantic-search/debug.ts`.

---

## 7. Riassunto in 5 righe

- È una **demo** di ricerca di fondi scrivendo frasi normali invece che filtri.
- Il pezzo importante è la cartella **`semantic-search/`**.
- I prodotti di prova stanno nel file **`products.json`**.
- Si avvia con **`npm install`** e poi **`npm run dev`**.
- Il "cervello" usa una **vera AI** che gira nel browser (con un metodo semplice di
  riserva se non si carica).
