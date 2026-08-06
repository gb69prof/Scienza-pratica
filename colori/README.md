# Colori — Il mondo prima dello sguardo

PWA didattica interattiva sulla natura fisica della luce e sulla costruzione percettiva del colore.

## Nuova struttura

L’esperimento è organizzato come un percorso di **otto pagine autonome**. In ogni momento è visibile una sola fase; la navigazione avviene con i pulsanti **Indietro** e **Avanti**, con gli indicatori inferiori oppure con i tasti freccia.

1. Prologo: il colore sembra appartenere agli oggetti
2. Oggetto e riflettanza
3. Luce e spettro elettromagnetico
4. Sintesi additiva RGB
5. Occhio e coni S/M/L
6. Elaborazione cerebrale e contesto
7. Sistemi visivi differenti
8. Scomposizione finale dell’esperienza

## Identità visiva

La seconda versione usa un linguaggio grafico adulto e professionale:

- interfaccia ispirata a un laboratorio e a un museo scientifico;
- palette scura, neutra e controllata;
- tipografia editoriale;
- visualizzazioni realistiche stilizzate tramite CSS, SVG e Canvas;
- assenza di emoji, illustrazioni infantili e colori decorativi gratuiti;
- una sola esperienza visiva per pagina, adatta a LIM, iPad e desktop.

## Accuratezza scientifica

La PWA non afferma che i colori siano semplicemente falsi. Distingue tra proprietà fisiche della luce e delle superfici, risposta dei fotorecettori, elaborazione neurale, contesto ed esperienza cosciente.

Le simulazioni delle visioni animali sono esplicitamente approssimazioni didattiche e non fotografie dell’esperienza soggettiva di altre specie.

## Tecnica

- HTML, CSS, SVG, Canvas e JavaScript senza framework
- nessuna API o dipendenza esterna
- percorsi relativi compatibili con GitHub Pages
- manifest e service worker
- funzionamento offline dopo il primo caricamento
- modalità alto contrasto e riduzione delle animazioni
