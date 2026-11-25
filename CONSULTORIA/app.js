/* ==========================================================================
   CONSULTORIA · BLACK FRIDAY 2026 — site
   Login com Google (sessão de 30 dias), vendas por pessoa e ranking.
   ========================================================================== */
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const DEMO = !CFG.API_URL;
  const CHAVE_TOKEN = 'bf26_consultoria_sessao';
  const app = document.getElementById('app');
  const sheet = document.getElementById('sheet');
  const S = { token: null, dados: null, aba: 'inicio', ordem: 'vendas', filtroPessoa: '', busca: '', mostrarTodas: false, erroLogin: '', timer: null };

  // ---------------------------------------------------------------- utilidades
  const esc = function (s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const brl = function (n) { return (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); };
  const primeiro = function (n) { return String(n || '').trim().split(/\s+/)[0] || ''; };
  const iniciais = function (n) { const p = String(n || '').trim().split(/\s+/); return ((p[0] || '')[0] || '') + ((p.length > 1 ? p[p.length - 1][0] : '') || ''); };
  function dataBR(s) {
    if (!s) return '';
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return esc(s);
    return m[3] + '/' + m[2] + (m[4] ? ' ' + m[4] + 'h' + m[5] : '');
  }
  function guardar(v) { try { if (v) localStorage.setItem(CHAVE_TOKEN, JSON.stringify(v)); else localStorage.removeItem(CHAVE_TOKEN); } catch (e) { /* sem armazenamento */ } }
  function lerGuardado() {
    try {
      const v = JSON.parse(localStorage.getItem(CHAVE_TOKEN) || 'null');
      if (v && v.token && (!v.expira || v.expira > Date.now())) return v;
    } catch (e) { /* nada */ }
    return null;
  }
  function toast(msg, tipo) {
    const t = document.createElement('div');
    t.className = 'toast ' + (tipo || '');
    t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  async function copiar(txt) {
    try { await navigator.clipboard.writeText(txt); toast('Link copiado.', 'ok'); return; } catch (e) { /* tenta o jeito antigo */ }
    const ta = document.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Link copiado.', 'ok'); } catch (e) { toast('Não deu para copiar. Segure no link e copie.', 'erro'); }
    ta.remove();
  }

  const ICO = {
    marca: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#E8B931" aria-hidden="true"><path d="M3 21V12h4v9zm7 0V4h4v17zm7 0v-7h4v7z"/></svg>',
    copiar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.1z"/></svg>',
    sair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>'
  };

  // ---------------------------------------------------------------- API
  async function api(action, dados) {
    if (DEMO) {
      await new Promise(function (r) { setTimeout(r, 150); });
      return window.DEMO.api(action, dados || {});
    }
    const corpo = Object.assign({ action: action, token: S.token }, dados || {});
    const r = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corpo), redirect: 'follow' });
    const j = await r.json();
    if (!j.ok) {
      if (j.sessao) { sair(true); throw new Error('Sua sessão terminou. Entre de novo.'); }
      throw new Error(j.erro || 'Erro no servidor.');
    }
    return j.data;
  }

  // ---------------------------------------------------------------- login
  function telaLogin() {
    pararTimer();
    let corpo;
    if (DEMO) {
      corpo = '<div class="aviso demo" style="margin-bottom:14px;text-align:left">Modo demonstração: dados fictícios, nada é salvo. Escolha com quem entrar.</div><div class="demo-lista">' +
        window.DEMO.pessoas.slice(-1).concat(window.DEMO.pessoas.slice(0, 3)).map(function (p) {
          return '<button class="btn" data-demo="' + esc(p.email) + '">' + esc(p.nome) + ' <span class="mini">' + (p.perfil === 'admin' ? 'admin' : p.codigo) + '</span></button>';
        }).join('') + '</div>';
    } else {
      corpo = '<div id="botao-google"><div class="carregando">Carregando o botão do Google…</div></div>';
    }
    app.innerHTML = '<div class="login-wrap"><div class="login">' +
      '<div class="marca-ico">' + ICO.marca + '</div>' +
      '<div class="tag-black txt-ouro">Black Friday 2026</div>' +
      '<h1>Consultoria</h1>' +
      '<p>Suas vendas e o ranking do time. Entre com o e-mail Google que você passou para a coordenação.</p>' +
      corpo + (S.erroLogin ? '<div class="erro" role="alert">' + esc(S.erroLogin) + '</div>' : '') +
      '</div></div>';

    if (DEMO) {
      app.querySelectorAll('[data-demo]').forEach(function (b) {
        b.addEventListener('click', function () { const r = window.DEMO.entrar(b.getAttribute('data-demo')); S.token = r.token; carregar(); });
      });
      return;
    }
    if (!CFG.GOOGLE_CLIENT_ID) { document.getElementById('botao-google').innerHTML = '<p class="erro">Falta o GOOGLE_CLIENT_ID no config.js.</p>'; return; }
    const iniciar = function () {
      google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: entrarGoogle, ux_mode: 'popup', auto_select: false });
      const alvo = document.getElementById('botao-google');
      alvo.innerHTML = '';
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
      const exp = Date.parse(String(r.expira_em || '').replace(/(\d)$/, '$1-03:00'));
      guardar({ token: r.token, expira: isNaN(exp) ? Date.now() + 30 * 864e5 : exp });
      await carregar();
    } catch (e) { S.erroLogin = e.message; telaLogin(); }
  }

  function sair(silencioso) {
    if (!silencioso && S.token && !DEMO) { api('sair').catch(function () { }); }
    if (DEMO && !silencioso) { try { window.DEMO.api('sair'); } catch (e) { /* nada */ } }
    S.token = null; S.dados = null; S.aba = 'inicio';
    guardar(null);
    telaLogin();
  }

  // ---------------------------------------------------------------- carga
  async function carregar() {
    if (!S.dados) app.innerHTML = '<div class="login-wrap"><div class="login"><div class="giro"></div><div class="carregando">Carregando as vendas…</div></div></div>';
    try {
      S.dados = await api('dados');
      render();
      agendar();
    } catch (e) {
      if (!S.token) return;
      if (S.dados) { toast(e.message, 'erro'); return; }
      S.erroLogin = e.message; telaLogin();
    }
  }
  function pararTimer() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }
  function agendar() {
    pararTimer();
    const seg = Math.max(30, Number(CFG.ATUALIZAR_SEGUNDOS) || 60);
    S.timer = setInterval(function () {
      if (document.hidden || sheet.innerHTML) return;
      api('dados').then(function (d) { S.dados = d; render(true); }).catch(function () { });
    }, seg * 1000);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && S.token && S.dados) api('dados').then(function (d) { S.dados = d; render(true); }).catch(function () { });
  });

  // ---------------------------------------------------------------- telas
  function render(silencioso) {
    const d = S.dados; if (!d) return;
    const admin = d.user.perfil === 'admin';
    const scroll = window.scrollY;
    const abas = admin ? [['inicio', 'Ranking'], ['funil', 'Funil por link'], ['vendas', 'Vendas'], ['semdono', 'Sem consultor'], ['pessoas', 'Pessoas']] : [];
    if (d.user.codigo && admin) abas.splice(1, 0, ['meu', 'Meus links']);
    const semDono = admin ? (d.vendas || []).filter(function (v) { return v.ativa && !v.codigo && v.da_pagina; }).length : 0;

    let corpo = '';
    if (!admin || S.aba === 'meu') corpo = telaPessoa(d);
    else if (S.aba === 'funil') corpo = telaFunil(d);
    else if (S.aba === 'vendas') corpo = telaVendas(d);
    else if (S.aba === 'semdono') corpo = telaSemDono(d);
    else if (S.aba === 'pessoas') corpo = telaPessoas(d);
    else corpo = telaRankingAdmin(d);

    app.innerHTML =
      '<header class="topo"><div class="topo-in">' +
        '<div class="marca"><div class="marca-ico">' + ICO.marca + '</div><div><b>Consultoria</b><span class="txt-ouro">Black Friday 2026</span></div></div>' +
        '<div class="esp"></div>' +
        '<div class="quem"><b>' + esc(d.user.nome) + '</b><span>' + (admin ? 'Coordenação' : 'Consultoria') + '</span></div>' +
        '<button class="btn ico" data-sair title="Sair" aria-label="Sair">' + ICO.sair + '</button>' +
      '</div>' +
      (abas.length ? '<nav class="abas" role="tablist">' + abas.map(function (a) {
        return '<button class="aba" role="tab" data-aba="' + a[0] + '" aria-selected="' + (S.aba === a[0]) + '">' + a[1] +
          (a[0] === 'semdono' && semDono ? '<span class="cont">' + semDono + '</span>' : '') + '</button>';
      }).join('') + '</nav>' : '') +
      '</header><main>' + (DEMO ? '<div class="aviso demo">Modo demonstração: dados fictícios. Nada é salvo.</div>' : '') + corpo +
      '<p class="atualizado">Atualiza sozinho a cada minuto · última leitura ' + dataBR(d.hora) + '</p></main>';

    ligar();
    if (silencioso) window.scrollTo(0, scroll);
  }

  function meuRank(d) { return (d.ranking || []).filter(function (r) { return r.codigo === d.user.codigo; })[0]; }

  function telaPessoa(d) {
    const eu = meuRank(d) || { vendas: 0, faturamento: 0, posicao: null };
    const total = (d.ranking || []).length;
    const lider = (d.ranking || [])[0];
    let frase;
    if (!eu.vendas) frase = 'Sua primeira venda coloca você no ranking. Mande o seu link!';
    else if (eu.posicao === 1) frase = 'Você está na frente. Segura essa liderança!';
    else {
      const acima = d.ranking.filter(function (r) { return r.posicao && r.posicao < eu.posicao; }).pop();
      const falta = acima ? acima.vendas - eu.vendas : 0;
      frase = acima ? (falta <= 0 ? 'Empatado em vendas com ' + esc(primeiro(acima.nome)) + ': o faturamento desempata.' : (falta > 1 ? 'Faltam ' : 'Falta ') + falta + ' venda' + (falta > 1 ? 's' : '') + ' para passar ' + esc(primeiro(acima.nome)) + '.') : '';
    }
    const heroi = '<section class="card heroi">' +
      '<div class="ola">Olá, ' + esc(primeiro(d.user.nome)) + '</div>' +
      '<div class="pos txt-ouro num">' + (eu.posicao ? eu.posicao + 'º <small>de ' + total + '</small>' : '—') + '</div>' +
      '<div class="frase">' + frase + '</div>' +
      '<div class="stats tres">' +
        '<div class="stat"><span>Minhas vendas</span><b class="num">' + eu.vendas + '</b></div>' +
        '<div class="stat"><span>Meu faturamento</span><b class="num">' + brl(eu.faturamento) + '</b></div>' +
        '<div class="stat"><span>Time todo</span><b class="num">' + brl(d.time.faturamento) + '</b><span class="num">' + d.time.vendas + ' venda' + (d.time.vendas === 1 ? '' : 's') + '</span></div>' +
      '</div></section>';

    const L = d.links || {};
    const item = function (k, tit, sub, prin) {
      if (!L[k]) return '';
      const msg = encodeURIComponent(L[k]);
      return '<div class="link' + (prin ? ' prin' : '') + '"><div class="txt"><b>' + tit + '</b><span>' + sub + '</span></div><div class="bts">' +
        '<button class="btn peq" data-copiar="' + esc(L[k]) + '">' + ICO.copiar + 'Copiar</button>' +
        '<a class="btn peq ico" href="https://wa.me/?text=' + msg + '" target="_blank" rel="noopener" title="Enviar no WhatsApp" aria-label="Enviar ' + tit + ' no WhatsApp">' + ICO.zap + '</a>' +
        '</div></div>';
    };
    const links = '<section class="card"><h2>Seus links <small>toda venda por eles conta para você</small></h2><div class="links">' +
      item('pagina', 'Página de vendas', 'O principal. Vale por 30 dias no celular de quem clicar.', true) +
      item('checkout', 'Checkout direto · R$ 2.897', 'Para quem já decidiu comprar.') +
      item('desconto_1997', 'Desconto cliente · R$ 1.997', 'Só Mambers, Iluministas e Black GFL 2024.') +
      item('desconto_997', 'Desconto Black 2025 · R$ 997', 'Só quem comprou na Black 2025.') +
      '</div><p class="mini" style="margin-top:10px">Se o cliente comprar por outro link (anúncio, e-mail), a venda não aparece aqui. Avise a coordenação com o e-mail da compra para ela atribuir.</p></section>';

    const minhas = d.minhas || [];
    const lista = '<section class="card"><h2>Minhas vendas <small>' + minhas.filter(function (v) { return v.ativa; }).length + ' ativas</small></h2>' +
      (minhas.length ? '<ul class="vendas-lista">' + minhas.map(function (v) {
        return '<li class="' + (v.ativa ? '' : 'reemb') + '"><div><b>' + esc(v.nome || 'Comprador') + '</b><div class="sub">' + dataBR(v.data) + ' · ' + esc(ofertaCurta(v.oferta)) +
          (v.origem === 'manual' ? ' · <span class="tag manual">atribuída</span>' : '') + (v.ativa ? '' : ' · <span class="tag reemb">reembolsada</span>') + '</div></div>' +
          '<div class="vl num">' + brl(v.valor) + '</div></li>';
      }).join('') + '</ul>' : '<div class="vazio-msg">Nenhuma venda ainda. Elas aparecem aqui segundos depois da aprovação na Hotmart.</div>') + '</section>';

    return heroi + '<div class="grade-2"><div style="display:grid;gap:16px;min-width:0">' + links + lista + '</div>' + blocoRanking(d) + '</div>';
  }

  function ofertaCurta(o) {
    const s = String(o || '');
    if (/997\)/.test(s) && !/1\.997/.test(s)) return 'Upgrade Black 2025';
    if (/1\.997/.test(s)) return 'Desconto cliente';
    if (/2\.897/.test(s)) return 'Black Friday Vitalícia';
    return s.replace(/\s*\(R\$[^)]*\)/, '') || 'Combo Vitalício';
  }

  function ordenado(d) {
    const l = (d.ranking || []).slice();
    if (S.ordem === 'faturamento') l.sort(function (a, b) { return b.faturamento - a.faturamento || b.vendas - a.vendas || a.nome.localeCompare(b.nome); });
    return l;
  }

  function blocoRanking(d) {
    const l = ordenado(d);
    const chave = S.ordem;
    const max = Math.max(1, ...l.map(function (r) { return Number(r[chave]) || 0; }));
    let pos = 0, ant = null;
    const comPos = l.map(function (r, i) {
      const v = r[chave];
      if (!v) return Object.assign({}, r, { p: null });
      const k = S.ordem === 'vendas' ? r.vendas + '|' + r.faturamento : String(r.faturamento);
      if (k !== ant) { pos = i + 1; ant = k; }
      return Object.assign({}, r, { p: pos });
    });
    const top = comPos.filter(function (r) { return r.p; }).slice(0, 3);
    const deg = function (r, n) {
      if (!r) return '<div class="degrau vazio p' + n + '"><div class="av"></div><div class="base"></div></div>';
      return '<div class="degrau p' + n + '"><div class="av">' + esc(iniciais(r.nome).toUpperCase()) + '</div><div class="nm">' + esc(primeiro(r.nome)) + '</div>' +
        '<div class="vl num">' + (chave === 'vendas' ? r.vendas + ' venda' + (r.vendas > 1 ? 's' : '') : brl(r.faturamento)) + '</div><div class="base">' + r.p + 'º</div></div>';
    };
    const podio = top.length ? '<div class="podio">' + deg(top[1], 2) + deg(top[0], 1) + deg(top[2], 3) + '</div>' : '';
    const linhas = comPos.map(function (r) {
      const eu = r.codigo && r.codigo === d.user.codigo;
      const pct = Math.round((Number(r[chave]) || 0) / max * 100);
      return '<li class="' + (eu ? 'eu ' : '') + (r.p && r.p <= 3 ? 'top' : '') + '"><div class="p num">' + (r.p ? r.p + 'º' : '–') + '</div>' +
        '<div style="min-width:0"><div class="nm">' + esc(r.nome) + (eu ? ' <span class="mini">(você)</span>' : '') + '</div><div class="barra"><i style="width:' + pct + '%"></i></div></div>' +
        '<div class="vl num"><b>' + r.vendas + '</b><span>' + brl(r.faturamento) + '</span></div></li>';
    }).join('');
    return '<section class="card"><h2>Ranking <small>vendas aprovadas, sem reembolsos</small>' +
      '<div class="ordem acao" role="group" aria-label="Ordenar ranking"><button data-ordem="vendas" aria-pressed="' + (S.ordem === 'vendas') + '">Vendas</button><button data-ordem="faturamento" aria-pressed="' + (S.ordem === 'faturamento') + '">Faturamento</button></div></h2>' +
      podio + (linhas ? '<ul class="rank">' + linhas + '</ul>' : '<div class="vazio-msg">Ninguém cadastrado ainda.</div>') + '</section>';
  }

  function telaRankingAdmin(d) {
    const vs = d.vendas || [];
    const semDono = vs.filter(function (v) { return v.ativa && !v.codigo && v.da_pagina; });
    const manuais = vs.filter(function (v) { return v.ativa && v.origem === 'manual'; }).length;
    const comVenda = (d.ranking || []).filter(function (r) { return r.vendas; }).length;
    return '<section class="card heroi"><div class="ola">Time da consultoria</div>' +
      '<div class="pos txt-ouro num">' + brl(d.time.faturamento) + '</div>' +
      '<div class="frase">' + d.time.vendas + ' venda' + (d.time.vendas === 1 ? '' : 's') + ' com dono · ' + comVenda + ' de ' + (d.ranking || []).length + ' pessoas já venderam</div>' +
      '<div class="stats quatro">' +
        '<div class="stat"><span>Vendas do time</span><b class="num">' + d.time.vendas + '</b></div>' +
        '<div class="stat"><span>Ticket médio</span><b class="num">' + brl(d.time.vendas ? d.time.faturamento / d.time.vendas : 0) + '</b></div>' +
        '<div class="stat"><span>Atribuídas à mão</span><b class="num">' + manuais + '</b></div>' +
        '<div class="stat"><span>Da página sem código</span><b class="num">' + semDono.length + '</b></div>' +
      '</div></section>' + blocoRanking(d);
  }

  // ---------------------------------------------------------------- funil por link (admin)
  const pct = function (a, b) { return b ? (Math.round(a / b * 1000) / 10).toLocaleString('pt-BR') + '%' : '—'; };
  const nfmt = function (n) { return (Number(n) || 0).toLocaleString('pt-BR'); };

  function telaFunil(d) {
    if (d.funil_erro) return '<section class="card"><h2>Funil por link</h2><div class="aviso">Não deu para ler os acessos agora: ' + esc(d.funil_erro) + '</div></section>';
    const f = d.funil || { linhas: [] };
    const ls = f.linhas.slice();
    const chave = S.ordemFunil || 'acessos';
    ls.sort(function (a, b) { return (a.sem_codigo ? 1 : 0) - (b.sem_codigo ? 1 : 0) || (Number(b[chave]) || 0) - (Number(a[chave]) || 0) || b.vendas - a.vendas || a.nome.localeCompare(b.nome); });
    const pessoas = ls.filter(function (l) { return !l.sem_codigo; });
    const soma = function (k) { return pessoas.reduce(function (s, l) { return s + (Number(l[k]) || 0); }, 0); };
    const T = { acessos: soma('acessos'), visitantes: soma('visitantes'), iniciaram: soma('iniciaram'), vendas: soma('vendas'), clicaram_sem_comprar: soma('clicaram_sem_comprar'), pararam_pagamento: soma('pararam_pagamento') };

    const hotTxt = function (h) {
      const p = [];
      if (h.aguardando) p.push(h.aguardando + ' Pix/boleto sem pagar');
      if (h.recusado) p.push(h.recusado + ' recusado' + (h.recusado > 1 ? 's' : ''));
      if (h.expirou) p.push(h.expirou + ' expirou');
      if (h.abandonou) p.push(h.abandonou + ' abandonou carrinho');
      return p.join(' · ');
    };
    const th = function (k, t, n) { return '<th class="' + (n ? 'n ' : '') + 'ord" data-ordem-funil="' + k + '" aria-sort="' + (chave === k ? 'descending' : 'none') + '">' + t + (chave === k ? ' ↓' : '') + '</th>'; };
    const linha = function (l) {
      const h = hotTxt(l.hotmart || {});
      return '<tr' + (l.sem_codigo ? ' class="muted"' : '') + '><td>' + esc(l.nome) + '<span class="sub">' + (l.sem_codigo ? 'quem abriu a página sem link de ninguém' : '<code>' + esc(l.codigo) + '</code>' + (l.ultimo ? ' · último acesso ' + dataBR(l.ultimo) : '')) + '</span></td>' +
        '<td class="n num">' + nfmt(l.acessos) + '<span class="sub">' + nfmt(l.visitantes) + ' pessoa' + (l.visitantes === 1 ? '' : 's') + '</span></td>' +
        '<td class="n num">' + nfmt(l.iniciaram) + '<span class="sub">' + pct(l.iniciaram, l.visitantes) + ' de quem abriu</span></td>' +
        '<td class="n num"><b>' + nfmt(l.vendas) + '</b><span class="sub">' + brl(l.faturamento) + '</span></td>' +
        '<td class="n num">' + nfmt(l.clicaram_sem_comprar) + '<span class="sub">' + pct(l.clicaram_sem_comprar, l.iniciaram) + ' de quem clicou</span></td>' +
        '<td class="n num">' + nfmt(l.pararam_pagamento) + (h ? '<span class="sub quebra">' + esc(h) + '</span>' : '') + '</td>' +
        '<td class="n num">' + (l.conversao === null || l.conversao === undefined ? '—' : String(l.conversao).replace('.', ',') + '%') + '</td></tr>';
    };

    return '<section class="card heroi"><div class="ola">Funil dos links da consultoria</div>' +
      '<div class="pos txt-ouro num">' + nfmt(T.acessos) + ' <small>acessos</small></div>' +
      '<div class="frase">' + nfmt(T.visitantes) + ' pessoas abriram a página por um link · ' + nfmt(T.iniciaram) + ' clicaram em comprar · ' + nfmt(T.vendas) + ' compraram</div>' +
      '<div class="stats quatro">' +
        '<div class="stat"><span>Iniciaram a compra</span><b class="num">' + nfmt(T.iniciaram) + '</b><span class="num">' + pct(T.iniciaram, T.visitantes) + ' de quem abriu</span></div>' +
        '<div class="stat"><span>Compraram</span><b class="num">' + nfmt(T.vendas) + '</b><span class="num">' + pct(T.vendas, T.visitantes) + ' de quem abriu</span></div>' +
        '<div class="stat"><span>Clicaram e não compraram</span><b class="num">' + nfmt(T.clicaram_sem_comprar) + '</b><span class="num">' + pct(T.clicaram_sem_comprar, T.iniciaram) + ' de quem clicou</span></div>' +
        '<div class="stat"><span>Pararam no pagamento</span><b class="num">' + nfmt(T.pararam_pagamento) + '</b><span>Pix/boleto, recusado, carrinho</span></div>' +
      '</div></section>' +
      '<section class="card"><h2>Por link <small>' + (f.desde ? 'acessos contados desde ' + dataBR(f.desde) : 'os acessos começam a contar quando o trecho novo entrar na página') + '</small></h2>' +
      '<div class="tabela-wrap"><table class="funil"><thead><tr><th>Link</th>' + th('acessos', 'Acessos', 1) + th('iniciaram', 'Iniciaram compra', 1) + th('vendas', 'Vendas', 1) +
        th('clicaram_sem_comprar', 'Clicaram e não compraram', 1) + th('pararam_pagamento', 'Pararam no pagamento', 1) + th('conversao', 'Conversão', 1) + '</tr></thead><tbody>' +
        ls.map(linha).join('') + '</tbody></table></div>' +
      '<p class="mini" style="margin-top:12px"><b>Acessos</b>: aberturas da página com o código da pessoa (inclui quem voltou depois, até 30 dias). <b>Iniciaram compra</b>: pessoas que clicaram num botão da Hotmart. ' +
        '<b>Clicaram e não compraram</b>: iniciaram menos vendas. <b>Pararam no pagamento</b>: geraram Pix/boleto e não pagaram, tiveram o cartão recusado, deixaram vencer ou abandonaram o carrinho na Hotmart, e não compraram depois. ' +
        'Venda pelo link de checkout direto conta em Vendas, mas não passa pela página, então não soma acesso. <b>Conversão</b>: vendas ÷ pessoas que abriram.</p></section>';
  }

  function linhaVenda(v, comAcao) {
    const tag = !v.ativa ? '<span class="tag reemb">reembolsada</span>' : v.origem === 'manual' ? '<span class="tag manual">manual</span>' : v.origem === 'link' ? '<span class="tag link">link</span>' : v.da_pagina ? '<span class="tag pag">página sem código</span>' : '<span class="tag cinza">' + esc(v.sck || 'sem sck') + '</span>';
    return '<tr><td>' + dataBR(v.data) + '</td><td>' + esc(v.nome) + '<span class="sub">' + esc(v.email) + '</span></td>' +
      '<td>' + esc(ofertaCurta(v.oferta)) + '</td><td class="n num">' + brl(v.valor) + '</td>' +
      '<td>' + (v.pessoa ? esc(v.pessoa) : '<span class="muted">—</span>') + '<span class="sub">' + tag + (v.codigo_desconhecido ? ' código "' + esc(v.codigo_desconhecido) + '" não cadastrado' : '') + '</span></td>' +
      (comAcao ? '<td class="n"><button class="btn peq" data-atribuir="' + esc(v.transacao) + '">' + (v.codigo ? 'Trocar' : 'Atribuir') + '</button></td>' : '') + '</tr>';
  }

  function filtrarBusca(lista) {
    const q = S.busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(function (v) { return (v.nome + ' ' + v.email + ' ' + v.transacao).toLowerCase().indexOf(q) >= 0; });
  }

  function campoBusca(ph) { return '<input class="input" type="search" data-busca placeholder="' + ph + '" value="' + esc(S.busca) + '">'; }

  function telaVendas(d) {
    let lista = (d.vendas || []).filter(function (v) { return v.codigo; });
    if (S.filtroPessoa) lista = lista.filter(function (v) { return v.codigo === S.filtroPessoa; });
    lista = filtrarBusca(lista);
    const ops = (d.ranking || []).map(function (r) { return '<option value="' + esc(r.codigo) + '"' + (S.filtroPessoa === r.codigo ? ' selected' : '') + '>' + esc(r.nome) + ' (' + r.vendas + ')</option>'; }).join('');
    return '<section class="card"><h2>Vendas com consultor <small>' + lista.length + ' na lista</small></h2>' +
      '<div class="filtros"><select class="input" data-filtro-pessoa><option value="">Todas as pessoas</option>' + ops + '</select>' + campoBusca('Buscar comprador, e-mail ou transação') + '</div>' +
      (lista.length ? '<div class="tabela-wrap"><table><thead><tr><th>Data</th><th>Comprador</th><th>Oferta</th><th class="n">Valor</th><th>Consultor</th><th></th></tr></thead><tbody>' +
        lista.map(function (v) { return linhaVenda(v, true); }).join('') + '</tbody></table></div>' : '<div class="vazio-msg">Nenhuma venda aqui.</div>') + '</section>';
  }

  function telaSemDono(d) {
    let lista = (d.vendas || []).filter(function (v) { return !v.codigo && (S.mostrarTodas || v.da_pagina); });
    lista = filtrarBusca(lista);
    return '<section class="card"><h2>Vendas sem consultor <small>' + lista.length + ' na lista</small></h2>' +
      '<p class="small muted" style="margin:-6px 0 12px">' + (S.mostrarTodas
        ? 'Todas as vendas da Black que não estão com ninguém da consultoria (anúncios, base, comercial). Busque pelo e-mail que o consultor informar.'
        : 'Vendas que vieram da página da consultoria sem o código de ninguém. Normalmente é quem abriu o link num aparelho e comprou em outro.') + '</p>' +
      '<div class="filtros">' + campoBusca('Buscar comprador, e-mail ou transação') +
      '<button class="btn" data-todas>' + (S.mostrarTodas ? 'Só as da página da consultoria' : 'Ver todas as vendas da Black') + '</button></div>' +
      (lista.length ? '<div class="tabela-wrap"><table><thead><tr><th>Data</th><th>Comprador</th><th>Oferta</th><th class="n">Valor</th><th>Origem</th><th></th></tr></thead><tbody>' +
        lista.map(function (v) { return linhaVenda(v, true); }).join('') + '</tbody></table></div>' : '<div class="vazio-msg">Nada pendente.</div>') + '</section>';
  }

  function telaPessoas(d) {
    const ps = (d.pessoas || []).slice().sort(function (a, b) { return (a.perfil === 'admin' ? 0 : 1) - (b.perfil === 'admin' ? 0 : 1) || a.nome.localeCompare(b.nome); });
    const semEmail = ps.filter(function (p) { return !p.email && p.ativo === 'SIM'; }).length;
    return '<section class="card"><h2>Pessoas <small>' + ps.length + ' cadastradas</small><span class="acao" style="display:flex;gap:8px"><button class="btn peq" data-csv>Baixar links (CSV)</button><button class="btn peq ouro" data-pessoa="">+ Pessoa</button></span></h2>' +
      (semEmail ? '<div class="aviso" style="margin-bottom:12px">' + semEmail + ' pessoa' + (semEmail > 1 ? 's' : '') + ' sem e-mail: elas ainda não conseguem entrar no painel. Os links delas já funcionam.</div>' : '') +
      '<div class="tabela-wrap"><table><thead><tr><th>Nome</th><th>Código</th><th>Acesso</th><th>Links</th><th></th></tr></thead><tbody>' +
      ps.map(function (p) {
        return '<tr><td>' + esc(p.nome) + '<span class="sub">' + (p.email ? esc(p.email) : '<span style="color:var(--vermelho)">sem e-mail</span>') + '</span></td>' +
          '<td>' + (p.codigo ? '<code>' + esc(p.codigo) + '</code>' : '<span class="muted">—</span>') + '</td>' +
          '<td>' + (p.ativo !== 'SIM' ? '<span class="tag reemb">desativado</span>' : p.perfil === 'admin' ? '<span class="tag manual">admin</span>' : '<span class="tag cinza">consultoria</span>') + '</td>' +
          '<td>' + (p.links ? '<button class="btn peq" data-copiar="' + esc(p.links.pagina) + '">' + ICO.copiar + 'Página</button> <button class="btn peq" data-links="' + esc(p.id) + '">Todos</button>' : '') + '</td>' +
          '<td class="n"><button class="btn peq" data-pessoa="' + esc(p.id) + '">Editar</button></td></tr>';
      }).join('') + '</tbody></table></div></section>';
  }

  // ---------------------------------------------------------------- folhas
  function abrirFolha(html, aoLigar) {
    sheet.innerHTML = '<div class="fundo" data-fechar-fundo><div class="folha" role="dialog" aria-modal="true">' + html + '</div></div>';
    const fundo = sheet.querySelector('.fundo');
    fundo.addEventListener('click', function (e) { if (e.target === fundo) fecharFolha(); });
    sheet.querySelectorAll('[data-fechar]').forEach(function (b) { b.addEventListener('click', fecharFolha); });
    const prim = sheet.querySelector('input, select');
    if (prim) setTimeout(function () { prim.focus(); }, 30);
    if (aoLigar) aoLigar(sheet);
  }
  function fecharFolha() { sheet.innerHTML = ''; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.innerHTML) fecharFolha(); });

  function folhaAtribuir(tr) {
    const v = (S.dados.vendas || []).filter(function (x) { return x.transacao === tr; })[0];
    if (!v) return;
    const ops = (S.dados.pessoas || []).filter(function (p) { return p.codigo && p.ativo === 'SIM'; }).sort(function (a, b) { return a.nome.localeCompare(b.nome); })
      .map(function (p) { return '<option value="' + esc(p.codigo) + '"' + (v.codigo === p.codigo ? ' selected' : '') + '>' + esc(p.nome) + '</option>'; }).join('');
    abrirFolha('<h3>' + (v.codigo ? 'Trocar consultor' : 'Atribuir venda') + '</h3>' +
      '<p class="desc">' + esc(v.nome) + ' · ' + esc(v.email) + '<br>' + esc(ofertaCurta(v.oferta)) + ' · ' + brl(v.valor) + ' · ' + dataBR(v.data) + '</p>' +
      '<div class="field"><label for="f-cod">Quem vendeu</label><select class="input" id="f-cod">' + (v.codigo ? '<option value="">Ninguém (tirar do ranking)</option>' : '<option value="" disabled selected>Escolha a pessoa</option>') + ops + '</select></div>' +
      '<div class="field"><label for="f-mot">Motivo (fica no histórico)</label><input class="input" id="f-mot" maxlength="300" placeholder="Ex.: cliente comprou pelo computador"></div>' +
      '<div class="rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn ouro" data-salvar>Salvar</button></div>', function (sh) {
      sh.querySelector('[data-salvar]').addEventListener('click', async function (ev) {
        const b = ev.currentTarget;
        const cod = sh.querySelector('#f-cod').value;
        if (!cod && !v.codigo) { toast('Escolha a pessoa.', 'erro'); return; }
        b.disabled = true; b.textContent = 'Salvando…';
        try { S.dados = await api('admin.atribuir', { transacao: tr, codigo: cod, motivo: sh.querySelector('#f-mot').value }); fecharFolha(); render(true); toast('Venda atualizada.', 'ok'); }
        catch (e) { toast(e.message, 'erro'); b.disabled = false; b.textContent = 'Salvar'; }
      });
    });
  }

  function folhaPessoa(id) {
    const p = (S.dados.pessoas || []).filter(function (x) { return x.id === id; })[0] || { nome: '', email: '', codigo: '', perfil: 'consultor', ativo: 'SIM' };
    abrirFolha('<h3>' + (p.id ? 'Editar pessoa' : 'Nova pessoa') + '</h3>' +
      '<p class="desc">O e-mail precisa ser a conta Google com que a pessoa vai entrar. O código vai no link e não deve mudar depois da primeira venda.</p>' +
      '<div class="field"><label for="p-nome">Nome</label><input class="input" id="p-nome" maxlength="80" value="' + esc(p.nome) + '"></div>' +
      '<div class="field"><label for="p-email">E-mail Google</label><input class="input" id="p-email" type="email" maxlength="120" value="' + esc(p.email) + '" placeholder="nome@4blue.com.br"></div>' +
      '<div class="field"><label for="p-cod">Código do link</label><input class="input" id="p-cod" maxlength="24" value="' + esc(p.codigo) + '" placeholder="ex.: aline" autocapitalize="off" spellcheck="false"></div>' +
      '<div class="field"><label for="p-perfil">Acesso</label><select class="input" id="p-perfil"><option value="consultor"' + (p.perfil !== 'admin' ? ' selected' : '') + '>Consultoria (vê as próprias vendas e o ranking)</option><option value="admin"' + (p.perfil === 'admin' ? ' selected' : '') + '>Admin (vê tudo e atribui vendas)</option></select></div>' +
      '<div class="field"><label for="p-ativo">Situação</label><select class="input" id="p-ativo"><option value="SIM"' + (p.ativo === 'SIM' ? ' selected' : '') + '>Ativa</option><option value="NAO"' + (p.ativo !== 'SIM' ? ' selected' : '') + '>Desativada (sai do ranking e não entra)</option></select></div>' +
      '<div class="rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn ouro" data-salvar>Salvar</button></div>', function (sh) {
      const cod = sh.querySelector('#p-cod');
      cod.addEventListener('input', function () { cod.value = cod.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]/g, ''); });
      sh.querySelector('[data-salvar]').addEventListener('click', async function (ev) {
        const b = ev.currentTarget;
        const u = { id: p.id || '', nome: sh.querySelector('#p-nome').value, email: sh.querySelector('#p-email').value, codigo: cod.value, perfil: sh.querySelector('#p-perfil').value, ativo: sh.querySelector('#p-ativo').value };
        b.disabled = true; b.textContent = 'Salvando…';
        try { S.dados = await api('admin.usuario.salvar', { usuario: u }); fecharFolha(); render(true); toast('Pessoa salva.', 'ok'); }
        catch (e) { toast(e.message, 'erro'); b.disabled = false; b.textContent = 'Salvar'; }
      });
    });
  }

  function folhaLinks(id) {
    const p = (S.dados.pessoas || []).filter(function (x) { return x.id === id; })[0];
    if (!p || !p.links) return;
    const L = p.links;
    const item = function (k, t) { return '<div class="link"><div class="txt"><b>' + t + '</b><span>' + esc(L[k]) + '</span></div><button class="btn peq" data-copiar="' + esc(L[k]) + '">' + ICO.copiar + '</button></div>'; };
    abrirFolha('<h3>Links de ' + esc(primeiro(p.nome)) + '</h3><p class="desc">Código <code>' + esc(p.codigo) + '</code></p><div class="links">' +
      item('pagina', 'Página de vendas') + item('checkout', 'Checkout direto · R$ 2.897') + item('desconto_1997', 'Desconto cliente · R$ 1.997') + item('desconto_997', 'Desconto Black 2025 · R$ 997') +
      '</div><div class="rodape"><button class="btn" data-fechar>Fechar</button></div>', function (sh) {
      sh.querySelectorAll('[data-copiar]').forEach(function (b) { b.addEventListener('click', function () { copiar(b.getAttribute('data-copiar')); }); });
    });
  }

  function baixarCsv() {
    const ps = (S.dados.pessoas || []).filter(function (p) { return p.links; });
    const q = function (s) { return '"' + String(s || '').replace(/"/g, '""') + '"'; };
    const linhas = [['Nome', 'Código', 'E-mail', 'Página de vendas', 'Checkout direto R$ 2.897', 'Desconto cliente R$ 1.997', 'Desconto Black 2025 R$ 997']]
      .concat(ps.map(function (p) { return [p.nome, p.codigo, p.email, p.links.pagina, p.links.checkout, p.links.desconto_1997, p.links.desconto_997]; }));
    const csv = '﻿' + linhas.map(function (l) { return l.map(q).join(';'); }).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'links-consultoria-bf26.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  // ---------------------------------------------------------------- eventos
  function ligar() {
    app.querySelectorAll('[data-sair]').forEach(function (b) { b.addEventListener('click', function () { sair(false); }); });
    app.querySelectorAll('[data-aba]').forEach(function (b) { b.addEventListener('click', function () { S.aba = b.getAttribute('data-aba'); S.busca = ''; render(); window.scrollTo(0, 0); }); });
    app.querySelectorAll('[data-ordem-funil]').forEach(function (b) { b.addEventListener('click', function () { S.ordemFunil = b.getAttribute('data-ordem-funil'); render(true); }); });
    app.querySelectorAll('[data-ordem]').forEach(function (b) { b.addEventListener('click', function () { S.ordem = b.getAttribute('data-ordem'); render(true); }); });
    app.querySelectorAll('[data-copiar]').forEach(function (b) { b.addEventListener('click', function () { copiar(b.getAttribute('data-copiar')); }); });
    app.querySelectorAll('[data-atribuir]').forEach(function (b) { b.addEventListener('click', function () { folhaAtribuir(b.getAttribute('data-atribuir')); }); });
    app.querySelectorAll('[data-pessoa]').forEach(function (b) { b.addEventListener('click', function () { folhaPessoa(b.getAttribute('data-pessoa')); }); });
    app.querySelectorAll('[data-links]').forEach(function (b) { b.addEventListener('click', function () { folhaLinks(b.getAttribute('data-links')); }); });
    app.querySelectorAll('[data-csv]').forEach(function (b) { b.addEventListener('click', baixarCsv); });
    app.querySelectorAll('[data-todas]').forEach(function (b) { b.addEventListener('click', function () { S.mostrarTodas = !S.mostrarTodas; render(true); }); });
    const fp = app.querySelector('[data-filtro-pessoa]');
    if (fp) fp.addEventListener('change', function () { S.filtroPessoa = fp.value; render(true); });
    const bu = app.querySelector('[data-busca]');
    if (bu) {
      let t = null;
      bu.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          S.busca = bu.value; const pos = bu.selectionStart; render(true);
          const nv = app.querySelector('[data-busca]'); if (nv) { nv.focus(); try { nv.setSelectionRange(pos, pos); } catch (e) { /* nada */ } }
        }, 250);
      });
    }
  }

  // ---------------------------------------------------------------- início
  const salvo = DEMO ? null : lerGuardado();
  if (salvo) { S.token = salvo.token; carregar(); }
  else telaLogin();
})();
