# Guida al progetto (per chi parte da zero)

Questa guida spiega **cos'è questo progetto** e **come funziona**, scritta per
una persona che non l'ha mai visto e non è per forza esperta. Niente parole
difficili: dove serve un termine tecnico, lo spieghiamo subito.

> C'è anche un altro documento, [`SEMANTIC_SEARCH_POC_HANDOFF.md`](./SEMANTIC_SEARCH_POC_HANDOFF.md):
> è il **diario tecnico** della POC, dove sono annotate tutte le decisioni prese e le
> cose ancora da fare. Questa guida invece serve a **capire il progetto in fretta**.

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

## 2. Le due parti del progetto

Il progetto è fatto di **due programmi che lavorano insieme**:

| Parte | Cos'è | Dove sta |
|---|---|---|
| **Frontend** | Quello che vedi: le pagine, la barra di ricerca, la tabella dei prodotti. È anche il posto dove gira l'intelligenza artificiale che capisce le frasi. | cartella `src/` |
| **Backend** ("il serverino") | Un piccolo programma che tiene l'elenco dei prodotti e si ricorda i calcoli già fatti, così la demo non deve rifarli ogni volta. | cartella `server/` |

Non è obbligatorio avere entrambi: se il serverino non è acceso, la demo funziona
lo stesso usando un elenco di prodotti salvato in un file (ma con meno prodotti).

---

## 3. Come farlo partire sul tuo computer

Serve avere installato **Node.js** (versione 22). Node è il programma che fa girare
tutto questo codice.

Apri il terminale nella cartella del progetto:

```bash
npm install      # scarica i pezzi di cui il progetto ha bisogno (si fa una volta sola)
npm run dev:all  # avvia insieme il serverino e la demo
```

Poi apri nel browser l'indirizzo che ti stampa il terminale (tipo `http://localhost:5173`).
Per fermare tutto: `Ctrl + C`.

Se preferisci avviarli separati, in due terminali:

```bash
npm run api   # solo il serverino  (risponde su http://127.0.0.1:3001)
npm run dev   # solo la demo (il frontend)
```

> **Il primo avvio è lento, è normale.** Succedono due cose una volta sola:
> 1. il browser **scarica un piccolo modello di intelligenza artificiale** (serve
>    internet la prima volta);
> 2. la demo **trasforma tutti i prodotti in numeri** (vedi §5) — sono oltre 1500,
>    quindi ci mette un po'.
>
> Questi calcoli vengono **salvati dal serverino**, così dalla volta dopo la pagina
> parte molto più veloce. Se il modello non riesce a scaricarsi, la demo continua
> comunque a funzionare con un metodo di riserva più semplice.

Altri comandi che puoi incontrare (non servono tutti i giorni):

| Comando | A cosa serve |
|---|---|
| `npm run build` | Prepara la versione "definitiva" pronta da pubblicare |
| `npm run lint` | Controlla che il codice sia scritto in modo pulito |
| `npm run typecheck` | Controlla che non ci siano errori nel codice |

---

## 4. Come è organizzato il progetto

Le parti che contano davvero sono poche.

**Nel frontend (`src/`):**

| Cartella / file | Cos'è, detto semplice |
|---|---|
| **`semantic-search/`** | **Il cuore della demo.** Il "cervello" che capisce le frasi e trova i prodotti giusti. |
| `components/widget/WidgetProductList/` | La pagina del catalogo: barra di ricerca, tabella prodotti, box dei risultati migliori. |
| `products.json` | Un elenco di ~509 prodotti salvato in un file. Serve come **riserva**, se il serverino non è acceso. |
| `pages/` | Le pagine che vedi (home, prodotti, dettaglio prodotto, profilo). |
| `components/` | I "pezzi" riutilizzabili: pulsanti, tabelle, grafici (come mattoncini Lego). |
| `store/` | La "memoria" dell'app mentre la usi. |
| `styles/`, `assets/` | Colori, font, icone, immagini. |

**Nel backend (`server/`):**

| File | Cos'è |
|---|---|
| `index.js` | Il serverino vero e proprio: risponde alle richieste del frontend. |
| `data/products-base.json` | 509 fondi. |
| `data/products-extra.json` | 1000 prodotti in più (anche azioni di aziende, es. Tesla). |
| `data/*.sqlite` / `*.db` | L'archivio dove il serverino **si ricorda i calcoli già fatti** sui prodotti. |

In totale il serverino mette a disposizione **circa 1500 prodotti**.

---

## 5. Come funziona la ricerca semantica (il pezzo importante)

**Il problema:** il computer non capisce le parole come noi. Allora si trasformano
sia i prodotti sia la tua frase in **numeri**, e poi si confrontano i numeri.

Funziona così:

1. **Ogni prodotto viene "descritto" con una frase.**
   Per esempio: *"Nome: ... Valuta: euro. Rischio basso. Sostenibile: sì..."*.

