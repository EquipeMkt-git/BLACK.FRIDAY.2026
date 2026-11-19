/* ==========================================================================
   LIVE 24H · BLACK FRIDAY VITALÍCIA — painel da equipe
   Login com Google (sessão de 30 dias). Abas: Agora, Tela, Agenda, Guia, Equipe.
   ========================================================================== */
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const DEMO = !CFG.API_URL;
  const CHAVE_TOKEN = 'bf26_live24h_sessao';
  const app = document.getElementById('app');
  const BASE = (CFG.SITE && !DEMO) ? CFG.SITE : location.href.replace(/[^/]*([?#].*)?$/, '');
  const LINKS = {
    hFundo: BASE + 'overlay.html?f=h&camada=fundo&c=youtube',
    hFrente: BASE + 'overlay.html?f=h&c=youtube',
    vFundo: BASE + 'overlay.html?f=v&camada=fundo&c=vertical',
    vFrente: BASE + 'overlay.html?f=v&c=vertical'
  };
  const S = { token: null, dados: null, aba: 'agora', erroLogin: '', rascunho: null, sujo: false, guia: 'rotina', timer: null, relogio: null, ocupado: false };

  // ---------------------------------------------------------------- utilidades
  const esc = function (s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  const quando = function (s) { if (!s) return NaN; const t = String(s); return Date.parse(t.length <= 16 ? t + ':00-03:00' : t + '-03:00'); };
  function dataBR(s) {
    const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return esc(s || '');
    return m[3] + '/' + m[2] + (m[4] ? ' ' + m[4] + 'h' + m[5] : '');
  }
  function hms(ms) {
    const neg = ms < 0; ms = Math.abs(ms);
    const h = Math.floor(ms / 3600e3), m = Math.floor(ms % 3600e3 / 60e3), s = Math.floor(ms % 60e3 / 1000);
    return (neg ? '-' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function guardar(v) { try { if (v) localStorage.setItem(CHAVE_TOKEN, JSON.stringify(v)); else localStorage.removeItem(CHAVE_TOKEN); } catch (e) { /* sem armazenamento */ } }
  function lerGuardado() {
    try { const v = JSON.parse(localStorage.getItem(CHAVE_TOKEN) || 'null'); if (v && v.token && (!v.expira || v.expira > Date.now())) return v; } catch (e) { /* nada */ }
    return null;
  }
  function toast(msg, tipo) {
    const t = document.createElement('div');
    t.className = 'toast ' + (tipo || ''); t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, 3400);
  }
  async function copiar(txt) {
    try { await navigator.clipboard.writeText(txt); toast('Copiado.', 'ok'); return; } catch (e) { /* jeito antigo */ }
    const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copiado.', 'ok'); } catch (e) { toast('Não deu para copiar.', 'erro'); }
    ta.remove();
  }
  const caixaCopia = function (txt) { return '<div class="cod"><code>' + esc(txt) + '</code><button class="btn peq" data-copiar="' + esc(txt) + '">Copiar</button></div>'; };

  // ---------------------------------------------------------------- API
  async function api(action, dados) {
    if (DEMO) { await new Promise(function (r) { setTimeout(r, 120); }); return window.DEMO.api(action, dados || {}); }
    const corpo = Object.assign({ action: action, token: S.token }, dados || {});
    const r = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corpo), redirect: 'follow' });
    const j = await r.json();
    if (!j.ok) {
      if (j.sessao) { sair(true); throw new Error('Sua sessão terminou. Entre de novo.'); }
      throw new Error(j.erro || 'Erro no servidor.');
    }
    return j.data;
  }
  async function acao(action, dados, msgOk) {
    if (S.ocupado) return false;
    S.ocupado = true;
    try { S.dados = await api(action, dados); if (msgOk) toast(msgOk, 'ok'); S.ocupado = false; render(); return true; }
    catch (e) { toast(e.message, 'erro'); return false; }
    finally { S.ocupado = false; }
  }

  // ---------------------------------------------------------------- login
  function telaLogin() {
    pararTimers();
    let corpo;
    if (DEMO) {
      corpo = '<div class="aviso dica" style="margin-bottom:14px;text-align:left">Modo demonstração: dados fictícios, nada vai para a live.</div><div class="demo-lista">' +
        window.DEMO.pessoas.map(function (p) { return '<button class="btn" data-demo="' + esc(p.email) + '">' + esc(p.nome) + '</button>'; }).join('') + '</div>';
    } else corpo = '<div id="botao-google"><div class="carregando">Carregando o botão do Google…</div></div>';
    app.innerHTML = '<div class="login-wrap"><div class="login"><img src="img/logo.png" alt="Black Friday Vitalícia">' +
      '<h1>Live 24h</h1><p>Painel da equipe: o que aparece na live, agenda dos blocos e o passo a passo. Entre com o seu e-mail Google da 4blue.</p>' +
      corpo + (S.erroLogin ? '<div class="erro" role="alert">' + esc(S.erroLogin) + '</div>' : '') + '</div></div>';
    if (DEMO) {
      app.querySelectorAll('[data-demo]').forEach(function (b) { b.addEventListener('click', function () { S.token = window.DEMO.entrar(b.getAttribute('data-demo')).token; carregar(); }); });
      return;
    }
    if (!CFG.GOOGLE_CLIENT_ID) { document.getElementById('botao-google').innerHTML = '<p class="erro">Falta o GOOGLE_CLIENT_ID no config.js.</p>'; return; }
    const iniciar = function () {
      google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: entrarGoogle, ux_mode: 'popup', auto_select: false });
      const alvo = document.getElementById('botao-google'); alvo.innerHTML = '';
      google.accounts.id.renderButton(alvo, { theme: 'filled_black', size: 'large', text: 'signin_with', shape: 'pill', locale: 'pt-BR' });
    };
    if (window.google && google.accounts && google.accounts.id) iniciar();
    else {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = iniciar;
      s.onerror = function () { document.getElementById('botao-google').innerHTML = '<p class="erro">Não carregou o login do Google. Confira a internet e recarregue.</p>'; };
      document.head.appendChild(s);
    }
  }
  async function entrarGoogle(resp) {
    app.innerHTML = '<div class="login-wrap"><div class="login"><div class="giro"></div><div class="carregando">Conferindo seu acesso…</div></div></div>';
    try {
      const r = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'login', credential: resp.credential }) }).then(function (x) { return x.json(); });
      if (!r.ok) throw new Error(r.erro || 'Acesso negado.');
      S.token = r.token; S.erroLogin = '';
      const exp = quando(r.expira_em);
      guardar({ token: r.token, expira: isNaN(exp) ? Date.now() + 30 * 864e5 : exp });
      await carregar();
    } catch (e) { S.erroLogin = e.message; telaLogin(); }
  }
  function sair(silencioso) {
    if (!silencioso) { api('sair').catch(function () { }); }
    S.token = null; S.dados = null; S.rascunho = null; S.sujo = false; S.aba = 'agora';
    guardar(null); telaLogin();
  }

  // ---------------------------------------------------------------- carga
  async function carregar() {
    if (!S.dados) app.innerHTML = '<div class="login-wrap"><div class="login"><div class="giro"></div><div class="carregando">Carregando…</div></div></div>';
    try { S.dados = await api('dados'); render(); agendar(); }
    catch (e) { if (S.token) { S.erroLogin = e.message; telaLogin(); } }
  }
  function agendar() {
    pararTimers();
    S.timer = setInterval(async function () {
      if (S.ocupado || S.aba === 'tela' || S.aba === 'equipe' || document.hidden) return;
      try { S.dados = await api('dados'); if (S.aba === 'agora' || S.aba === 'agenda') render(); } catch (e) { /* tenta de novo */ }
    }, 30000);
    S.relogio = setInterval(atualizarRelogios, 1000);
  }
  function pararTimers() { clearInterval(S.timer); clearInterval(S.relogio); }

  // ---------------------------------------------------------------- moldura
  const ABAS = [['agora', 'Agora'], ['tela', 'Tela da live'], ['agenda', 'Agenda'], ['guia', 'Passo a passo'], ['equipe', 'Equipe']];
  function render() {
    const d = S.dados; if (!d) return;
    const admin = d.user.perfil === 'admin';
    const abas = ABAS.filter(function (a) { return a[0] !== 'equipe' || admin; });
    let corpo = '';
    if (S.aba === 'agora') corpo = abaAgora();
    else if (S.aba === 'tela') corpo = abaTela();
    else if (S.aba === 'agenda') corpo = abaAgenda();
    else if (S.aba === 'guia') corpo = abaGuia();
    else if (S.aba === 'equipe' && admin) corpo = abaEquipe();
    const rolagem = window.scrollY;
    app.innerHTML = (DEMO ? '<div class="faixa-demo">MODO DEMONSTRAÇÃO · nada é salvo de verdade</div>' : '') +
      '<header class="topo"><div class="topo-in"><img src="img/logo-texto.png" alt="Black Friday Vitalícia"><b>Live 24h</b>' +
      '<div class="quem"><span>' + esc(d.user.nome) + '</span><button class="btn peq" data-sair>Sair</button></div></div>' +
      '<nav class="abas">' + abas.map(function (a) { return '<button data-aba="' + a[0] + '" class="' + (S.aba === a[0] ? 'on' : '') + '">' + a[1] + (a[0] === 'tela' && S.sujo ? ' •' : '') + '</button>'; }).join('') + '</nav></header>' +
      '<main>' + corpo + '</main>';
    window.scrollTo(0, rolagem);
    ligar();
    if (S.aba === 'tela') enviarPrevia();
    atualizarRelogios();
  }

  // ---------------------------------------------------------------- AGORA
  function statusObs(formato) {
    const ps = (S.dados.pings || []).filter(function (p) { return p.formato === formato; });
    if (!ps.length) return { cls: 'off', txt: 'Nunca visto (OBS ainda não montado ou fechado)' };
    const s = Math.min.apply(null, ps.map(function (p) { return p.visto_ha_s; }));
    if (s < 150) return { cls: 'ok', txt: 'Ligado · visto há ' + s + ' s' };
    if (s < 600) return { cls: 'alerta', txt: 'Atrasado · visto há ' + Math.round(s / 60) + ' min' };
    return { cls: 'off', txt: 'Não visto há ' + Math.round(s / 60) + ' min: confira o PC da live' };
  }
  function abaAgora() {
    const d = S.dados;
    const h = statusObs('h'), v = statusObs('v');
    const modo = (d.tela && d.tela.modo) || 'video';
    const vivo = d.blocos.filter(function (b) { return b.status === 'ao_vivo'; })[0];
    const prox = d.blocos.filter(function (b) { return b.status === 'agendado'; })[0];
    const verticais = d.contas.filter(function (c) { return c.formato === 'v'; });
    let bloco;
    if (vivo) {
      bloco = '<div class="card destaque"><div class="cab-sec"><div><span class="tag ao_vivo">Bloco ao vivo</span><h3 style="margin-top:8px">Começou ' + dataBR(vivo.iniciado_em) + ' · ' + esc(vivo.responsavel) + '</h3></div>' +
        '<div style="text-align:right"><div class="sub" style="font-size:12px">Encerrar até ' + dataBR(vivo.encerrar_ate) + '</div><div class="relogio" data-ate="' + esc(vivo.encerrar_ate) + '">--</div></div></div>' +
        '<p class="sub">Marque cada conta quando ela entrar ao vivo (na ordem do passo a passo):</p><div class="contas">' +
        verticais.map(function (c) {
          const on = vivo.contas_ao_vivo.indexOf(c.id) >= 0;
          return '<button class="conta ' + (on ? 'on' : '') + '" data-conta="' + esc(c.id) + '" data-bloco="' + esc(vivo.id) + '"><span class="ck">' + (on ? '✓' : '') + '</span><span class="plat ' + esc(c.plataforma) + '">' + esc(c.plataforma) + '</span><b>' + esc(c.nome) + '</b><small>' + (on ? 'ao vivo' : 'ainda não') + '</small></button>';
        }).join('') + '</div>' +
        '<div class="linha-btn" style="margin-top:14px"><button class="btn perigo" data-bloco-acao="encerrar" data-id="' + esc(vivo.id) + '">Encerrar bloco</button><span class="sub" style="font-size:13px">Antes, encerre as lives em cada conta e pare os destinos no OBS.</span></div></div>';
    } else {
      bloco = '<div class="card"><h3>Nenhum bloco de Instagram/TikTok ao vivo</h3>' +
        (prox ? '<p class="sub">Próximo: <b>' + dataBR(prox.inicio_previsto) + '</b> · ' + esc(prox.responsavel) + '</p><div class="linha-btn" style="margin-top:10px"><button class="btn ouro" data-bloco-acao="iniciar" data-id="' + esc(prox.id) + '">Iniciar este bloco agora</button><button class="btn" data-ir="guia" data-guia="bloco">Ver o passo a passo</button></div>'
          : '<p class="sub">Nada agendado. Crie um bloco na aba <b>Agenda</b>.</p><div class="linha-btn" style="margin-top:10px"><button class="btn" data-ir="agenda">Abrir agenda</button></div>') + '</div>';
    }
    return '<div class="sec"><div class="cab-sec"><div><h2>Agora</h2><p class="sub">Atualiza sozinho a cada 30 segundos.</p></div></div>' +
      '<div class="grade g2">' +
      '<div class="card"><div class="status"><span class="bola ' + h.cls + '"></span><div><b>OBS horizontal · YouTube 24h</b><small>' + h.txt + '</small></div></div></div>' +
      '<div class="card"><div class="status"><span class="bola ' + v.cls + '"></span><div><b>OBS vertical · Instagram e TikTok</b><small>' + v.txt + '</small></div></div></div>' +
      '</div></div>' +
      '<div class="sec"><div class="grade g2">' +
      '<div class="card"><h3>O que aparece no lugar do vídeo</h3><p class="sub">Use "Só informações" se a aula der problema.</p><div class="modo">' +
      '<button data-modo="video" class="' + (modo === 'video' ? 'on' : '') + '"><b>▶ Aula rodando</b><span>vídeo com a tela por volta</span></button>' +
      '<button data-modo="tela" class="' + (modo === 'tela' ? 'on' : '') + '"><b>▣ Só informações</b><span>sócios e chamadas, sem vídeo</span></button></div>' +
      (!d.tela ? '<p class="ajuda" style="margin-top:8px">A tela ainda usa o conteúdo padrão. Salve uma vez na aba Tela da live para liberar a troca de modo.</p>' : '') + '</div>' +
      bloco + '</div></div>' +
      '<div class="sec"><div class="grade g3">' +
      '<a class="card" style="text-decoration:none;color:inherit" href="overlay.html?f=h&demo=1" target="_blank" rel="noopener"><b>Ver a tela horizontal ↗</b><p class="sub">Como está a live do YouTube agora</p></a>' +
      '<a class="card" style="text-decoration:none;color:inherit" href="overlay.html?f=v&demo=1" target="_blank" rel="noopener"><b>Ver a tela vertical ↗</b><p class="sub">Instagram e TikTok</p></a>' +
      '<a class="card" style="text-decoration:none;color:inherit" href="https://studio.youtube.com/channel/UCrVvD7DtaT7SqL3CJiXOlIQ/livestreaming" target="_blank" rel="noopener"><b>YouTube Studio ↗</b><p class="sub">Saúde da transmissão e chat</p></a>' +
      '</div></div>' +
      '<div class="sec"><h3>Últimas ações</h3><div class="card" style="padding:6px 0"><table class="tabela"><tbody>' +
      ((d.historico || []).map(function (x) { return '<tr><td style="white-space:nowrap">' + dataBR(x.data) + '</td><td>' + esc(x.usuario) + '</td><td>' + esc(x.acao) + '</td><td class="sub">' + esc(x.detalhe) + '</td></tr>'; }).join('') || '<tr><td class="sub">Nada ainda.</td></tr>') +
      '</tbody></table></div></div>';
  }
  function atualizarRelogios() {
    document.querySelectorAll('.relogio[data-ate]').forEach(function (el) {
      const r = quando(el.getAttribute('data-ate')) - Date.now();
      el.textContent = isNaN(r) ? '--' : (r < 0 ? 'passou ' + hms(-r) : hms(r));
      el.classList.toggle('alerta', r < 20 * 60e3 && r >= 0);
      el.classList.toggle('estourou', r < 0);
      if (r < 20 * 60e3 && r > 0 && !el.dataset.avisou) { el.dataset.avisou = '1'; toast('Faltam menos de 20 minutos para encerrar o bloco do Instagram.', 'erro'); }
    });
  }

  // ---------------------------------------------------------------- TELA (editor)
  function rascunho() {
    if (!S.rascunho) {
      const base = clone(window.TELA_PADRAO);
      const t = S.dados.tela;
      S.rascunho = t ? Object.assign(base, clone(t)) : base;
    }
    return S.rascunho;
  }
  const campo = function (rot, chave, valor, extra) {
    return '<label class="campo"><span>' + rot + '</span><input type="text" data-k="' + chave + '" value="' + esc(valor) + '"' + (extra || '') + '></label>';
  };
  function abaTela() {
    const t = rascunho();
    const o = t.oferta || {}, l = t.link || {}, c = t.contagem || {}, a = t.aviso || {};
    const chamadas = (t.chamadas || []).map(function (x, i) {
      return '<div class="lin-ed"><input type="checkbox" class="check" data-lista="chamadas" data-i="' + i + '" data-campo="ativo" ' + (x.ativo !== false ? 'checked' : '') + ' title="Mostrar"><input type="text" data-lista="chamadas" data-i="' + i + '" data-campo="texto" value="' + esc(x.texto) + '" maxlength="140">' +
        '<button class="btn mover" data-mover="chamadas" data-i="' + i + '" data-dir="-1" title="Subir">↑</button><button class="btn mover" data-mover="chamadas" data-i="' + i + '" data-dir="1" title="Descer">↓</button><button class="btn perigo" data-remover="chamadas" data-i="' + i + '" title="Remover">✕</button></div>';
    }).join('');
    const cards = (t.cards || []).map(function (x, i) {
      return '<div class="card-ed"><div class="topo-ed"><input type="checkbox" class="check" data-lista="cards" data-i="' + i + '" data-campo="ativo" ' + (x.ativo !== false ? 'checked' : '') + ' title="Mostrar">' +
        '<input type="text" data-lista="cards" data-i="' + i + '" data-campo="titulo" value="' + esc(x.titulo) + '" maxlength="60" placeholder="Título">' +
        '<button class="btn mover" data-mover="cards" data-i="' + i + '" data-dir="-1">↑</button><button class="btn mover" data-mover="cards" data-i="' + i + '" data-dir="1">↓</button><button class="btn perigo" data-remover="cards" data-i="' + i + '">✕</button></div>' +
        '<div class="grid-2"><label class="campo"><span>Selo</span><input type="text" data-lista="cards" data-i="' + i + '" data-campo="tag" value="' + esc(x.tag) + '" maxlength="30"></label>' +
        '<label class="campo"><span>Rodapé</span><input type="text" data-lista="cards" data-i="' + i + '" data-campo="rodape" value="' + esc(x.rodape) + '" maxlength="50"></label></div>' +
        '<label class="campo" style="margin:0"><span>O que aprende (até 4, um por linha)</span><textarea data-lista="cards" data-i="' + i + '" data-campo="itens" rows="4">' + esc((x.itens || []).join('\n')) + '</textarea></label></div>';
    }).join('');
    return '<div class="cab-sec"><div><h2>Tela da live</h2><p class="sub">Vale para YouTube, Instagram e TikTok. Use só informações da página de vendas: <b>nunca números de vendas</b>.</p></div></div>' +
      '<div class="editor"><div>' +
      '<div class="card"><h3>Oferta</h3><div class="grid-2">' + campo('Linha de cima', 'oferta.topo', o.topo) + campo('Preço riscado (só no YouTube)', 'oferta.de', o.de) +
      campo('Parcela (destaque dourado)', 'oferta.parcela', o.parcela) + campo('À vista', 'oferta.vista', o.vista) + '</div>' + campo('Rodapé (só no YouTube)', 'oferta.rodape', o.rodape) + '</div>' +
      '<div class="card sec"><h3>QR code e link</h3>' + campo('Link do QR (página de vendas)', 'link.url', l.url, ' inputmode="url"') +
      '<div class="grid-2">' + campo('Texto em cima do QR (YouTube)', 'link.textoQR', l.textoQR) + campo('Texto grande na vertical', 'link.textoVertical', l.textoVertical) + '</div>' +
      campo('Endereço curto escrito embaixo', 'link.curto', l.curto) + '<p class="ajuda">No celular ninguém escaneia a própria tela: na vertical o destaque é "Link na bio". Confira se a bio das 4 contas tem o link.</p></div>' +
      '<div class="card sec"><h3>Contagem regressiva</h3><label class="check" style="margin-bottom:10px"><input type="checkbox" data-k="contagem.ativo" ' + (c.ativo ? 'checked' : '') + '> Mostrar contagem</label>' +
      '<div class="grid-2">' + campo('Título', 'contagem.titulo', c.titulo) + '<label class="campo"><span>Termina em (horário de Brasília)</span><input type="datetime-local" data-k="contagem.fim" value="' + esc(String(c.fim || '').slice(0, 16)) + '"></label></div>' +
      campo('Texto quando acabar', 'contagem.aoAcabar', c.aoAcabar) + '</div>' +
      '<div class="card sec"><div class="cab-sec" style="margin-bottom:8px"><h3 style="margin:0">Chamadas que se revezam</h3><button class="btn peq" data-add="chamadas">+ Chamada</button></div><p class="ajuda" style="margin-bottom:10px">Palavra entre *asteriscos* fica dourada. Caixinha desmarcada = não aparece.</p><div class="lista-ed">' + chamadas + '</div></div>' +
      '<div class="card sec"><div class="cab-sec" style="margin-bottom:8px"><h3 style="margin:0">Cartões "o que você vai aprender"</h3><button class="btn peq" data-add="cards">+ Cartão</button></div><div class="lista-ed">' + cards + '</div>' +
      '<label class="campo" style="margin-top:12px"><span>Segundos de cada chamada/cartão</span><input type="number" min="4" max="30" data-k="tempos.palco" value="' + esc((t.tempos || {}).palco || 9) + '"></label></div>' +
      '<div class="card sec"><h3>Faixa que corre embaixo</h3><textarea data-k="faixa" rows="6">' + esc((t.faixa || []).join('\n')) + '</textarea><p class="ajuda">Uma frase por linha.</p></div>' +
      '<div class="card sec"><h3>Aviso piscando por cima do vídeo</h3><label class="check" style="margin-bottom:10px"><input type="checkbox" data-k="aviso.ativo" ' + (a.ativo ? 'checked' : '') + '> Ligar aviso</label>' + campo('Texto do aviso', 'aviso.texto', a.texto) + '</div>' +
      '<div class="card sec"><h3>Rótulo do vídeo</h3>' + campo('Aparece no canto do vídeo', 'rotuloVideo', t.rotuloVideo) + '</div>' +
      '<div class="salvar-barra"><button class="btn ouro" data-salvar-tela>Salvar e publicar na live</button><button class="btn" data-descartar>Descartar mudanças</button>' +
      '<span class="sub">' + (S.sujo ? 'Há mudanças não salvas.' : 'Tudo salvo.') + ' Depois de salvar, muda na live em até 1 minuto.</span></div>' +
      '</div><aside class="previa"><h3>Prévia (com vídeo de exemplo)</h3><div class="moldura h"><iframe id="pv-h" src="overlay.html?f=h&previa=1&demo=1" title="Prévia horizontal"></iframe></div>' +
      '<div class="moldura v"><iframe id="pv-v" src="overlay.html?f=v&previa=1&demo=1" title="Prévia vertical"></iframe></div></aside></div>';
  }
  function setar(obj, caminho, valor) {
    const p = caminho.split('.'); let o = obj;
    for (let i = 0; i < p.length - 1; i++) { if (!o[p[i]] || typeof o[p[i]] !== 'object') o[p[i]] = {}; o = o[p[i]]; }
    o[p[p.length - 1]] = valor;
  }
  let tPrevia = null;
  function enviarPrevia() {
    clearTimeout(tPrevia);
    tPrevia = setTimeout(function () {
      ['pv-h', 'pv-v'].forEach(function (id) {
        const f = document.getElementById(id);
        if (!f) return;
        const manda = function () { try { f.contentWindow.postMessage({ tela: S.rascunho }, location.origin); } catch (e) { /* nada */ } };
        manda(); f.onload = manda;
      });
    }, 250);
  }
  function marcarSujo() {
    if (!S.sujo) { S.sujo = true; const b = document.querySelector('[data-aba="tela"]'); if (b) b.textContent = 'Tela da live •'; const s = document.querySelector('.salvar-barra .sub'); if (s) s.textContent = 'Há mudanças não salvas. Depois de salvar, muda na live em até 1 minuto.'; }
    enviarPrevia();
  }

  // ---------------------------------------------------------------- AGENDA
  function abaAgenda() {
    const d = S.dados;
    const agora = new Date(Date.now() - new Date().getTimezoneOffset() * 60e3).toISOString().slice(0, 16);
    const linhas = d.blocos.map(function (b) {
      let btns = '';
      if (b.status === 'agendado') btns = '<button class="btn peq ouro" data-bloco-acao="iniciar" data-id="' + esc(b.id) + '">Iniciar bloco</button> <button class="btn peq" data-bloco-acao="cancelar" data-id="' + esc(b.id) + '">Cancelar</button>';
      if (b.status === 'ao_vivo') btns = '<button class="btn peq perigo" data-bloco-acao="encerrar" data-id="' + esc(b.id) + '">Encerrar bloco</button>';
      const nomes = b.contas_ao_vivo.map(function (id) { const c = d.contas.filter(function (x) { return x.id === id; })[0]; return c ? c.nome : id; }).join(', ');
      return '<tr><td style="white-space:nowrap"><b>' + dataBR(b.inicio_previsto) + '</b></td><td><span class="tag ' + esc(b.status) + '">' + esc(b.status.replace('_', ' ')) + '</span></td><td>' + esc(b.responsavel) +
        (b.obs ? '<div class="sub" style="font-size:13px">' + esc(b.obs) + '</div>' : '') + '</td><td class="sub" style="font-size:13px">' +
        (b.iniciado_em ? 'Início ' + dataBR(b.iniciado_em) + '<br>' : '') + (b.status === 'ao_vivo' ? 'Encerrar até ' + dataBR(b.encerrar_ate) + '<br>' : '') + (b.encerrado_em ? 'Fim ' + dataBR(b.encerrado_em) + '<br>' : '') + (nomes ? 'Contas: ' + esc(nomes) : '') +
        '</td><td style="white-space:nowrap">' + btns + '</td></tr>';
    }).join('');
    return '<div class="cab-sec"><div><h2>Agenda dos blocos</h2><p class="sub">Cada bloco é uma rodada de lives no Instagram (4 contas) e TikTok, de até 3h50. O YouTube não entra aqui: ele fica 24h.</p></div></div>' +
      '<div class="card"><h3>Novo bloco</h3><div class="grade g3" style="align-items:end">' +
      '<label class="campo" style="margin:0"><span>Começa em</span><input type="datetime-local" id="nb-inicio" value="' + agora + '"></label>' +
      '<label class="campo" style="margin:0"><span>Responsável</span><input type="text" id="nb-resp" value="' + esc(d.user.nome) + '" maxlength="60"></label>' +
      '<label class="campo" style="margin:0"><span>Observação</span><input type="text" id="nb-obs" maxlength="300" placeholder="opcional"></label></div>' +
      '<div class="linha-btn" style="margin-top:12px"><button class="btn ouro" data-novo-bloco>Agendar bloco</button></div>' +
      '<p class="ajuda">Sugestão de grade: 08h, 12h, 16h e 20h (cada bloco cobre até 3h50).</p></div>' +
      '<div class="card sec" style="padding:6px 0;overflow-x:auto"><table class="tabela"><thead><tr><th>Início</th><th>Status</th><th>Responsável</th><th>Detalhes</th><th></th></tr></thead><tbody>' +
      (linhas || '<tr><td colspan="5" class="sub">Nenhum bloco nos últimos 2 dias.</td></tr>') + '</tbody></table></div>';
  }

  // ---------------------------------------------------------------- GUIA
  function abaGuia() {
    const secs = window.GUIA(LINKS, caixaCopia);
    const atual = secs.filter(function (s) { return s.id === S.guia; })[0] || secs[0];
    return '<div class="cab-sec"><div><h2>Passo a passo</h2><p class="sub">Leia a seção inteira antes de começar. Na dúvida, não mexa: chame a coordenação.</p></div></div>' +
      '<div class="guia"><nav>' + secs.map(function (s) { return '<button data-guia="' + s.id + '" class="' + (s.id === atual.id ? 'on' : '') + '">' + esc(s.titulo) + '<small>' + esc(s.sub) + '</small></button>'; }).join('') + '</nav>' +
      '<div>' + atual.html + '</div></div>';
  }

  // ---------------------------------------------------------------- EQUIPE (admin)
  function abaEquipe() {
    const d = S.dados;
    const us = (d.usuarios || []).map(function (u) {
      return '<tr><td><b>' + esc(u.nome) + '</b><div class="sub" style="font-size:13px">' + esc(u.email) + '</div></td><td>' + (u.perfil === 'admin' ? 'Coordenação' : 'Equipe') + '</td><td>' + (u.ativo === 'SIM' ? 'Ativo' : '<span class="sub">Sem acesso</span>') + '</td>' +
        '<td style="white-space:nowrap"><button class="btn peq" data-usuario-ativo="' + esc(u.email) + '">' + (u.ativo === 'SIM' ? 'Tirar acesso' : 'Dar acesso') + '</button></td></tr>';
    }).join('');
    const contas = d.contas.map(function (c, i) {
      return '<tr><td><span class="plat ' + esc(c.plataforma) + '">' + esc(c.plataforma) + '</span></td><td><input type="text" data-conta-i="' + i + '" data-conta-campo="nome" value="' + esc(c.nome) + '"></td><td><input type="text" data-conta-i="' + i + '" data-conta-campo="url" value="' + esc(c.url) + '"></td></tr>';
    }).join('');
    return '<div class="cab-sec"><div><h2>Equipe e contas</h2><p class="sub">Só a coordenação vê esta aba.</p></div></div>' +
      '<div class="card"><h3>Adicionar pessoa</h3><div class="grade g3" style="align-items:end">' +
      '<label class="campo" style="margin:0"><span>Nome</span><input type="text" id="nu-nome" maxlength="60"></label>' +
      '<label class="campo" style="margin:0"><span>E-mail Google</span><input type="email" id="nu-email" placeholder="nome@4blue.com.br"></label>' +
      '<label class="campo" style="margin:0"><span>Perfil</span><select id="nu-perfil"><option value="equipe">Equipe (BC)</option><option value="admin">Coordenação</option></select></label></div>' +
      '<div class="linha-btn" style="margin-top:12px"><button class="btn ouro" data-novo-usuario>Salvar pessoa</button></div></div>' +
      '<div class="card sec" style="padding:6px 0;overflow-x:auto"><table class="tabela"><thead><tr><th>Pessoa</th><th>Perfil</th><th>Acesso</th><th></th></tr></thead><tbody>' + us + '</tbody></table></div>' +
      '<div class="card sec"><h3>Contas das lives</h3><div style="overflow-x:auto"><table class="tabela"><thead><tr><th></th><th>Nome</th><th>Link</th></tr></thead><tbody>' + contas + '</tbody></table></div>' +
      '<div class="linha-btn" style="margin-top:12px"><button class="btn" data-salvar-contas>Salvar contas</button></div></div>';
  }

  // ---------------------------------------------------------------- eventos
  function ligar() {
    app.querySelectorAll('[data-aba]').forEach(function (b) {
      b.addEventListener('click', function () {
        const nova = b.getAttribute('data-aba');
        if (S.aba === 'tela' && nova !== 'tela' && S.sujo && !confirm('Há mudanças na tela que não foram salvas. Sair mesmo assim? (elas ficam guardadas até você recarregar a página)')) return;
        S.aba = nova; render(); window.scrollTo(0, 0);
      });
    });
    app.querySelectorAll('[data-sair]').forEach(function (b) { b.addEventListener('click', function () { sair(false); }); });
    app.querySelectorAll('[data-copiar]').forEach(function (b) { b.addEventListener('click', function () { copiar(b.getAttribute('data-copiar')); }); });
    app.querySelectorAll('[data-ir]').forEach(function (b) { b.addEventListener('click', function () { S.aba = b.getAttribute('data-ir'); if (b.getAttribute('data-guia')) S.guia = b.getAttribute('data-guia'); render(); window.scrollTo(0, 0); }); });
    app.querySelectorAll('nav [data-guia], .guia [data-guia]').forEach(function (b) { b.addEventListener('click', function () { S.guia = b.getAttribute('data-guia'); render(); }); });

    app.querySelectorAll('[data-modo]').forEach(function (b) {
      b.addEventListener('click', function () {
        const m = b.getAttribute('data-modo');
        if ((S.dados.tela && S.dados.tela.modo) === m) return;
        if (m === 'tela' && !confirm('Trocar a live para "Só informações"? O vídeo da aula some de todas as lives em até 1 minuto.')) return;
        acao('tela.modo', { modo: m }, m === 'tela' ? 'Modo só informações ligado.' : 'Aula voltou a rodar.');
      });
    });
    app.querySelectorAll('[data-bloco-acao]').forEach(function (b) {
      b.addEventListener('click', function () {
        const a = b.getAttribute('data-bloco-acao');
        if (a === 'encerrar' && !confirm('Encerrar o bloco? Confirme que você já encerrou as lives em cada conta e parou os destinos no OBS.')) return;
        if (a === 'cancelar' && !confirm('Cancelar este bloco agendado?')) return;
        acao('bloco.acao', { id: b.getAttribute('data-id'), acao: a }, { iniciar: 'Bloco iniciado: o relógio de 3h50 começou.', encerrar: 'Bloco encerrado.', cancelar: 'Bloco cancelado.' }[a]);
      });
    });
    app.querySelectorAll('[data-conta]').forEach(function (b) {
      b.addEventListener('click', function () { acao('bloco.acao', { id: b.getAttribute('data-bloco'), acao: 'conta', conta: b.getAttribute('data-conta') }); });
    });
    const nb = app.querySelector('[data-novo-bloco]');
    if (nb) nb.addEventListener('click', function () {
      acao('bloco.criar', { bloco: { inicio_previsto: document.getElementById('nb-inicio').value, responsavel: document.getElementById('nb-resp').value, obs: document.getElementById('nb-obs').value } }, 'Bloco agendado.');
    });

    // editor da tela
    if (S.aba === 'tela') {
      const t = rascunho();
      app.querySelectorAll('[data-k]').forEach(function (el) {
        const ev = el.type === 'checkbox' ? 'change' : 'input';
        el.addEventListener(ev, function () {
          const k = el.getAttribute('data-k');
          let v = el.type === 'checkbox' ? el.checked : el.value;
          if (k === 'faixa') v = el.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
          if (k === 'tempos.palco') v = Number(el.value) || 9;
          if (k === 'contagem.fim' && v) v = v.slice(0, 16) + ':00';
          setar(t, k, v); marcarSujo();
        });
      });
      app.querySelectorAll('[data-lista]').forEach(function (el) {
        const ev = el.type === 'checkbox' ? 'change' : 'input';
        el.addEventListener(ev, function () {
          const item = t[el.getAttribute('data-lista')][Number(el.getAttribute('data-i'))];
          const c = el.getAttribute('data-campo');
          item[c] = el.type === 'checkbox' ? el.checked : (c === 'itens' ? el.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4) : el.value);
          marcarSujo();
        });
      });
      app.querySelectorAll('[data-add]').forEach(function (b) {
        b.addEventListener('click', function () {
          const l = b.getAttribute('data-add');
          t[l] = t[l] || [];
          t[l].push(l === 'chamadas' ? { texto: 'Nova chamada', ativo: true } : { tag: 'Treinamento', titulo: 'Novo cartão', itens: [], rodape: '', ativo: true });
          S.sujo = true; render();
        });
      });
      app.querySelectorAll('[data-remover]').forEach(function (b) {
        b.addEventListener('click', function () { t[b.getAttribute('data-remover')].splice(Number(b.getAttribute('data-i')), 1); S.sujo = true; render(); });
      });
      app.querySelectorAll('[data-mover]').forEach(function (b) {
        b.addEventListener('click', function () {
          const l = t[b.getAttribute('data-mover')], i = Number(b.getAttribute('data-i')), j = i + Number(b.getAttribute('data-dir'));
          if (j < 0 || j >= l.length) return;
          const x = l[i]; l[i] = l[j]; l[j] = x; S.sujo = true; render();
        });
      });
      const sv = app.querySelector('[data-salvar-tela]');
      if (sv) sv.addEventListener('click', async function () {
        if (!confirm('Publicar estas mudanças em todas as lives (YouTube, Instagram e TikTok)?')) return;
        S.sujo = false;
        const ok = await acao('tela.salvar', { tela: t }, 'Salvo. A live muda em até 1 minuto.');
        if (ok) { S.rascunho = null; render(); } else { S.sujo = true; }
      });
      const ds = app.querySelector('[data-descartar]');
      if (ds) ds.addEventListener('click', function () { if (!S.sujo || confirm('Descartar as mudanças não salvas?')) { S.rascunho = null; S.sujo = false; render(); } });
    }

    // equipe
    const nu = app.querySelector('[data-novo-usuario]');
    if (nu) nu.addEventListener('click', function () {
      acao('admin.usuario.salvar', { usuario: { nome: document.getElementById('nu-nome').value, email: document.getElementById('nu-email').value, perfil: document.getElementById('nu-perfil').value, ativo: 'SIM' } }, 'Pessoa salva.');
    });
    app.querySelectorAll('[data-usuario-ativo]').forEach(function (b) {
      b.addEventListener('click', function () {
        const u = S.dados.usuarios.filter(function (x) { return x.email === b.getAttribute('data-usuario-ativo'); })[0];
        acao('admin.usuario.salvar', { usuario: { nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo === 'SIM' ? 'NAO' : 'SIM' } }, 'Acesso atualizado.');
      });
    });
    const sc = app.querySelector('[data-salvar-contas]');
    if (sc) sc.addEventListener('click', function () {
      const cs = clone(S.dados.contas);
      app.querySelectorAll('[data-conta-i]').forEach(function (el) { cs[Number(el.getAttribute('data-conta-i'))][el.getAttribute('data-conta-campo')] = el.value.trim(); });
      acao('admin.contas.salvar', { contas: cs }, 'Contas salvas.');
    });
  }

  addEventListener('beforeunload', function (e) { if (S.sujo) { e.preventDefault(); e.returnValue = ''; } });

  // ---------------------------------------------------------------- início
  const g = lerGuardado();
  if (g && !DEMO) { S.token = g.token; carregar(); } else telaLogin();
})();
