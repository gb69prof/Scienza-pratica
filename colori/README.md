# Colori — Il mondo prima dello sguardo

PWA didattica 3D sulla natura fisica della luce e sulla costruzione percettiva del colore.

## Obiettivo

Mostrare che il colore è un'esperienza percettiva costruita dal sistema visivo a partire dalla distribuzione spettrale della luce, dalle proprietà delle superfici e dal contesto. La PWA evita sia l'idea ingenua che il colore sia una sostanza contenuta negli oggetti, sia la formula imprecisa "i colori sono illusioni".

## Percorso 3D

La PWA è organizzata in nove schermate, una sola visibile alla volta:

1. mondo percepito;
2. mela e riflettanza;
3. spettro e radiazione elettromagnetica;
4. sintesi additiva RGB;
5. modello dell'occhio e coni S/M/L;
6. percorso neurale e costruzione dell'esperienza;
7. costanza cromatica sotto illuminazioni differenti;
8. confronto fra sistemi visivi;
9. scomposizione finale dall'esperienza alla descrizione fisica.

## Motore grafico

La versione 3D usa un renderer WebGL locale e leggero (`webgl.js`) invece di dipendere da librerie o CDN esterne. È stato scelto per mantenere:

- funzionamento offline;
- caricamento rapido;
- memoria controllata su iPad;
- una sola scena WebGL attiva;
- nessun backend o API.

Le geometrie sono procedurali: mela, prisma, occhio, fiore, fasci e scene sono generati localmente. Le viste animali sono traduzioni didattiche scientificamente informate, non fotografie dell'esperienza soggettiva di altre specie.

## Navigazione

- pulsanti Indietro / Avanti;
- indicatori delle fasi;
- frecce da tastiera;
- rotazione limitata della camera con trascinamento;
- modalità di riduzione del movimento;
- alto contrasto;
- audio facoltativo.

## PWA

File principali:

- `index.html`
- `style.css`
- `app.js`
- `webgl.js`
- `manifest.json`
- `sw.js`
- `assets/`

Tutti i percorsi sono relativi e compatibili con GitHub Pages:

`https://gb69prof.github.io/Scienza-pratica/colori/`

## Limiti scientifici

Le simulazioni di visione animale e i modelli anatomici sono semplificazioni didattiche. Uno schermo RGB non può riprodurre direttamente un canale ultravioletto o l'esperienza cromatica di un sistema tetrocromatico.
