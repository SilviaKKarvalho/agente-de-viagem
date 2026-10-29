// ===== FRONT-END DO CHAT =====
// O prompt e a chave da Groq ficam na função do Netlify (netlify/functions/chat.js)

const $ = id => document.getElementById(id);
const msgs = $('msgs'), form = $('f'), inp = $('q'), btn = $('b');
const hist = [];
let busy = false;

const SUG = ["Quero conhecer Portugal","Preciso de visto para o Japão?","Viagem barata para o Nordeste","Não sei para onde viajar"];
SUG.forEach(t => { const c = document.createElement('button'); c.type='button'; c.className='chip'; c.textContent=t; c.onclick=()=>send(t); $('chips').appendChild(c); });

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function render(t){
  const lines = esc(t).split('\n'); let out='', inList=false;
  for (let l of lines){
    l = l.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    const li = l.match(/^\s*[-•*]\s+(.*)/);
    if (li){ if(!inList){out+='<ul>';inList=true;} out+='<li>'+li[1]+'</li>'; }
    else { if(inList){out+='</ul>';inList=false;} const h=l.replace(/^#+\s*/,''); if(h.trim()) out+='<p>'+h+'</p>'; }
  }
  return out + (inList?'</ul>':'');
}
function add(role, text){
  const d = document.createElement('div'); d.className='m '+role;
  d.innerHTML = role==='bot' ? render(text) : '<p>'+esc(text)+'</p>';
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
}

add('bot', "Olá! 👋 Eu sou o seu agente de turismo. Posso ajudar com destinos, pontos turísticos, vistos, hospedagem, voos e ônibus.\nVocê já sabe qual **país ou cidade** deseja conhecer?");

async function send(text){
  text = (text||'').trim(); if(!text || busy) return;
  busy = true; btn.disabled = true; inp.value=''; $('chips').style.display='none';
  add('user', text); hist.push({role:'user', content:text});
  const bot = add('bot', '✈️ Pesquisando as melhores opções...');
  try{
    const r = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({messages: hist})
    });
    const data = await r.json();
    if(!r.ok) throw new Error(data.erro || 'Erro');
    bot.innerHTML = render(data.resposta);
    hist.push({role:'assistant', content:data.resposta});
  }catch(e){
    hist.pop();
    bot.innerHTML = render('Não consegui responder agora. 😊\nDetalhe técnico: ' + e.message);
    console.error(e);
  }
  busy = false; btn.disabled = false; inp.focus(); msgs.scrollTop = msgs.scrollHeight;
}
form.addEventListener('submit', e => { e.preventDefault(); send(inp.value); });
