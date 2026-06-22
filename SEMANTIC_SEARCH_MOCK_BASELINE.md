# Baseline mock semantic search

Baseline generata prima dell'integrazione di `transformers.js`.

- Data generazione: 2026-06-15T15:58:00.100Z
- Dataset: `src/products.json`
- Prodotti nel dataset: 509
- Prodotti indicizzati: 509
- Embedding: mock deterministico token/hash, dimensione 128
- Ranking business: attivo
- Top risultati salvati: 3 per query

## Lettura degli score

- `semanticScore`: similarita' vettoriale mock tra query/prodotto o prodotto/prodotto.
- `businessBoost`: boost o penalita' da regole business strutturate.
- `finalScore`: somma di `semanticScore` e `businessBoost`, usata per ordinare.
- `matchedRules`: regole che hanno contribuito al ranking.

## Q01 - fondi sostenibili con rischio basso in euro

Obiettivo: query composta ESG + rischio + valuta.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | AT0000A0QZM8 | RAIFFESISEN-EURO-SHORT T-SVA (EUR) MUTUAL FUND | 2 | EUR | No | Si | Si | Si | 0.318306 | 0.86 | 1.178306 | riskKiid basso boost 2, sustainable true, currency EUR |
| 2 | FR0007493549 | CAAM TRESO ETAT (EUR) MUTUAL FUND | 1 | EUR | No | Si | No | No | 0.234261 | 0.94 | 1.174261 | riskKiid basso boost 1, sustainable true, currency EUR |
| 3 | FR0010885210 | NATIXIS TRESORERIE PLUS-RC (EUR) FCP | 1 | EUR | No | Si | Si | Si | 0.223607 | 0.94 | 1.163607 | riskKiid basso boost 1, sustainable true, currency EUR |

## Q02 - fondi con rischio kiid basso

Obiettivo: ordinamento per rischio basso.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | FR0007493549 | CAAM TRESO ETAT (EUR) MUTUAL FUND | 1 | EUR | No | Si | No | No | 0.272639 | 0.56 | 0.832639 | riskKiid basso boost 1 |
| 2 | FR0010885210 | NATIXIS TRESORERIE PLUS-RC (EUR) FCP | 1 | EUR | No | Si | Si | Si | 0.26024 | 0.56 | 0.82024 | riskKiid basso boost 1 |
| 3 | FR0010213355 | GROUPAMA ENTREPRISES-IC (EUR) FCP | 1 | EUR | No | Si | Si | No | 0.255551 | 0.56 | 0.815551 | riskKiid basso boost 1 |

## Q03 - fondi con rischio kiid 3

Obiettivo: match puntuale sul rischio.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IT0001036414 | UBI PRA TR PRUD. | 3 | EUR | No | No | No | No | 0.215666 | 0.45 | 0.665666 | riskKiid exact 3 |
| 2 | IE0004445783 | JANUS CAPITAL FLEX I-A$A (USD) MUTUAL FUND | 3 | USD | No | Si | No | No | 0.214834 | 0.45 | 0.664834 | riskKiid exact 3 |
| 3 | IT0001079810 | ALPI SOL PRUD | 3 | EUR | No | No | No | No | 0.209274 | 0.45 | 0.659274 | riskKiid exact 3 |

## Q04 - prodotti con cedola

Obiettivo: preferenza positiva su cedola.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | GB0001647246 | THREADNEEDLE UK GR&INC-2-INC (GBP) OEIC | 6 | GBP | Si | Si | Si | Si | 0.257396 | 0.22 | 0.477396 | coupon true |
| 2 | IE00B193MK07 | PIMCO DIV INC FD-E INCOME (USD) MUTUAL FUND | 4 | USD | Si | No | No | No | 0.214013 | 0.22 | 0.434013 | coupon true |
| 3 | IE00B0MD9M11 | PIMCO GLOBAL BOND-INV-E-INC (USD) MUTUAL FUND | 3 | USD | Si | Si | No | No | 0.213201 | 0.22 | 0.433201 | coupon true |

## Q05 - prodotti senza cedola

