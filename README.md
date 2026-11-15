# SCACCHI! — PWA didattica, versione 0.2

App interattiva per la scuola secondaria di I grado, basata sulle lezioni del PowerPoint «CORSO di SCACCHI» e su materiali didattici presenti nell'archivio di Google Drive del docente.

## Novità della versione 0.2

### ALLENATI → Giro del cavallo

- Tre livelli: **8, 32 o 64 caselle diverse**, sempre con il movimento legale del cavallo;
- si sceglie liberamente la casa iniziale; la prima casa conta come prima casella visitata;
- le destinazioni legali non ancora visitate vengono evidenziate;
- sono visualizzati il percorso con numeri progressivi, l'attuale posizione, le mosse disponibili e il progresso;
- si possono annullare salti, ricominciare, ricevere un suggerimento non vincolante;
- il sistema riconosce completamento e vicoli ciechi.

Ispirazione: articolo «Percorsi sulla scacchiera» di Piergiorgio Odifreddi (*Le Scienze*, agosto 2011), presente nell'archivio. Disegni e implementazione sono originali, l'articolo non viene ripubblicato.

### ALLENATI → Tattica

**Otto problemi originali e verificati:**

1. Forchetta di cavallo;
2. Forchetta di pedone;
3. Inchiodatura assoluta;
4. Attacco doppio di donna;
5. Infilata;
6. Scacco di scoperta;
7. Doppio scacco;
8. Matto del corridoio.

Le posizioni sono originali, create prendendo spunto dai temi delle dispense «5. Tattiche» e «Tattica scacchistica — I primi elementi». Ogni sfida contiene testo, mossa sulla scacchiera, feedback, suggerimento, spiegazione e completamento salvato localmente. La modalità Docente mostra anche le soluzioni.

### SCOPRI → Scacchi e matematica

Laboratorio interattivo sulla **leggenda dei chicchi di riso**: cursore da 1 a 64, calcolo esatto con `BigInt` del numero di chicchi sulla casella scelta e del totale cumulativo. Formule: `2^(n−1)` e `2^n−1` rispettivamente. Ispirato al file GeoGebra «9. Chicchi di riso.ggb».

### Conservato dalla v0.1

- 9 lezioni guidate, filastrocche e regole principali;
- gioco a due sulla stessa scacchiera con verifica delle mosse legali;
- problema delle otto regine;
- tema giorno/notte, modalità docente, impaginazione responsive;
- salvataggio locale di tema e progressi.

## Esclusioni richieste

**Nessuna sezione di tornei scolastici, nessun dato nominativo di alunni e nessuna partita del torneo del 2016.** Una eventuale sezione futura verrà progettata a parte.

## Pubblicazione GitHub Pages

1. Crea/usa una repository pubblica, ad esempio `scacchi`.
2. Estrai tutti i file dello ZIP nella radice della repository, **inclusa la cartella `icons`**.
3. Vai in **Settings → Pages**, seleziona *Deploy from a branch*, ramo `main`, directory `/(root)`.
4. Apri l'indirizzo di GitHub Pages in HTTPS. Dopo il primo caricamento la PWA può essere installata e utilizzata offline.
5. Quando sostituisci i file di una versione precedente, il nuovo `service-worker.js` usa una cache `scacchi-scuola-v2` per l'aggiornamento delle risorse.

Per provare la PWA in locale con Python: `python -m http.server 8000`, poi apri `http://localhost:8000`.

## File principali

- `index.html` – avvio dell'interfaccia
- `app.js` – navigazione, esercizi e interazione
- `chess-core.js` – motore regole scacchi
- `lessons.js` – contenuti introduttivi
- `training-data.js` – otto esercizi tattici e logica del cavallo
- `style.css` – grafica e adattamento mobile
- `manifest.webmanifest`, `service-worker.js`, `icons/` – PWA e uso offline

## Test

- `node test-engine.mjs` – regole, mosse speciali, esercizi della v0.1
- `node test-training.mjs` – legalità delle otto combinazioni, destinazioni del cavallo, percorso completo da a1, calcoli dei chicchi
- `node test-interface.mjs` – navigazione, click sulle scacchiere, risoluzione tattica, progresso del cavallo, aggiornamento dinamico del cursore

## Stato e limiti

La v0.2 è un prototipo funzionale verificato con test automatici di logica e interazione simulata; non è stato effettuato un collaudo visivo completo su dispositivi reali. Non comprende un avversario computerizzato, la sincronizzazione cloud o la riproduzione PGN. I contenuti vanno provati con gli studenti e ulteriormente perfezionati.

Il salvataggio dei progressi usa `localStorage` e **non richiede né raccoglie nomi o account degli alunni**. La modalità Docente non è autenticata: è un semplice selettore di visibilità degli aiuti.