/** Esercizi ORIGINALI, costruiti per SCACCHI! sulla base dei temi trattati
 * in «5. Tattiche» e «Tattica scacchistica — I primi elementi» presenti
 * nell'archivio didattico dell'utente. Non riproducono diagrammi editoriali.
 * Tutte le posizioni e soluzioni sono verificate da test-training.mjs.
 */
export const TACTICS = [
 {id:'fork-n',level:1,title:'Forchetta di cavallo',theme:'Attacco doppio',
  fen:'1k6/4q3/8/4N3/8/8/8/6K1 w - - 0 1',from:'e5',to:'c6',
  task:'Il cavallo può attaccare contemporaneamente il re e la donna neri. Trova la mossa.',
  hint:'Da e5 cerca una casa dalla quale il cavallo minacci sia b8 sia e7.',
  explanation:'Il cavallo in c6 dà scacco al re b8 e attacca la donna e7. È una forchetta: una singola mossa crea due minacce.'},
 {id:'fork-p',level:1,title:'Forchetta di pedone',theme:'Attacco doppio',
  fen:'k7/8/3r1n2/8/4P3/8/8/6K1 w - - 0 1',from:'e4',to:'e5',
  task:'Avanza il pedone per minacciare contemporaneamente due pezzi neri.',
  hint:'Un pedone bianco attacca le due case immediatamente in diagonale davanti a sé.',
  explanation:'Dopo e5 il pedone attacca la torre d6 e il cavallo f6. Anche il pedone può realizzare una forchetta.'},
 {id:'pin',level:2,title:'Inchiodatura assoluta',theme:'Inchiodatura',
  fen:'4k3/8/2n5/8/8/8/8/5BK1 w - - 0 1',from:'f1',to:'b5',
  task:'Sposta l’alfiere per inchiodare il cavallo nero al proprio re.',
  hint:'Cerca una diagonale che attraversi c6 e raggiunga e8.',
  explanation:'Con Ab5 il cavallo c6 è sulla diagonale tra l’alfiere e il re e8. Non può allontanarsi lasciando il re sotto attacco: è un’inchiodatura assoluta.'},
 {id:'queen-fork',level:2,title:'Attacco doppio di donna',theme:'Attacco doppio',
  fen:'r3k3/8/8/8/8/8/8/3Q2K1 w - - 0 1',from:'d1',to:'a4',
  task:'Con una mossa di donna dai scacco e attacchi anche la torre a8.',
  hint:'La donna può combinare diagonalmente uno scacco e verticalmente un attacco.',
  explanation:'Da a4 la donna dà scacco lungo la diagonale a4–e8 e contemporaneamente minaccia la torre a8.'},
 {id:'skewer',level:2,title:'Infilata',theme:'Infilata',
  fen:'R7/7k/7q/8/8/8/8/6K1 w - - 0 1',from:'a8',to:'h8',
  task:'Con la torre dai scacco al re e metti sotto attacco la donna nascosta alle sue spalle.',
  hint:'Il re nero è sulla colonna h, davanti alla donna.',
  explanation:'Con Th8+ il re h7 viene attaccato davanti alla donna h6. Quando il re si sposta, la donna resta esposta: è un’infilata.'},
 {id:'discovered',level:2,title:'Scacco di scoperta',theme:'Attacco di scoperta',
  fen:'4k3/8/8/8/4B3/8/8/4R1K1 w - - 0 1',from:'e4',to:'f5',
  task:'Muovi l’alfiere in modo da liberare la linea di attacco della torre contro il re nero.',
  hint:'La torre e1 è sulla stessa colonna del re e8, ma l’alfiere e4 blocca la linea.',
  explanation:'Af5+ libera la colonna e: lo scacco viene dalla torre, rimasta su e1. Questo è uno scacco di scoperta.'},
 {id:'doublecheck',level:3,title:'Doppio scacco',theme:'Scacco di scoperta',
  fen:'4k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1',from:'e4',to:'f6',
  task:'Con il cavallo realizza un doppio scacco al re nero.',
  hint:'Muovi il cavallo in una casa dalla quale attacchi e8 e liberi la colonna e.',
  explanation:'Cf6+ dà scacco sia con il cavallo f6 sia con la torre e1: è un doppio scacco. Nella notazione algebrica si usa +, non occorre ++.'},
 {id:'backrank',level:3,title:'Matto del corridoio',theme:'Scacco matto',
  fen:'6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',from:'e1',to:'e8',
  task:'Trova lo scacco matto in una sola mossa sfruttando i pedoni davanti al re nero.',
  hint:'Il re nero non può scappare attraversando i propri pedoni sulla settima traversa.',
  explanation:'Te8# è scacco matto del corridoio: il re g8 non ha vie di fuga e i suoi pedoni f7, g7, h7 gli impediscono di arretrare.'}
];
export const TOUR_LEVELS=[
 {name:'Primi salti',steps:8,desc:'Visita 8 caselle senza ripassare da una già utilizzata.'},
 {name:'Mezza scacchiera',steps:32,desc:'Raggiungi 32 caselle tutte diverse.'},
 {name:'Giro completo',steps:64,desc:'Visita tutte le 64 caselle una volta sola, muovendoti sempre a L.'}
];
export const knightDestinations=(name)=>{
  if(!/^[a-h][1-8]$/.test(name||''))return [];
  const c=name.charCodeAt(0)-97,r=Number(name[1])-1,choices=[];
  for(const [dc,dr] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){
    const x=c+dc,y=r+dr;if(x>=0&&x<8&&y>=0&&y<8)choices.push('abcdefgh'[x]+(y+1));
  }
  return choices;
};
