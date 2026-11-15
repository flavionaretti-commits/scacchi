import { START_FEN, parseFen, side, square, index, legalMoves, move, findMove, san, gameStatus, pieceGlyphs, toFen } from './chess-core.js';
import { LESSONS, COORDINATE_DRILL, HISTORY } from './lessons.js';
import { TACTICS, TOUR_LEVELS, knightDestinations } from './training-data.js';

const STORE='scacchi-scuola-v1';
let persisted={};
try {persisted=JSON.parse(localStorage.getItem(STORE)||'{}');}catch{}
const state={
  section:'home', lessonId:'board', dark:persisted.dark??false, teacher:persisted.teacher??false,
  progress:persisted.progress??{}, tacticProgress:persisted.tacticProgress??{}, notice:'', lesson:null,
  game:{history:[parseFen(START_FEN)], records:[], selected:-1, pending:null, claimed:''},
  queens:new Set(), showQueenSolution:false, trainerTab:'tour',
  tour:{path:[],level:0,hint:''}, tacticId:TACTICS[0].id, tactic:null, riceCell:1
};
const $=sel=>document.querySelector(sel);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const icons={home:'⌂',learn:'♞',train:'◎',play:'♜',explore:'✦'};
const titleBySection={home:'Il tuo laboratorio di scacchi',learn:'Impara, una mossa alla volta',train:'Allena la tua mente',play:'Una scacchiera per due',explore:'Scopri il mondo degli scacchi'};
function store(){
  try{localStorage.setItem(STORE,JSON.stringify({dark:state.dark,teacher:state.teacher,progress:state.progress,tacticProgress:state.tacticProgress}));}catch{}
}
function resetLesson(id){
  const l=LESSONS.find(x=>x.id===id)||LESSONS[0];
  state.lessonId=l.id;
  state.lesson={selected:-1,pending:null,history:l.fen?[parseFen(l.fen)]:[],done:false,
    coordStep:0,coordScore:0,coordSelected:'',feedback:'',showHint:false};
}
resetLesson('board');
function resetTactic(id){
  const p=TACTICS.find(x=>x.id===id)||TACTICS[0];
  state.tacticId=p.id;state.tactic={history:[parseFen(p.fen)],selected:-1,pending:null,done:false,showHint:false,feedback:''};
}
resetTactic(TACTICS[0].id);
function setPage(page){state.section=page;state.notice='';window.scrollTo({top:0,behavior:'instant'});render();}
function complete(id){state.progress[id]=true;store();}
const pct=()=>Math.round(100*LESSONS.filter(l=>state.progress[l.id]).length/LESSONS.length);
function render(){
  document.documentElement.dataset.theme=state.dark?'dark':'light';
  document.title='SCACCHI! • '+titleBySection[state.section];
  $('#app').innerHTML=`
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">♞</span><span><strong>SCACCHI!</strong><small>Il laboratorio della Maritano</small></span></div>
      <div class="side-kicker">ESPLORA IL CORSO</div>
      <nav class="side-nav" aria-label="Navigazione principale">${navButtons()}</nav>
      <div class="sidebar-bottom"><div class="mini-progress"><span>Lezioni completate</span><strong>${LESSONS.filter(l=>state.progress[l.id]).length} / ${LESSONS.length}</strong><div class="progress-track"><span style="width:${pct()}%"></span></div></div><p>Un percorso attivo, dalla prima casella allo scacco matto.</p></div>
    </aside>
    <div class="workspace">
      <header class="topbar"><div class="topbar-title"><span class="eyebrow">CORSO DI SCACCHI · VERSIONE 0.2</span><strong>${titleBySection[state.section]}</strong></div>
        <div class="toolbar"><button class="pill ${state.teacher?'active':''}" data-action="teacher" title="Modalità docente" aria-pressed="${state.teacher}">▣ <span>Docente</span></button><button class="icon-btn" data-action="theme" title="Cambia tema giorno/notte" aria-label="Cambia tema giorno/notte">${state.dark?'☀':'☾'}</button><button class="icon-btn" data-action="info" title="Informazioni" aria-label="Informazioni">i</button></div>
      </header>
      <main id="main">${renderContent()}</main>
      <footer class="footer">SCACCHI! · Materiale didattico elaborato dal corso del prof. Flavio Naretti · I progressi restano su questo dispositivo.</footer>
    </div>
    <nav class="bottom-nav" aria-label="Navigazione mobile">${navButtons()}</nav>
    <dialog id="information" class="info-dialog"><div class="dialog-heading"><h2>Informazioni su SCACCHI!</h2><button class="icon-btn" data-action="close-info" aria-label="Chiudi">×</button></div><p>Un laboratorio interattivo per imparare gli scacchi nella scuola secondaria di primo grado. I contenuti partono dal PowerPoint <em>Corso di scacchi</em> del prof. Flavio Naretti, riorganizzato e rivisto.</p><p><strong>Versione 0.2:</strong> 9 lezioni introduttive, giro del cavallo (8, 32 o 64 case), 8 esercizi tattici, otto regine, partite a due e laboratorio dei chicchi di riso.</p><p>Le mosse vengono controllate, comprese le regole di arrocco, en passant, promozione e sicurezza del re. Non è ancora presente un avversario computerizzato né una sincronizzazione cloud.</p><p>La modalità <strong>Docente</strong> mette a disposizione i suggerimenti e le soluzioni degli esercizi. Tema e progressi si memorizzano localmente nel browser.</p><button class="btn primary" data-action="close-info">Chiudi</button></dialog>`;
}
function navButtons(){
  return [['home','Home'],['learn','Impara'],['train','Allenati'],['play','Gioca'],['explore','Scopri']].map(([id,lab])=>`<button data-page="${id}" class="nav-link ${state.section===id?'selected':''}" aria-current="${state.section===id?'page':'false'}"><span class="nav-icon">${icons[id]}</span><span>${lab}</span></button>`).join('');
}
function renderContent(){
  if(state.section==='home')return homeHTML();
  if(state.section==='learn')return learnHTML();
  if(state.section==='train')return trainingHTML();
  if(state.section==='play')return gameHTML();
  return exploreHTML();
}
function homeHTML(){
  const completed=LESSONS.filter(x=>state.progress[x.id]).length;
  const next=LESSONS.find(x=>!state.progress[x.id])||LESSONS.at(-1);
  return `<section class="hero"><div class="hero-copy"><span class="tag">IL TUO NUOVO LABORATORIO</span><h1>Ogni grande partita<br>inizia da una casella.</h1><p>Scopri le regole, prova le mosse e allenati con problemi da risolvere direttamente sulla scacchiera.</p><div class="hero-actions"><button class="btn accent" data-lesson="${next.id}">▶ ${completed?'Continua a imparare':'Inizia il corso'}</button><button class="btn translucent" data-page="play">♟ Gioca in due</button></div></div><div class="hero-illustration" aria-hidden="true"><div class="float-star star1">✧</div><div class="hero-big-piece">♞</div><div class="float-star star2">✦</div><div class="board-pattern"></div></div></section>
  <div class="dash-top"><div><h2>Scegli il tuo percorso</h2><p>Esplora liberamente o segui le lezioni nell'ordine suggerito.</p></div><span class="progress-number">${completed} di ${LESSONS.length} lezioni · ${pct()}%</span></div>
  <div class="dashboard-grid"><button class="route-card" data-page="learn"><div class="route-icon cream">♘</div><h3>Impara</h3><p>Dalla scacchiera al primo scacco matto, con spiegazioni e prove pratiche.</p><span>Apri le lezioni ↗</span></button><button class="route-card" data-page="train"><div class="route-icon blush">✧</div><h3>Allenati</h3><p>Giro del cavallo, tattica e problema delle otto regine.</p><span>Vai agli esercizi ↗</span></button><button class="route-card" data-page="play"><div class="route-icon green">♜</div><h3>Gioca</h3><p>Una partita completa fra due persone, con mosse legali e cronologia.</p><span>Apri la scacchiera ↗</span></button><button class="route-card" data-page="explore"><div class="route-icon blue">✦</div><h3>Scopri</h3><p>Curiosità, storia, partite celebri e legami con la matematica.</p><span>Esplora le storie ↗</span></button></div>
  <div class="next-banner"><div><span class="eyebrow">PROSSIMA TAPPA</span><h3>${escapeHtml(next.label)}</h3><p>${escapeHtml(next.short)}</p></div><button class="btn primary" data-lesson="${next.id}">Apri la lezione →</button></div>`;
}
function learnHTML(){
  const l=LESSONS.find(x=>x.id===state.lessonId),d=state.lesson;
  return `<div class="page-intro"><span class="eyebrow">LEZIONI GUIDATE</span><h1>Impara gli scacchi</h1><p>Ogni lezione combina spiegazione, filastrocca ed esercizio sulla scacchiera.</p></div>
  <div class="lesson-layout"><aside class="lesson-list" aria-label="Elenco delle lezioni">${LESSONS.map((x,i)=>`<button data-lesson="${x.id}" class="lesson-link ${l.id===x.id?'current':''}"><span class="lesson-num">${state.progress[x.id]?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${escapeHtml(x.label)}</strong><small>${escapeHtml(x.short)}</small></span></button>`).join('')}</aside>
  <section class="lesson-content"><div class="lesson-meta"><span class="tag subtle">LEZIONE ${LESSONS.indexOf(l)+1} DI ${LESSONS.length}</span><span class="tiny">Dal PowerPoint · slide ${l.page}</span></div><h2>${l.symbol} ${escapeHtml(l.label)}</h2><p class="lead">${escapeHtml(l.description)}</p>
  ${l.poem?`<details class="poem"><summary>♪ La filastrocca del tuo corso</summary><p>${escapeHtml(l.poem).replace(/\n/g,'<br>')}</p></details>`:''}
  <div class="training-card"><div class="training-head"><div><span class="eyebrow">ORA PROVA TU</span><h3>${l.kind==='coordinates'?'Riconosci le coordinate':'Muovi sulla scacchiera'}</h3></div><button class="text-btn" data-action="restart-lesson">↻ Ricomincia</button></div>
  ${l.kind==='coordinates'?coordExerciseHTML(d):lessonExerciseHTML(l,d)}
  </div>
  <details class="notes" open><summary>Da ricordare</summary><ul>${l.notes.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul></details>
  ${d.done?`<div class="success-panel"><strong>✓ Lezione completata!</strong><p>Ottimo lavoro: puoi riprovare o passare alla lezione successiva.</p>${LESSONS.indexOf(l)<LESSONS.length-1?`<button class="btn accent" data-lesson="${LESSONS[LESSONS.indexOf(l)+1].id}">Lezione successiva →</button>`:''}</div>`:''}
  </section></div>`;
}
function coordExerciseHTML(d){
  const target=COORDINATE_DRILL[d.coordStep];
  return `<p class="task">${d.done?'Esercizio completato!':`Tocca la casa <strong>${target}</strong> sulla scacchiera.`}</p>
  <div class="board-wrap lesson-board">${boardHTML(null,{mode:'coordinates',selected:d.coordSelected})}</div>
  <div class="board-caption"><span>Risposte esatte: <strong>${d.coordScore}/${COORDINATE_DRILL.length}</strong></span><span>Domanda ${Math.min(d.coordStep+1,COORDINATE_DRILL.length)} di ${COORDINATE_DRILL.length}</span></div>
  ${d.feedback?`<p role="status" class="feedback ${d.feedback.startsWith('Esatto')?'positive':''}">${escapeHtml(d.feedback)}</p>`:''}`;
}
function lessonExerciseHTML(l,d){
  const current=d.history.at(-1);
  return `<p class="task">${escapeHtml(l.task)}</p><div class="board-wrap lesson-board">${boardHTML(current,{mode:'lesson',selected:d.selected,pending:d.pending,showHint:state.teacher||d.showHint,from:l.from,to:l.to})}</div>
  <div class="board-caption"><span>${d.done?'✓ Obiettivo raggiunto':'Seleziona un pezzo, poi una casa evidenziata.'}</span><button class="text-btn" data-action="hint">${d.showHint?'Nascondi l’aiuto':'Mostra un aiuto'}</button></div>
  ${d.pending?promotionHTML('lesson',d.pending):''}
  ${d.feedback?`<p role="status" class="feedback ${d.done?'positive':''}">${escapeHtml(d.feedback)}</p>`:''}
  ${d.showHint||state.teacher?`<div class="hint">Suggerimento: ${escapeHtml(l.tip)} ${state.teacher?`<strong>Soluzione: ${l.from} → ${l.to}.</strong>`:''}</div>`:''}`;
}
function trainingHTML(){
  const tabs=[['tour','♘ Giro del cavallo'],['tactics','♙ Tattica'],['queens','♕ Otto regine']];
  return `<div class="page-intro"><span class="eyebrow">ROMPICAPI E SFIDE</span><h1>Allena la mente</h1><p>Tre laboratori interattivi per imparare provando: percorsi, combinazioni e ragionamento logico.</p></div>
  <div class="trainer-tabs" role="group" aria-label="Scegli l'allenamento">${tabs.map(([id,name])=>`<button class="trainer-tab ${state.trainerTab===id?'active':''}" data-trainer="${id}" aria-pressed="${state.trainerTab===id}">${name}</button>`).join('')}</div>
  ${state.trainerTab==='tour'?tourHTML():state.trainerTab==='tactics'?tacticsHTML():queensHTML()}`;
}
function queensHTML(){
  const conflicts=conflictingQueens(),valid=state.queens.size===8 && conflicts.size===0;
  return `<div class="trainer-layout"><section class="puzzle-panel"><span class="tag">ROMPICAPO DALLE SLIDE 35–36</span><h2>Il problema delle otto regine</h2><p>Disponi <strong>8 regine</strong> sulla scacchiera in modo che nessuna possa catturarne un’altra. Tocca una casella per aggiungere o togliere una regina.</p>
  <div class="board-wrap puzzle-board">${queensBoardHTML(conflicts)}</div>
  <div class="board-caption"><span>Regine posizionate: <strong>${state.queens.size}/8</strong></span><span>${conflicts.size?'⚠ Alcune regine si minacciano':'Nessun conflitto'}</span></div>
  ${valid?'<div class="success-panel"><strong>✓ Soluzione trovata!</strong><p>Le otto regine non si minacciano. Ottima strategia!</p></div>':''}
  <div class="action-row"><button class="btn outlined" data-action="queens-reset">Azzera scacchiera</button><button class="btn ${state.showQueenSolution?'outlined':'primary'}" data-action="queens-solution">${state.showQueenSolution?'Nascondi soluzione':'Mostra soluzione'}</button></div>
  ${state.showQueenSolution?'<div class="hint">Una possibile soluzione è visualizzata sulla scacchiera (in verde). Esistono 12 soluzioni fondamentali, senza contare rotazioni e riflessioni.</div>':''}</section>
  <aside class="side-card"><h3>Un problema matematico</h3><p>Due regine si attaccano quando condividono una traversa, una colonna oppure una diagonale.</p><p>La sfida nasce dal ragionamento combinatorio: si devono cercare disposizioni senza conflitti.</p><button class="btn outlined" data-trainer="tour">Prova il giro del cavallo →</button></aside></div>`;
}
function tourHTML(){
  const t=state.tour,path=t.path,goal=TOUR_LEVELS[t.level].steps,done=path.length>=goal;
  const dest=path.length?knightDestinations(path.at(-1)).filter(x=>!path.includes(x)):[];
  const trapped=!done&&path.length>0&&!dest.length;
  return `<div class="trainer-layout"><section class="puzzle-panel"><span class="tag">SCACCHI E MATEMATICA · GRAFI</span><h2>Il giro del cavallo</h2>
    <p>Scegli una casa di partenza, poi muovi il cavallo a L senza visitare due volte la stessa casa. La scacchiera evidenzia le destinazioni possibili.</p>
    <div class="level-buttons" role="group" aria-label="Difficoltà del giro">${TOUR_LEVELS.map((lev,i)=>`<button class="level-button ${t.level===i?'active':''}" data-tour-level="${i}" aria-pressed="${t.level===i}">${lev.name}<small>${lev.steps} case</small></button>`).join('')}</div>
    <div class="puzzle-progress"><strong>${path.length} / ${goal}</strong> case visitate <div class="progress-track"><span style="width:${Math.round(100*path.length/goal)}%"></span></div></div>
    <div class="board-wrap puzzle-board">${tourBoardHTML(dest)}</div>
    <div class="board-caption"><span>${path.length?`Cavallo in ${path.at(-1)}`:'Tocca una casa per iniziare'}</span><span>${done?'Percorso completato':trapped?'Nessuna mossa disponibile':`${dest.length} destinazioni possibili`}</span></div>
    ${done?`<div class="success-panel"><strong>✓ Sfida completata!</strong><p>Hai visitato ${goal} case senza mai ripassare. ${goal===64?'Hai realizzato un percorso completo del cavallo!':'Ora puoi provare un livello più impegnativo.'}</p></div>`:''}
    ${trapped?'<p role="status" class="feedback">Il cavallo non può raggiungere altre case libere. Annulla alcune mosse o ricomincia.</p>':''}
    ${t.hint&&!done?`<div class="hint">${escapeHtml(t.hint)}</div>`:''}
    <div class="action-row"><button class="btn outlined" data-action="tour-undo" ${path.length?'':'disabled'}>↶ Annulla salto</button><button class="btn outlined" data-action="tour-reset">↻ Ricomincia</button><button class="btn primary" data-action="tour-hint" ${done||trapped?'disabled':''}>Suggerisci una mossa</button></div>
  </section><aside class="side-card"><h3>Dal cavallo ai grafi</h3><p>È un problema classico studiato anche da Eulero: si cercano percorsi su una rete di 64 caselle, utilizzando soltanto i salti del cavallo.</p><p><strong>Tre sfide:</strong> prime 8 case, metà scacchiera e percorso completo di 64 case. Il primo clic conta come prima casa visitata.</p><p>Un percorso completo non deve necessariamente tornare alla casella iniziale: quello sarebbe un <em>giro chiuso</em>, una sfida ancora diversa.</p><hr><h3>Per l'insegnante</h3><p>Laboratorio ispirato all'articolo di Piergiorgio Odifreddi «Percorsi sulla scacchiera» (*Le Scienze*, agosto 2011), nel tuo archivio. Interfaccia e esercizio sono originali.</p></aside></div>`;
}
function tourBoardHTML(dest){
  const path=state.tour.path,at=path.at(-1),visited=new Map(path.map((x,i)=>[x,i+1]));
  let html='<div class="chessboard tourboard" role="group" aria-label="Percorso del cavallo">';
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const name='abcdefgh'[col]+(8-row),n=visited.get(name),current=name===at,possible=dest.includes(name);
    const classes=['square',(row+col)%2===0?'light':'dark',n?'tour-visited':'',current?'tour-current':'',possible?'target-square':''];
    html+=`<button class="${classes.filter(Boolean).join(' ')}" data-tour-square="${name}" title="${name}" aria-label="${name}${current?', posizione del cavallo':n?', già visitata':possible?', destinazione possibile':''}">${current?'<span class="piece white-piece">♘</span>':n?`<span class="tour-step">${n}</span>`:possible?'<span class="legal-dot"></span>':''}${col===0?`<span class="rank-label">${8-row}</span>`:''}${row===7?`<span class="file-label">${'abcdefgh'[col]}</span>`:''}</button>`;
  }
  return html+'</div>';
}
function tacticsHTML(){
  const p=TACTICS.find(x=>x.id===state.tacticId),d=state.tactic,s=d.history.at(-1);
  const solved=TACTICS.filter(x=>state.tacticProgress[x.id]).length;
  const idx=TACTICS.indexOf(p);
  return `<div class="tactics-layout"><section class="puzzle-panel"><span class="tag">TATTICA · LIVELLO ${p.level}</span><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.task)}</p>
    <div class="board-wrap puzzle-board">${boardHTML(s,{mode:'tactic',selected:d.selected,showHint:d.showHint||state.teacher,from:p.from,to:p.to})}</div>
    <div class="board-caption"><span>${d.done?'✓ Combinazione trovata':'Muove il Bianco'}</span><span>${escapeHtml(p.theme)}</span></div>
    ${d.feedback?`<p role="status" class="feedback ${d.done?'positive':''}">${escapeHtml(d.feedback)}</p>`:''}
    ${d.done?`<div class="success-panel"><strong>✓ Esercizio risolto!</strong><p>${escapeHtml(p.explanation)}</p>${idx<TACTICS.length-1?`<button class="btn accent" data-tactic="${TACTICS[idx+1].id}">Prossima sfida →</button>`:''}</div>`:''}
    ${!d.done&&(d.showHint||state.teacher)?`<div class="hint"><strong>Aiuto:</strong> ${escapeHtml(p.hint)} ${state.teacher?`<br><strong>Soluzione:</strong> ${p.from} → ${p.to}. ${escapeHtml(p.explanation)}`:''}</div>`:''}
    <div class="action-row"><button class="btn outlined" data-action="tactic-reset">↻ Riprova</button><button class="btn primary" data-action="tactic-hint">${d.showHint?'Nascondi aiuto':'Mostra aiuto'}</button></div>
  </section><aside class="side-card"><div class="side-title"><h3>Le sfide</h3><span class="tiny">${solved} / ${TACTICS.length} completate</span></div><div class="tactic-list">${TACTICS.map((q,i)=>`<button class="tactic-link ${q.id===p.id?'selected':''}" data-tactic="${q.id}"><span>${state.tacticProgress[q.id]?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${escapeHtml(q.title)}</strong><small>Livello ${q.level} · ${escapeHtml(q.theme)}</small></span></button>`).join('')}</div><hr><p class="field-note">Le combinazioni sono posizioni originali create per questo laboratorio sulla base dei temi presenti nelle dispense «5. Tattiche» e «Tattica scacchistica». Le mosse sono verificate dal motore.</p></aside></div>`;
}
function gameHTML(){
  const g=state.game, s=g.history.at(-1),status=gameStatus(g.history);
  const terminal=!!g.claimed||status.ended;
  const rows=[];
  for(let i=0;i<g.records.length;i+=2) rows.push(`<div class="move-row"><span>${Math.floor(i/2)+1}.</span><span>${escapeHtml(g.records[i]||'')}</span><span>${escapeHtml(g.records[i+1]||'')}</span></div>`);
  return `<div class="page-intro"><span class="eyebrow">DUE GIOCATORI · UN DISPOSITIVO</span><h1>Gioca una partita</h1><p>Il Bianco comincia. La scacchiera impedisce le mosse illegali e registra le mosse in notazione standard.</p></div><div class="game-layout"><section class="game-card"><div class="status-bar"><span class="status-dot ${terminal?'finished':''}"></span><strong>${escapeHtml(g.claimed||status.text)}</strong></div><div class="board-wrap game-board">${boardHTML(s,{mode:'game',selected:g.selected,pending:g.pending})}</div>
  ${g.pending?promotionHTML('game',g.pending):''}
  <div class="action-row"><button class="btn outlined" data-action="game-undo" ${g.history.length===1?'disabled':''}>↶ Annulla mossa</button><button class="btn outlined" data-action="game-new">↻ Nuova partita</button></div>
  ${!terminal&&status.claim?`<button class="btn outlined" data-action="game-draw">Reclama la patta (${status.claim})</button>`:''}
  <p class="field-note">Per giocare: seleziona un pezzo del giocatore di turno, poi una casa evidenziata. Per la promozione scegli il pezzo nella schermata che compare.</p></section>
  <aside class="game-side"><div class="side-card"><div class="side-title"><h3>Formulario delle mosse</h3><button class="text-btn" data-action="game-copy" ${g.records.length===0?'disabled':''}>Copia</button></div><div class="movelist" aria-label="Mosse effettuate">${rows.join('')||'<p class="empty">Le mosse compariranno qui.</p>'}</div><div class="turn-label">${g.records.length} semimosse registrate</div></div><div class="side-card"><h3>Regole della partita</h3><p>Si gioca a turno sullo stesso dispositivo. Sono gestite le mosse speciali, lo scacco, il matto, lo stallo e le principali patte regolamentari.</p><p>Non è ancora previsto un avversario gestito dal computer.</p></div></aside></div>`;
}
function riceSummary(n){
  const on=2n**BigInt(n-1),sum=2n**BigInt(n)-1n;
  const fmt=v=>v.toLocaleString('it-IT');
  return {on:fmt(on),sum:fmt(sum)};
}
function exploreHTML(){
  const n=state.riceCell,r=riceSummary(n);
  return `<div class="page-intro"><span class="eyebrow">STORIA, SCIENZA E CURIOSITÀ</span><h1>Un gioco, mille storie</h1><p>Dal PowerPoint e dai tuoi materiali, alcune tappe della storia degli scacchi e un laboratorio sulle potenze di 2.</p></div>
  <section class="rice-lab"><div><span class="tag">LABORATORIO DI MATEMATICA</span><h2>La leggenda dei chicchi di riso</h2><p>Un chicco sulla prima casa, due sulla seconda, quattro sulla terza… e così via fino alla sessantaquattresima. Sposta il cursore per scoprire quanto velocemente crescono le quantità.</p><label class="rice-label" for="rice-range">Numero della casella: <strong id="rice-n">${n}</strong> / 64</label><input id="rice-range" type="range" min="1" max="64" step="1" value="${n}" aria-label="Numero della casella" data-rice><div class="rice-stats"><div><span>Chicchi sulla casella scelta</span><strong id="rice-current">${r.on}</strong></div><div><span>Chicchi complessivi fino a quella casella</span><strong id="rice-total">${r.sum}</strong></div></div><p class="field-note">Formule: n-esima casella = 2<sup>n−1</sup>; totale delle prime n case = 2<sup>n</sup>−1. Dati esatti, senza arrotondamenti.</p></div><div class="rice-visual" aria-hidden="true"><div>1</div><div>2</div><div>4</div><div>8</div><div>16</div><div>32</div><div>64</div><div>128</div><span>Ogni casella raddoppia la precedente</span></div></section>
  <div class="history-grid">${HISTORY.map((h,i)=>`<article class="history-card"><span class="history-num">${String(i+1).padStart(2,'0')}</span><h2>${escapeHtml(h.title)}</h2><p>${escapeHtml(h.text)}</p><span class="source">${escapeHtml(h.source)}</span></article>`).join('')}</div><div class="explore-note"><strong>In preparazione:</strong> riproduzione interattiva delle partite PGN storiche, glossario, aperture e finali. La sezione tornei scolastici è volutamente esclusa da questa versione.</div>`;
}
function boardHTML(s,opts={}){
  const select=opts.selected;
  const active= s && select>=0 && !opts.pending ? legalMoves(s).filter(m=>m.from===select) : [];
  const targets=new Set(active.map(m=>m.to));
  let html='<div class="chessboard" role="group" aria-label="Scacchiera, Bianco in basso">';
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const i=row*16+col, name=square(i), piece=s?s.b[i]:'.';
    const light=(row+col)%2===0;
    const classes=['square',light?'light':'dark'];
    if(i===select)classes.push('selected-square');
    if(targets.has(i))classes.push('target-square');
    if(opts.showHint&&(name===opts.from||name===opts.to))classes.push('hint-square');
    if(opts.mode==='coordinates'&&name===select)classes.push('selected-square');
    const aria=`${name}${piece!=='.'?', '+({K:'re bianco',Q:'donna bianca',R:'torre bianca',B:'alfiere bianco',N:'cavallo bianco',P:'pedone bianco',k:'re nero',q:'donna nera',r:'torre nera',b:'alfiere nero',n:'cavallo nero',p:'pedone nero'}[piece]):', vuota'}`;
    html+=`<button class="${classes.join(' ')}" data-square="${name}" data-board="${opts.mode}" aria-label="${aria}" title="${name}">${piece!=='.'?`<span class="piece ${side(piece)===1?'white-piece':'black-piece'}">${pieceGlyphs[piece]}</span>`:''}${targets.has(i)?'<span class="legal-dot" aria-hidden="true"></span>':''}${col===0?`<span class="rank-label">${8-row}</span>`:''}${row===7?`<span class="file-label">${'abcdefgh'[col]}</span>`:''}</button>`;
  }
  return html+'</div>';
}
function promotionHTML(mode,ms){
  return `<div class="promotion-picker"><strong>Scegli il pezzo per la promozione</strong><div>${ms.map(m=>`<button class="promo-choice" data-promote="${m.promotion}" data-mode="${mode}">${({q:'Donna',r:'Torre',b:'Alfiere',n:'Cavallo'})[m.promotion]}</button>`).join('')}<button class="promo-choice" data-action="promotion-cancel">Annulla</button></div></div>`;
}
function conflictingQueens(){
  const bad=new Set(),items=[...state.queens];
  for(let x=0;x<items.length;x++)for(let y=x+1;y<items.length;y++){
    const [a,b]=[items[x],items[y]],ca=a.charCodeAt(0)-97,cb=b.charCodeAt(0)-97,ra=+a[1],rb=+b[1];
    if(ca===cb||ra===rb||Math.abs(ca-cb)===Math.abs(ra-rb)){bad.add(a);bad.add(b);}
  }
  return bad;
}
function queensBoardHTML(conflicts){
  const solution=new Set(['a1','e2','h3','f4','c5','g6','b7','d8']);
  let str='<div class="chessboard" role="group" aria-label="Rompicapo delle otto regine">';
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const name='abcdefgh'[col]+(8-row),placed=state.queens.has(name);
    str+=`<button class="square ${(row+col)%2===0?'light':'dark'} ${conflicts.has(name)?'conflict-square':''} ${state.showQueenSolution&&solution.has(name)?'solution-square':''}" data-queen="${name}" title="${name}" aria-label="${name}, ${placed?'regina':'vuota'}">${placed?'<span class="piece white-piece">♕</span>':state.showQueenSolution&&solution.has(name)?'<span class="piece solution-piece">♕</span>':''}${col===0?`<span class="rank-label">${8-row}</span>`:''}${row===7?`<span class="file-label">${'abcdefgh'[col]}</span>`:''}</button>`;
  }
  return str+'</div>';
}
function handleTour(name){
  const t=state.tour,old=t.path,goal=TOUR_LEVELS[t.level].steps;
  if(old.length>=goal)return;
  if(!old.length){t.path=[name];t.hint='';render();return;}
  if(old.includes(name)||!knightDestinations(old.at(-1)).includes(name))return;
  t.path.push(name);t.hint='';render();
}
function tourHint(){
  const t=state.tour,path=t.path,goal=TOUR_LEVELS[t.level].steps;
  if(path.length>=goal)return;
  if(!path.length){t.hint='Comincia da una casa d’angolo, per esempio a1, oppure scegli liberamente una posizione iniziale.';return;}
  const opts=knightDestinations(path.at(-1)).filter(x=>!path.includes(x));
  if(!opts.length){t.hint='Non sono rimaste destinazioni disponibili: annulla alcune mosse per scegliere un altro percorso.';return;}
  opts.sort((a,b)=>{
    const n=x=>knightDestinations(x).filter(y=>!path.includes(y)).length;
    return n(a)-n(b)||a.localeCompare(b);
  });
  t.hint=`Una possibile prossima mossa è ${path.at(-1)} → ${opts[0]}. È un suggerimento, non una garanzia di completare il percorso.`;
}
function handleBoard(mode,name){
  if(mode==='coordinates'){
    const d=state.lesson;
    if(d.done)return;
    const t=COORDINATE_DRILL[d.coordStep];d.coordSelected=name;
    if(name===t){d.coordScore++;d.coordStep++;d.feedback=`Esatto! Hai trovato ${name}.`;
      if(d.coordStep===COORDINATE_DRILL.length){d.done=true;complete('board');d.feedback='Esatto! Hai riconosciuto tutte le coordinate.';}}
    else d.feedback=`Hai toccato ${name}, ma cercavamo ${t}. Riprova.`;
    render();return;
  }
  if(mode==='tactic'){
    const d=state.tactic,p=TACTICS.find(x=>x.id===state.tacticId),s=d.history.at(-1),i=index(name);
    if(d.done)return;
    if(side(s.b[i])===s.turn){d.selected=d.selected===i?-1:i;d.feedback='';render();return;}
    if(d.selected<0){d.feedback='Seleziona prima un pezzo bianco.';render();return;}
    const m=legalMoves(s).find(m=>m.from===d.selected&&m.to===i);
    if(!m){d.feedback='Quella mossa non è legale. Prova un’altra destinazione.';render();return;}
    if(square(d.selected)!==p.from||name!==p.to){d.feedback='La mossa è legale, ma non risolve il tema tattico richiesto. Prova ancora.';d.selected=-1;render();return;}
    const note=san(s,m);d.history.push(move(s,m));d.done=true;d.selected=-1;d.feedback=`Esatto! ${note} — ${p.title}.`;
    state.tacticProgress[p.id]=true;store();render();return;
  }
  const d=mode==='lesson'?state.lesson:state.game;
  if(mode==='lesson'&&d.done)return;
  if(d.pending||mode==='game'&&(d.claimed||gameStatus(d.history).ended))return;
  const s=d.history.at(-1),i=index(name);
  if(side(s.b[i])===s.turn){d.selected=d.selected===i?-1:i;d.feedback='';render();return;}
  if(d.selected<0){if(mode==='lesson')d.feedback='Seleziona prima il pezzo che vuoi muovere.';render();return;}
  const choices=legalMoves(s).filter(m=>m.from===d.selected&&m.to===i);
  if(!choices.length){if(mode==='lesson')d.feedback='Mossa impossibile. Osserva le case evidenziate.';render();return;}
  if(mode==='lesson') {
    const l=LESSONS.find(x=>x.id===state.lessonId);
    if(square(d.selected)!==l.from||name!==l.to){d.feedback='La mossa è legale, ma non risolve questa sfida. Riprova.';d.selected=-1;render();return;}
  }
  if(choices.length>1){d.pending=choices;render();return;}
  doPlay(mode,choices[0]);
}
function doPlay(mode,m){
  const d=mode==='lesson'?state.lesson:state.game,s=d.history.at(-1),note=san(s,m);
  d.history.push(move(s,m));d.selected=-1;d.pending=null;
  if(mode==='lesson'){
    const l=LESSONS.find(x=>x.id===state.lessonId);
    d.done=true;complete(l.id);
    d.feedback=`Bravo! La mossa ${note} risolve l’esercizio.`;
  }else d.records.push(note);
  render();
}
function clickAction(action){
  if(action==='theme'){state.dark=!state.dark;store();render();return;}
  if(action==='teacher'){state.teacher=!state.teacher;store();render();return;}
  if(action==='info'){$('#information').showModal();return;}
  if(action==='close-info'){$('#information').close();return;}
  if(action==='restart-lesson'){resetLesson(state.lessonId);render();return;}
  if(action==='hint'){state.lesson.showHint=!state.lesson.showHint;render();return;}
  if(action==='game-undo'){
    const g=state.game;if(g.history.length>1){g.history.pop();g.records.pop();g.selected=-1;g.pending=null;g.claimed='';}render();return;
  }
  if(action==='game-new'){state.game={history:[parseFen(START_FEN)],records:[],selected:-1,pending:null,claimed:''};render();return;}
  if(action==='game-draw') {const g=state.game,st=gameStatus(g.history);if(st.claim)g.claimed='Patta reclamata: '+st.claim+'.';render();return;}
  if(action==='game-copy'){
    const g=state.game,groups=[];for(let i=0;i<g.records.length;i+=2)groups.push(`${i/2+1}. ${g.records[i]}`+(g.records[i+1]?' '+g.records[i+1]:''));
    const text=groups.join(' ');
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>{state.notice='Formulario copiato.';announce();}).catch(()=>fallbackCopy(text));
    else fallbackCopy(text);
    return;
  }
  if(action==='tour-reset'){state.tour.path=[];state.tour.hint='';render();return;}
  if(action==='tour-undo'){state.tour.path.pop();state.tour.hint='';render();return;}
  if(action==='tour-hint'){tourHint();render();return;}
  if(action==='tactic-reset'){resetTactic(state.tacticId);render();return;}
  if(action==='tactic-hint'){state.tactic.showHint=!state.tactic.showHint;render();return;}
  if(action==='queens-reset'){state.queens=new Set();state.showQueenSolution=false;render();return;}
  if(action==='queens-solution'){state.showQueenSolution=!state.showQueenSolution;render();return;}
  if(action==='promotion-cancel'){const d=state.section==='play'?state.game:state.lesson;d.pending=null;render();}
}
function fallbackCopy(t){const ta=document.createElement('textarea');ta.value=t;document.body.append(ta);ta.select();try{document.execCommand('copy');state.notice='Formulario copiato.';}catch{state.notice='Impossibile copiare su questo dispositivo.';}ta.remove();announce();}
function announce(){const live=$('#live');if(live)live.textContent=state.notice;}
document.addEventListener('click',e=>{
  const target=e.target.closest('button');if(!target)return;
  if(target.dataset.page){setPage(target.dataset.page);return;}
  if(target.dataset.lesson){resetLesson(target.dataset.lesson);setPage('learn');return;}
  if(target.dataset.trainer){state.trainerTab=target.dataset.trainer;render();return;}
  if(target.dataset.tactic){resetTactic(target.dataset.tactic);render();return;}
  if(target.dataset.tourLevel){state.tour={path:[],level:Number(target.dataset.tourLevel),hint:''};render();return;}
  if(target.dataset.tourSquare){handleTour(target.dataset.tourSquare);return;}
  if(target.dataset.square){handleBoard(target.dataset.board,target.dataset.square);return;}
  if(target.dataset.queen){const q=target.dataset.queen;if(state.queens.has(q))state.queens.delete(q);else if(state.queens.size<8)state.queens.add(q);render();return;}
  if(target.dataset.promote){const d=target.dataset.mode==='lesson'?state.lesson:state.game;if(d.pending){const m=d.pending.find(x=>x.promotion===target.dataset.promote);if(m)doPlay(target.dataset.mode,m);}return;}
  if(target.dataset.action)clickAction(target.dataset.action);
});
document.addEventListener('input',e=>{
  if(e.target.matches('[data-rice]')){
    const n=Number(e.target.value);state.riceCell=n;const r=riceSummary(n);
    $('#rice-n').textContent=n;$('#rice-current').textContent=r.on;$('#rice-total').textContent=r.sum;
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#information')?.open)$('#information').close();});
render();
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