Obiettivo: preferenza negativa su cedola.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IE00B28VTX42 | CALAMOS-GLB EQUITY-A US ACC (USD) OPEN-END FUND | ND | USD | No | No | No | No | 0.49191 | 0.22 | 0.71191 | coupon false |
| 2 | FR0011159888 | ODDO PROACTIF EUROPE-B2 (EUR) FCP | 4 | EUR | No | Si | No | Si | 0.48478 | 0.22 | 0.70478 | coupon false |
| 3 | FR0010234351 | ODDO PROACTIF EUROPE-CI-EUR (EUR) FCP | 4 | EUR | No | Si | No | Si | 0.479632 | 0.22 | 0.699632 | coupon false |

## Q06 - prodotti eco sostenibili con pai

Obiettivo: preferenze booleane ESG.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IT0001019329 | MEDIOLANUM FI L | 7 | EUR | No | Si | Si | Si | 0.331295 | 0.62 | 0.951295 | sustainable true, ecoSustainable true, pai true |
| 2 | AT0000A21LL5 | CONVERTINVEST ALL-CAP CONVERTIBLES FUND R (EUR) | 4 | EUR | No | Si | Si | Si | 0.326036 | 0.62 | 0.946036 | sustainable true, ecoSustainable true, pai true |
| 3 | AT0000677927 | RAIFFEISEN KAPITALANLAGE GESELLSCHAFT MBH - ETHIK | 5 | EUR | No | Si | Si | Si | 0.326036 | 0.62 | 0.946036 | sustainable true, ecoSustainable true, pai true |

## Q07 - fondi obbligazionari corporate

Obiettivo: asset class e semantica testuale.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IT0001015921 | ANIMA PIAN A | 4 | EUR | No | Si | No | No | 0.15396 | 0 | 0.15396 |  |
| 2 | DE000DWS1U41 | DWS GLOBAL HYBRID BOND-FC (EUR) OPEN-END FUND | 4 | EUR | No | Si | Si | No | 0.12 | 0 | 0.12 |  |
| 3 | IT0001010484 | AZIMUT TREND N | ND | EUR | No | No | No | No | 0.119523 | 0 | 0.119523 |  |

## Q08 - fondi dinamici con rischio alto

Obiettivo: query rischio alto.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IT0001019329 | MEDIOLANUM FI L | 7 | EUR | No | Si | Si | Si | 0.10224 | 0.56 | 0.66224 | riskKiid alto boost 7 |
| 2 | AT0000A07FS1 | RAIFFEISEN-RUSSLAND-AKT-VA (EUR) OPEN-END FUND | 7 | EUR | No | No | No | No | 0.100223 | 0.56 | 0.660223 | riskKiid alto boost 7 |
| 3 | FR0011006188 | H2O ALLEGRO-IC (EUR) FCP | 7 | EUR | No | No | No | No | 0.099449 | 0.56 | 0.659449 | riskKiid alto boost 7 |

## Q09 - fondi non sostenibili

Obiettivo: intento negativo ESG.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | CH0002789250 | CREDIT SUISSE FUND | 6 | EUR | Si | No | No | No | 0.132583 | 0.22 | 0.352583 | sustainable false |
| 2 | AT0000A1NAF0 | RAIFFEISEN PIC & PAC FONDO MOBILIARE APERTO CL VT AD ACC.EUR | 4 | EUR | No | No | No | No | 0.130066 | 0.22 | 0.350066 | sustainable false |
| 3 | GG00B1YQ6R97 | THIRD POINT OFFSHORE INVESTM (GBP) MUTUAL FUND | ND | GBP | No | No | No | No | 0.130066 | 0.22 | 0.350066 | sustainable false |

## Q10 - fondi senza pai

Obiettivo: intento negativo PAI.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | GG00B1YQ6R97 | THIRD POINT OFFSHORE INVESTM (GBP) MUTUAL FUND | ND | GBP | No | No | No | No | 0.557152 | 0.18 | 0.737152 | pai false |
| 2 | AT0000A1NAF0 | RAIFFEISEN PIC & PAC FONDO MOBILIARE APERTO CL VT AD ACC.EUR | 4 | EUR | No | No | No | No | 0.524379 | 0.18 | 0.704379 | pai false |
| 3 | IT0001023636 | GESTNORD AZ ITALI N | ND | EUR | No | No | No | No | 0.517549 | 0.18 | 0.697549 | pai false |

## Q11 - fondi non collocati