2. **Quella frase viene trasformata in una lista di numeri** (si chiama *embedding*:
   pensalo come un'"impronta digitale" fatta di numeri che rappresenta il significato).
   A farlo è un **vero modello di intelligenza artificiale** (leggero e multilingue,
   quindi capisce l'italiano) che gira **dentro il browser**, senza mandare niente a
   servizi esterni.

3. **Anche la tua frase di ricerca** viene trasformata nello stesso tipo di numeri.

4. **Si confrontano i numeri:** più l'"impronta" della tua frase somiglia a quella di
   un prodotto, più quel prodotto è adatto.

5. **Si ordinano i prodotti** dal più adatto al meno adatto e si mostrano i primi.

In più c'è un'**intelligenza extra a regole**: il sistema riconosce parole come
*rischio basso*, *cedola*, *sostenibile*, *euro*, e anche i "no" (*senza cedola*,
*non sostenibili*), e sposta i prodotti giusti più in alto (o li penalizza).

### Le tre cose importanti da ricordare

- **I calcoli vengono riusati.** Trasformare 1500 prodotti in numeri è lento, quindi
  il risultato viene **salvato dal serverino**. Alla riapertura della pagina non si
  rifà tutto da capo: si ricalcola solo la tua frase di ricerca.
- **C'è sempre un piano B.** Se il modello di AI non parte (per esempio senza
  internet), la demo usa un metodo di riserva più semplice: i risultati sono meno
  precisi, ma non si blocca. Allo stesso modo, se il serverino non è acceso, usa i
  prodotti del file `products.json`.
- **Sa anche cercare "prodotti simili".** Se scrivi *"fondi simili a AT0000712716"*
  (oppure a un nome), cerca il prodotto di partenza e mostra quelli che gli somigliano.

### I file dentro `semantic-search/` (chi fa cosa)

| File | Cosa fa |
|---|---|
| `buildProductSemanticText.ts` | Trasforma un prodotto nella frase che lo descrive (passo 1). |
| `embeddingService.ts` | Trasforma una frase in numeri (passi 2 e 3): carica il modello di AI, tiene i risultati in memoria e gestisce il metodo di riserva. |
| `similarity.ts` | Confronta due "impronte" e dice quanto si somigliano (passo 4). |
| `businessRanking.ts` | L'intelligenza extra a regole (rischio, cedola, sostenibile, "senza..."). |
| `similarProducts.ts` | Gestisce le ricerche tipo *"prodotti simili a X"*. |
| `semanticSearch.ts` | Mette tutto in fila e produce il risultato finale. |
| `useSemanticProductSearch.ts` | Collega tutto questo alla pagina che vedi a schermo. |
| `debug.ts` | Scrive i messaggi di controllo nella console del browser. |

---

## 6. Cosa vedi nella pagina Prodotti

Nella pagina **Prodotti** della demo trovi:

- la **barra di ricerca semantica**: scrivi una frase libera e premi **Cerca**
  (c'è anche **Reset** per ricominciare);
- il box **"Top match"**: mette in evidenza i **3 risultati migliori**, con una barra
  di rilevanza, il punteggio e il motivo per cui sono stati scelti (es. *"rischio
  basso"*, *"valuta EUR"*);
- i **filtri avanzati che si compilano da soli**: se scrivi *"fondi in euro a rischio
  basso"*, la demo prova a spuntare da sola i filtri corrispondenti;
- la **tabella dei prodotti**, con i primi 3 risultati evidenziati.

Il codice di questa pagina sta in
[`components/widget/WidgetProductList/WidgetProductList.tsx`](./src/components/widget/WidgetProductList/WidgetProductList.tsx).

---

## 7. Cose da sapere per non sbagliare

- **Se la ricerca non trova niente o è lentissima**, controlla che il serverino sia
  acceso (`npm run api`) e che il browser abbia potuto scaricare il modello.
- **Per cambiare i prodotti** si lavora nei file dentro `server/data/`
  (e in `src/products.json`, che è la riserva).
- **Per cambiare quali parole capisce la ricerca** (sinonimi, regole) si lavora in
  `embeddingService.ts` e `businessRanking.ts` dentro `semantic-search/`.
- **C'è una password di test scritta nel codice** (in `src/store/store.ts`) che serve
  solo a far partire la demo in locale senza login: va tolta prima di usare il
  progetto sul serio.
- **I messaggi di "debug"**: la demo scrive molti messaggi nella console del browser
  per far capire cosa sta facendo. Per una demo "pulita" si spengono mettendo a
  `false` la riga `SEMANTIC_SEARCH_DEBUG` in `semantic-search/debug.ts`.
- **File da ignorare** (roba rimasta lì): `src/__MACOSX/`, `README.mdgit`,
  la cartella `refactored-needs-components/` (non c'entra con la ricerca).

---

## 8. Cosa manca ancora (in breve)

Le cose principali che restano da fare (il dettaglio è nel diario tecnico
[`SEMANTIC_SEARCH_POC_HANDOFF.md`](./SEMANTIC_SEARCH_POC_HANDOFF.md)):

- far **interpretare la frase da un secondo modello di AI** prima di cercare, per
  capire meglio richieste complesse (es. *"rendimento alto ma rischio basso"*);
- migliorare la ricerca di **prodotti simili**, che oggi su alcune azioni dà risultati
  poco convincenti;
- **misurare la qualità** dei risultati in modo sistematico.

---

## 9. Riassunto in 6 righe

- È una **demo** per cercare prodotti finanziari scrivendo frasi normali.
- Sono due parti: il **frontend** (`src/`) e un **serverino** (`server/`) con i prodotti.
- Si avvia con **`npm install`** e poi **`npm run dev:all`**.
- Il cuore è la cartella **`semantic-search/`**.
- Usa una **vera AI dentro il browser**, con un metodo di riserva se non parte.
- Il **primo avvio è lento**, poi i calcoli vengono riusati.
