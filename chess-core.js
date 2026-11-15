/**
 * SCACCHI! — engine for standard chess, implemented without external dependencies.
 * Internal 0x88 board.  Includes king safety, castling, en passant,
 * promotion, mate/stalemate and standard draw conditions.
 * Released as part of this educational project.
 */
export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const D = {
  n: [-33, -31, -18, -14, 14, 18, 31, 33],
  b: [-17, -15, 15, 17],
  r: [-16, -1, 1, 16],
  k: [-17, -16, -15, -1, 1, 15, 16, 17]
};
D.q = [...D.b, ...D.r];
const on = i => i >= 0 && i < 128 && !(i & 0x88);
export const square = i => 'abcdefgh'[i & 7] + (8 - (i >> 4));
export const index = s => (8 - +s[1]) * 16 + 'abcdefgh'.indexOf(s[0]);
export const side = p => !p || p === '.' ? 0 : p === p.toUpperCase() ? 1 : -1;
export const uci = m => square(m.from) + square(m.to) + (m.promotion || '');
export const pieceGlyphs = {K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'\u265F\uFE0E'};
export function parseFen(fen) {
  const v = fen.trim().split(/\s+/);
  if (v.length < 4 || !/^[wb]$/.test(v[1]) || !/^(?:-|K?Q?k?q?)$/.test(v[2]) || !/^(?:-|[a-h][36])$/.test(v[3])) throw new Error('FEN non valido.');
  const rows = v[0].split('/'), b = new Array(128).fill('.');
  if (rows.length !== 8) throw new Error('FEN: numero righe errato.');
  rows.forEach((row, r) => {
    let c = 0;
    for (const p of row) {
      if (/^[1-8]$/.test(p)) c += Number(p);
      else if (/^[prnbqkPRNBQK]$/.test(p) && c < 8) b[r*16 + c++] = p;
      else throw new Error('FEN: casa non valida.');
    }
    if (c !== 8) throw new Error('FEN: riga incompleta.');
  });
  if (b.filter(p => p === 'K').length !== 1 || b.filter(p => p === 'k').length !== 1) throw new Error('FEN: occorre un re per colore.');
  const rights = v[2] === '-' ? '' : v[2];
  const castling = (rights.includes('K') ? 1 : 0) | (rights.includes('Q') ? 2 : 0) | (rights.includes('k') ? 4 : 0) | (rights.includes('q') ? 8 : 0);
  return {b, turn: v[1] === 'w' ? 1 : -1, castling, ep: v[3] === '-' ? -1 : index(v[3]), half: +(v[4] || 0), full: +(v[5] || 1)};
}
export function attacked(s, target, by) {
  if (!on(target)) return false;
  for (let from=0; from<128; from++) {
    if (!on(from) || side(s.b[from]) !== by) continue;
    const piece = s.b[from].toLowerCase();
    if (piece === 'p') {
      if (target === from - 16*by - 1 || target === from - 16*by + 1) return true;
      continue;
    }
    for (const d of D[piece]) {
      for (let to=from+d; on(to); to+=d) {
        if (to === target) return true;
        if (s.b[to] !== '.' || piece === 'n' || piece === 'k') break;
      }
    }
  }
  return false;
}
export function inCheck(s, color = s.turn) {
  const king = s.b.indexOf(color === 1 ? 'K' : 'k');
  return king < 0 || attacked(s, king, -color);
}
export function move(s, m) {
  const b = s.b.slice(), piece = b[m.from], captured = b[m.to];
  let rights = s.castling;
  b[m.from] = '.';
  b[m.to] = m.promotion ? (s.turn === 1 ? m.promotion.toUpperCase() : m.promotion.toLowerCase()) : piece;
  if (m.flag === 'ep') b[m.to + 16*s.turn] = '.';
  if (m.flag === 'castle') {
    const rookFrom = m.to > m.from ? m.from + 3 : m.from - 4;
    const rookTo = m.to > m.from ? m.from + 1 : m.from - 1;
    b[rookTo] = b[rookFrom]; b[rookFrom] = '.';
  }
  if (piece === 'K') rights &= ~3;
  if (piece === 'k') rights &= ~12;
  const rookBit = {119:1,112:2,7:4,0:8};
  if (piece.toLowerCase() === 'r') rights &= ~(rookBit[m.from] || 0);
  if (captured.toLowerCase() === 'r') rights &= ~(rookBit[m.to] || 0);
  return {b, turn:-s.turn, castling:rights,
    ep:piece.toLowerCase()==='p' && Math.abs(m.to-m.from)===32 ? (m.to+m.from)/2 : -1,
    half:piece.toLowerCase()==='p' || captured!=='.' || m.flag==='ep' ? 0 : s.half+1,
    full:s.full+(s.turn===-1?1:0)};
}
function pseudo(s) {
  const result=[];
  for (let from=0;from<128;from++) {
    if (!on(from) || side(s.b[from])!==s.turn) continue;
    const p=s.b[from].toLowerCase();
    const push=(to,flag='')=>{
      if (s.b[to].toLowerCase() === 'k') return; // a king is never captured
      if (p==='p' && ((to>>4)===0 || (to>>4)===7))
        for(const promotion of ['q','r','b','n']) result.push({from,to,promotion,flag});
      else result.push({from,to,promotion:'',flag});
    };
    if (p==='p') {
      const to=from-16*s.turn;
      if (on(to) && s.b[to]==='.') {
        push(to);
        const ahead=to-16*s.turn;
        if ((from>>4)===(s.turn===1?6:1) && s.b[ahead]==='.') push(ahead);
      }
      for (const dc of [-1,1]) {
        const target=to+dc;
        if (!on(target)) continue;
        if (side(s.b[target])===-s.turn) push(target);
        else if (target===s.ep && s.b[target]==='.' && s.b[target+16*s.turn]===(s.turn===1?'p':'P')) push(target,'ep');
      }
      continue;
    }
    for (const d of D[p]) {
      for (let to=from+d;on(to);to+=d) {
        if (side(s.b[to])===s.turn) break;
        push(to);
        if (s.b[to]!=='.' || p==='n' || p==='k') break;
      }
    }
    if (p==='k') {
      const home=s.turn===1?116:4;
      const rook=s.turn===1?'R':'r';
      const ks=s.turn===1?1:4, qs=s.turn===1?2:8;
      if(from!==home || inCheck(s)) continue;
      if ((s.castling&ks) && s.b[from+3]===rook && s.b[from+1]==='.' && s.b[from+2]==='.'
          && !attacked(s,from+1,-s.turn) && !attacked(s,from+2,-s.turn)) push(from+2,'castle');
      if ((s.castling&qs) && s.b[from-4]===rook && s.b[from-1]==='.' && s.b[from-2]==='.' && s.b[from-3]==='.'
          && !attacked(s,from-1,-s.turn) && !attacked(s,from-2,-s.turn)) push(from-2,'castle');
    }
  }
  return result;
}
export const legalMoves = s => pseudo(s).filter(m => !inCheck(move(s,m), s.turn));
export function san(s,m) {
  const p=s.b[m.from].toUpperCase();
  const capture=s.b[m.to]!=='.'||m.flag==='ep';
  let result='';
  if (m.flag==='castle') result = m.to>m.from?'O-O':'O-O-O';
  else {
    if (p!=='P') {
      result=p;
      const others=legalMoves(s).filter(x=>x.from!==m.from && x.to===m.to && s.b[x.from]===s.b[m.from]);
      if(others.length) {
        const file=square(m.from)[0],rank=square(m.from)[1];
        result+=!others.some(x=>(x.from&7)===(m.from&7))?file:
                !others.some(x=>(x.from>>4)===(m.from>>4))?rank:file+rank;
      }
    } else if(capture) result=square(m.from)[0];
    result+=(capture?'x':'')+square(m.to)+(m.promotion?'='+m.promotion.toUpperCase():'');
  }
  const next=move(s,m);
  return result+(inCheck(next)?(legalMoves(next).length?'+' : '#'):'');
}
export function toFen(s) {
  const rank=[];
  for(let row=0;row<8;row++) {
    let line='',empty=0;
    for(let col=0;col<8;col++) {
      const p=s.b[row*16+col];
      if(p==='.') empty++; else {if(empty)line+=empty;empty=0;line+=p;}
    }
    if(empty)line+=empty;
    rank.push(line);
  }
  const c=(s.castling&1?'K':'')+(s.castling&2?'Q':'')+(s.castling&4?'k':'')+(s.castling&8?'q':'');
  return `${rank.join('/')} ${s.turn===1?'w':'b'} ${c||'-'} ${s.ep<0?'-':square(s.ep)} ${s.half} ${s.full}`;
}
export function positionKey(s) {
  const relevantEP=s.ep>=0 && legalMoves(s).some(m=>m.flag==='ep')?s.ep:-1;
  return s.b.join('') + ':' + s.turn + ':' + s.castling + ':' + relevantEP;
}
function deadPosition(s) {
  const parts=[];
  for(let i=0;i<128;i++)if(on(i)&&s.b[i]!=='.'&&s.b[i].toLowerCase()!=='k')parts.push([s.b[i].toLowerCase(),((i>>4)+(i&7))%2]);
  return parts.length===0 || (parts.length===1&&['n','b'].includes(parts[0][0])) ||
    (parts.every(x=>x[0]==='b')&&new Set(parts.map(x=>x[1])).size===1);
}
export function gameStatus(history) {
  const s=history.at(-1), choices=legalMoves(s), check=inCheck(s), repeats=history.filter(p=>positionKey(p)===positionKey(s)).length;
  if(!choices.length) return {ended:true,kind:check?'checkmate':'stalemate',text:check?'Scacco matto! Vince il '+(s.turn===1?'Nero':'Bianco')+'.':'Patta per stallo.'};
  if(deadPosition(s))return {ended:true,kind:'dead',text:'Patta: materiale insufficiente.'};
  if(s.half>=150||repeats>=5)return {ended:true,kind:'draw',text:s.half>=150?'Patta: regola delle 75 mosse.':'Patta: ripetizione per cinque volte.'};
  return {ended:false,check,claim:repeats>=3?'triplice ripetizione':s.half>=100?'regola delle 50 mosse':'',text:'Muove il '+(s.turn===1?'Bianco':'Nero')+(check?' — sotto scacco!':'')};
}
export function findMove(s,from,to,promotion='') {
  return legalMoves(s).find(m=>m.from===from&&m.to===to&&(m.promotion||'')===promotion) || null;
}