Obiettivo: intento negativo su collocamento.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IE0008366365 | AXA ROSENBERG EUROBLOC EQY-A (EUR) OPEN-END FUND | 6 | EUR | No | Si | Si | Si | 0.346844 | -0.14 | 0.206844 | isPlaced true penalty |
| 2 | IE0033609615 | AXA ROSENBERG US EN INDX E-A (USD) OPEN-END FUND | 6 | USD | No | Si | Si | Si | 0.292685 | -0.14 | 0.152685 | isPlaced true penalty |
| 3 | IT0001019329 | MEDIOLANUM FI L | 7 | EUR | No | Si | Si | Si | 0.270501 | -0.14 | 0.130501 | isPlaced true penalty |

## Q12 - fondi sostenibili senza cedola

Obiettivo: mix positivo + negativo.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | FR0011159888 | ODDO PROACTIF EUROPE-B2 (EUR) FCP | 4 | EUR | No | Si | No | Si | 0.479808 | 0.44 | 0.919808 | sustainable true, coupon false |
| 2 | IE0004334029 | AXA ROSENBERG PAC EX J SM-B$ (EUR) MUTUAL FUND | 6 | USD | No | Si | No | Si | 0.456435 | 0.44 | 0.896435 | sustainable true, coupon false |
| 3 | IE00B101JY64 | AXA ROSENBERG-GL EM MK EQ A$ (USD) OPEN-END FUND | 6 | USD | No | Si | No | Si | 0.453092 | 0.44 | 0.893092 | sustainable true, coupon false |

## Q13 - fondi in euro senza cedola con rischio basso

Obiettivo: query multi-vincolo.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | AT0000A0QZM8 | RAIFFESISEN-EURO-SHORT T-SVA (EUR) MUTUAL FUND | 2 | EUR | No | Si | Si | Si | 0.530118 | 0.86 | 1.390118 | riskKiid basso boost 2, coupon false, currency EUR |
| 2 | IE00BYQQ0654 | BLACKROCK EURO CASH FD-E ACC (EUR) OPEN-END FUND | 1 | EUR | No | No | No | No | 0.443706 | 0.94 | 1.383706 | riskKiid basso boost 1, coupon false, currency EUR |
| 3 | FR0007479944 | CPR 3-5 EURO SR (EUR) MUTUAL FUND | 2 | EUR | No | No | No | No | 0.510754 | 0.86 | 1.370754 | riskKiid basso boost 2, coupon false, currency EUR |

## Q14 - fondo simile a AT0000712716

Obiettivo: similar products per ISIN presente.

Risultati: 20.

Sorgente simili a X:

- sourceQuery: `at0000712716`
- constraintQuery: `nessuno`
- ambiguousSource: `false`
- sourceProduct: `AT0000712716` - RAIFFEISEN-HEALTHCARE AKTIENFONDS - riskKiid 5

Candidati sorgente top 5:

| ISIN | ProductId | Nome | Match score |
| --- | --- | --- | ---: |
| AT0000712716 | 8350 | RAIFFEISEN-HEALTHCARE AKTIENFONDS | 150 |

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | AT0000677927 | RAIFFEISEN KAPITALANLAGE GESELLSCHAFT MBH - ETHIK | 5 | EUR | No | Si | Si | Si | 0.976092 | 0 | 0.976092 | similar to 8350 |
| 2 | AT0000A105C5 | RAIFFEISEN SOSTENIBILE DIVERSIFICATO | 3 | EUR | No | Si | No | Si | 0.970202 | 0 | 0.970202 | similar to 8350 |
| 3 | AT0000785225 | RAIFFEISEN EUROPE AKTIEN VT | 6 | EUR | No | Si | Si | Si | 0.969017 | 0 | 0.969017 | similar to 8350 |

## Q15 - fondo simile a AT0000712716 ma meno rischiosi

Obiettivo: vincolo relativo sul rischio.

Risultati: 20.

Sorgente simili a X:

- sourceQuery: `at0000712716`
- constraintQuery: `meno rischiosi`
- ambiguousSource: `false`
- sourceProduct: `AT0000712716` - RAIFFEISEN-HEALTHCARE AKTIENFONDS - riskKiid 5

Candidati sorgente top 5:

| ISIN | ProductId | Nome | Match score |
| --- | --- | --- | ---: |
| AT0000712716 | 8350 | RAIFFEISEN-HEALTHCARE AKTIENFONDS | 150 |

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | FR0010213355 | GROUPAMA ENTREPRISES-IC (EUR) FCP | 1 | EUR | No | Si | Si | No | 0.92967 | 0.48 | 1.40967 | similar to 8350, riskKiid lower than source 5 |
| 2 | FR0010885210 | NATIXIS TRESORERIE PLUS-RC (EUR) FCP | 1 | EUR | No | Si | Si | Si | 0.907608 | 0.48 | 1.387608 | similar to 8350, riskKiid lower than source 5 |
| 3 | FR0007493549 | CAAM TRESO ETAT (EUR) MUTUAL FUND | 1 | EUR | No | Si | No | No | 0.877079 | 0.48 | 1.357079 | similar to 8350, riskKiid lower than source 5 |

## Q16 - fondo simile a AT0000712716 con cedola

Obiettivo: similarita + vincolo positivo.

Risultati: 20.

Sorgente simili a X:

- sourceQuery: `at0000712716`
- constraintQuery: `con cedola`
- ambiguousSource: `false`
- sourceProduct: `AT0000712716` - RAIFFEISEN-HEALTHCARE AKTIENFONDS - riskKiid 5

Candidati sorgente top 5:

| ISIN | ProductId | Nome | Match score |
| --- | --- | --- | ---: |
| AT0000712716 | 8350 | RAIFFEISEN-HEALTHCARE AKTIENFONDS | 150 |

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | AT0000936513 | RAIFFEISEN-OSTEUROP-AKTIEN-A (EUR) MUTUAL FUND | 6 | EUR | Si | Si | No | Si | 0.966628 | 0.22 | 1.186628 | similar to 8350, coupon true |
| 2 | AT0000996681 | RAIFFEISEN-EURO-RENT-A (EUR) MUTUAL FUND | 3 | EUR | Si | Si | No | Si | 0.964764 | 0.22 | 1.184764 | similar to 8350, coupon true |
| 3 | AT0000859541 | RAIFFEISEN-EURO-SHORTTERM RE (EUR) MUTUAL FUND | 2 | EUR | Si | Si | Si | Si | 0.963851 | 0.22 | 1.183851 | similar to 8350, coupon true |

## Q17 - fondo simile a AT0000712716 senza cedola

Obiettivo: similarita + vincolo negativo.

Risultati: 20.

Sorgente simili a X:

- sourceQuery: `at0000712716`
- constraintQuery: `senza cedola`
- ambiguousSource: `false`
- sourceProduct: `AT0000712716` - RAIFFEISEN-HEALTHCARE AKTIENFONDS - riskKiid 5

Candidati sorgente top 5:

| ISIN | ProductId | Nome | Match score |
| --- | --- | --- | ---: |
| AT0000712716 | 8350 | RAIFFEISEN-HEALTHCARE AKTIENFONDS | 150 |

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | AT0000677927 | RAIFFEISEN KAPITALANLAGE GESELLSCHAFT MBH - ETHIK | 5 | EUR | No | Si | Si | Si | 0.976092 | 0.22 | 1.196092 | similar to 8350, coupon false |
| 2 | AT0000A105C5 | RAIFFEISEN SOSTENIBILE DIVERSIFICATO | 3 | EUR | No | Si | No | Si | 0.970202 | 0.22 | 1.190202 | similar to 8350, coupon false |
| 3 | AT0000785225 | RAIFFEISEN EUROPE AKTIEN VT | 6 | EUR | No | Si | Si | Si | 0.969017 | 0.22 | 1.189017 | similar to 8350, coupon false |

## Q18 - fondi simili a investiper

Obiettivo: risoluzione sorgente testuale ambigua.

Risultati: 20.

Sorgente simili a X:

- sourceQuery: `investiper`
- constraintQuery: `nessuno`
- ambiguousSource: `true`
- sourceProduct: `IT0001079398` - INVESTIPER OBBLIGAZIONARIO GLOBALE GIA' OBBLIG.M.TERMINE POR - riskKiid 3

Candidati sorgente top 5:

| ISIN | ProductId | Nome | Match score |
| --- | --- | --- | ---: |
| IT0001079398 | 42379 | INVESTIPER OBBLIGAZIONARIO GLOBALE GIA' OBBLIG.M.TERMINE POR | 127 |
| IT0001079406 | 42381 | INVESTIPER OBBLIGAZ.MEDIO TERMINE NOMINATIVO | 127 |

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | AT0000996681 | RAIFFEISEN-EURO-RENT-A (EUR) MUTUAL FUND | 3 | EUR | Si | Si | No | Si | 0.934068 | 0 | 0.934068 | similar to 42379 |
| 2 | IT0001040093 | ANIMA AMERICA  A | 6 | EUR | No | Si | Si | Si | 0.927098 | 0 | 0.927098 | similar to 42379 |
| 3 | FR0010589325 | GROUPAMA AVENIR EURO - M (EUR) FCP | 6 | EUR | No | Si | No | Si | 0.925697 | 0 | 0.925697 | similar to 42379 |

## Q19 - fondo simile a AT0000495304

Obiettivo: sorgente assente.

Risultati: 0.

Sorgente simili a X:

- sourceQuery: `at0000495304`
- constraintQuery: `nessuno`
- ambiguousSource: `false`
- sourceProduct: `non trovato`

Nessun risultato.

## Q20 - cerco un prodotto prudente per un investitore conservativo

Obiettivo: sinonimi rischio basso.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | FR0007493549 | CAAM TRESO ETAT (EUR) MUTUAL FUND | 1 | EUR | No | Si | No | No | 0.100031 | 0.56 | 0.660031 | riskKiid basso boost 1 |
| 2 | FR0010288423 | HSBC MONETAIRE ETAT (EUR) MUTUAL FUND | 1 | EUR | No | No | No | No | 0.097677 | 0.56 | 0.657677 | riskKiid basso boost 1 |
| 3 | FR0010885210 | NATIXIS TRESORERIE PLUS-RC (EUR) FCP | 1 | EUR | No | Si | Si | Si | 0.095482 | 0.56 | 0.655482 | riskKiid basso boost 1 |

## Q21 - strumenti difensivi in euro

Obiettivo: lessico non tecnico.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | FR0007479944 | CPR 3-5 EURO SR (EUR) MUTUAL FUND | 2 | EUR | No | No | No | No | 0.28957 | 0.64 | 0.92957 | riskKiid basso boost 2, currency EUR |
| 2 | AT0000A0QZM8 | RAIFFESISEN-EURO-SHORT T-SVA (EUR) MUTUAL FUND | 2 | EUR | No | Si | Si | Si | 0.256468 | 0.64 | 0.896468 | riskKiid basso boost 2, currency EUR |
| 3 | IE00BYQQ0654 | BLACKROCK EURO CASH FD-E ACC (EUR) OPEN-END FUND | 1 | EUR | No | No | No | No | 0.159719 | 0.72 | 0.879719 | riskKiid basso boost 1, currency EUR |

## Q22 - soluzioni piu aggressive per crescita

Obiettivo: sinonimi rischio alto.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IT0001010484 | AZIMUT TREND N | ND | EUR | No | No | No | No | 0.159364 | 0 | 0.159364 |  |
| 2 | IT0001055059 | AZIMUT TREND E. | ND | EUR | No | No | No | No | 0.159364 | 0 | 0.159364 |  |
| 3 | IT0001055083 | AZIMUT TREND AM. N | ND | EUR | No | No | No | No | 0.158735 | 0 | 0.158735 |  |

## Q23 - prodotti orientati alla sostenibilita

Obiettivo: sinonimi ESG.

Risultati: 20.

| Pos | ISIN | Nome | Risk | EUR | Cedola | Sost. | Eco | PAI | Semantic | Boost | Finale | Rules |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | IT0000380003 | ARCA BB | 4 | EUR | No | Si | No | No | 0.322591 | 0.22 | 0.542591 | sustainable true |
| 2 | IT0000384641 | ARCA TE T.E. | 4 | EUR | No | Si | No | No | 0.32 | 0.22 | 0.54 | sustainable true |
| 3 | DE0008491044 | UNION UNIRAK (EUR) OPEN-END FUND | 5 | EUR | Si | Si | No | Si | 0.318728 | 0.22 | 0.538728 | sustainable true |
