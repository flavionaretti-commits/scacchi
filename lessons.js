/** Lezioni introduttive ispirate al PowerPoint «CORSO di SCACCHI» del prof. Flavio Naretti.
 * Le filastrocche sono dell'autore del materiale fornito. Le note tecniche sono state riviste.
 */
export const LESSONS = [
  {
    id:'board', label:'La scacchiera', short:'Impara a orientarti', symbol:'▦', kind:'coordinates', page:'11–12',
    description:'64 caselle, 8 colonne (a–h) e 8 traverse (1–8). Il Bianco gioca dal basso; la casa h1 è chiara.',
    notes:['Le colonne sono indicate dalle lettere a–h; le traverse dai numeri 1–8.', 'La casa nell’angolo inferiore destro del Bianco è chiara.', 'Per nominare una casa scrivi prima la lettera e poi il numero: e4, b6, h1.']
  },
  {
    id:'pawn', label:'Il pedone', short:'Avanza e cattura', symbol:'♙', kind:'move', page:'10',
    poem:'Mi chiamo pedone e non Pietro,\nvado solo avanti e non indietro.\nSono un tipetto molto originale,\nmuovo diritto ma mangio in diagonale.\nSono piccolo, di paura ne ho molta,\nvado all’attacco d’un passo alla volta.\nSolo all’inizio sono più coraggioso:\nd’uno o due passi avanzare oso.\nMa se arrivo in fondo alla scacchiera,\nvengo promosso e faccio carriera!',
    description:'Il pedone avanza di una casa, o anche di due dalla sua casa di partenza se il percorso è libero; cattura in diagonale in avanti.',
    notes:['Il pedone non può muovere all’indietro.', 'Dalla casa iniziale può avanzare di due case soltanto se entrambe sono libere.', 'Quando raggiunge l’ultima traversa deve essere promosso; esistono anche la presa en passant e altre regole speciali.'],
    fen:'4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',from:'e2',to:'e4',task:'Porta il pedone bianco dalla casa e2 alla casa e4 in un solo movimento.',tip:'Il pedone si trova ancora sulla sua casa iniziale.'
  },
  {
    id:'rook', label:'La torre', short:'Righe e colonne', symbol:'♖', kind:'move', page:'7',
    poem:'Sono la torre eccomi qua,\nmuovermi in diagonale? Per carità!\nCorro quanto voglio in orizzontale,\nse lo desidero anche in verticale.\nE con la mossa dell’arrocco,\nproteggo il re e divento il suo cocco!',
    description:'La torre si muove lungo colonne e traverse, per qualsiasi numero di case libere.',
    notes:['La torre non si muove in diagonale.', 'Non può scavalcare pezzi.', 'Può partecipare all’arrocco con il re, se tutte le condizioni sono rispettate.'],
    fen:'4k3/8/8/8/3R4/8/8/4K3 w - - 0 1',from:'d4',to:'d7',task:'Muovi la torre da d4 a d7.',tip:'La torre rimane sempre sulla stessa colonna oppure sulla stessa traversa.'
  },
  {
    id:'bishop', label:'L’alfiere', short:'Solo diagonali', symbol:'♗', kind:'move', page:'8',
    poem:'Sono l’alfiere un pezzo speciale\nche muove sempre in diagonale;\nposso avanzare molto oppure poco: \nma senza di me non è lo stesso gioco!',
    description:'L’alfiere si sposta lungo le diagonali, senza scavalcare pezzi. Rimane sempre su case dello stesso colore.',
    notes:['Un alfiere che parte su una casa chiara resterà sempre su case chiare.', 'L’alfiere non scavalca gli altri pezzi.', 'All’inizio ci sono due alfieri per parte, uno per ogni colore di casella.'],
    fen:'4k3/8/8/8/3B4/8/8/4K3 w - - 0 1',from:'d4',to:'g7',task:'Porta l’alfiere da d4 a g7.',tip:'Ogni passo in diagonale cambia contemporaneamente riga e colonna.'
  },
  {
    id:'knight', label:'Il cavallo', short:'Un salto a L', symbol:'♘', kind:'move', page:'9',
    poem:'Sono il cavallo pronto all’agguato,\nfaccio due passi in fila e uno di lato.\nSono l’unico che con un balzo in mezzo,\npuò saltare qualsiasi altro pezzo!',
    description:'Il cavallo muove a L: due case in una direzione e una perpendicolare. È l’unico pezzo che può saltare sopra gli altri.',
    notes:['Il cavallo può arrivare al massimo a otto case diverse.', 'Può saltare i pezzi intermedi, ma non può finire su un pezzo del proprio colore.', 'Quando un cavallo attacca due pezzi contemporaneamente si parla spesso di forchetta.'],
    fen:'4k3/8/8/8/3N4/8/8/4K3 w - - 0 1',from:'d4',to:'e6',task:'Porta il cavallo da d4 a e6.',tip:'Due case verso l’alto, poi una a destra.'
  },
  {
    id:'queen', label:'La donna', short:'La più versatile', symbol:'♕', kind:'move', page:'6',
    poem:'Inchinatevi, sono la Regina,\ndi tutti la più potente e sopraffina.\nMi posso muovere dove e quanto mi va,\nchiunque incontro brutta fine farà!',
    description:'La donna (o regina) combina i movimenti della torre e dell’alfiere: in linea retta oppure in diagonale.',
    notes:['La donna si muove su righe, colonne e diagonali.', 'Non può saltare gli altri pezzi.', 'Nella posizione iniziale la donna bianca si trova su d1, quella nera su d8.'],
    fen:'4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1',from:'d4',to:'h4',task:'Porta la donna da d4 a h4.',tip:'La donna si sposta anche in orizzontale, come la torre.'
  },
  {
    id:'king', label:'Il re', short:'Una casa alla volta', symbol:'♔', kind:'move', page:'5',
    poem:'Della scacchiera sono il Re,\npezzo più importante non ce n’è.\nDovunque voglio posso andare,\nma più di un passo non riesco a fare.\nSe mi intrappolano è finita:\nscacco matto e si perde la partita!',
    description:'Il re si muove di una casa in ogni direzione, ma non può entrare su una casa minacciata dall’avversario.',
    notes:['Il re non viene catturato: lo scacco matto termina la partita.', 'Due re non possono trovarsi su case adiacenti.', 'L’arrocco è l’eccezione al normale spostamento di una casa del re.'],
    fen:'7k/8/8/8/8/8/4K3/8 w - - 0 1',from:'e2',to:'f3',task:'Porta il re da e2 a f3, senza metterlo in pericolo.',tip:'Il re può muovere in diagonale di una sola casa.'
  },
  {
    id:'check', label:'Lo scacco', short:'Minaccia il re', symbol:'!', kind:'move', page:'5, 20',
    description:'Un re è sotto scacco quando una casa da lui occupata è attaccata. Deve difendersi subito, con una mossa legale.',
    notes:['Per parare uno scacco si può spostare il re, catturare il pezzo attaccante oppure, quando possibile, interporre un pezzo.', 'Non si può mai lasciare il proprio re sotto scacco.', 'Se non esiste alcuna difesa legale, è scacco matto.'],
    fen:'4k3/8/8/8/3R4/8/8/4K3 w - - 0 1',from:'d4',to:'e4',task:'Con la torre, metti sotto scacco il re nero in una sola mossa.',tip:'Porta la torre sulla stessa colonna del re nero.'
  },
  {
    id:'mate', label:'Scacco matto', short:'Matto in una mossa', symbol:'#', kind:'move', page:'5, 20',
    description:'Scacco matto: il re è minacciato e non ha alcuna mossa legale per salvarsi. La partita termina immediatamente.',
    notes:['Lo scacco matto non implica catturare il re.', 'Una posizione senza mosse legali ma senza scacco è invece stallo, quindi patta.', 'Osserva sempre quali case può usare il re avversario.'],
    fen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',from:'g6',to:'g7',task:'È il turno del Bianco: trova lo scacco matto in una sola mossa.',tip:'La donna può portarsi vicino al re nero, rimanendo protetta dal re bianco.'
  }
];

export const COORDINATE_DRILL = ['d4','h1','a8','e5','b6','g2','f7','c3'];

export const HISTORY = [
  {title:'Dall’India alla Persia',text:'Il chaturanga, antico gioco indiano, è un importante predecessore degli scacchi. Nel mondo persiano si affermò lo shatranj.',source:'Slide 2–3'},
  {title:'Le Olimpiadi a Torino',text:'Nel 2006 Torino ospitò le Olimpiadi degli scacchi: una pagina importante della storia scacchistica cittadina.',source:'Slide 18'},
  {title:'La Partita immortale',text:'Nel 1851 Adolf Anderssen e Lionel Kieseritzky giocarono a Londra una delle partite più famose della storia degli scacchi.',source:'Slide 32'},
  {title:'La Partita sempreverde',text:'Nel 1852 Anderssen e Jean Dufresne disputarono a Berlino una partita celebre per la brillante combinazione finale.',source:'Slide 33'},
  {title:'Scacchi e matematica',text:'Claude Shannon stimò un ordine di grandezza di circa 10¹²⁰ possibili sequenze di gioco: un numero enorme, non un conteggio esatto.',source:'Approfondimento aggiunto'}
];
