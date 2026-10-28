/* ==========================================================================
   BLACK FRIDAY VITALÍCIA 2026 — aplicação do navegador
   ========================================================================== */
(function () {
  'use strict';

  const CFG = window.APP_CONFIG || {};
  const DEMO = !CFG.API_URL;
  const $app = document.getElementById('app');
  const $sheet = document.getElementById('sheet');
  const $toasts = document.getElementById('toasts');

  const S = {
    token: null, user: null, modo: 'usuario', view: 'novo',
    leads: [], vendas: [], produtos: [], mensagens: [], usuarios: [], historico: [],
    fases: [], config: {}, links: {}, sistema: CFG.NOME || 'Black Friday Vitalícia 2026',
    podeGerenciar: false,
    busca: '', filtro: 'todos', ordem: 'ranking', limite: 60, funilLista: false,
    adm: { status: 'todos', resp: 'todos', classe: 'todos', origem: 'todos', cliente: 'todos' },
    catalogo: 'fases', carregado: false, sync: false
  };

  /* ------------------------------------------------------------- utilidades */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const soDig = (s) => String(s == null ? '' : s).replace(/\D/g, '');
  const num = (v) => {
    if (v == null || v === '') return 0;
    let s = String(v).replace(/[R$\s%]/g, '');
    if (/,/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}(\D|$)/.test(s)) s = s.replace(/\./g, '');
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  };
  const brl = (v) => num(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const brlCurto = (v) => {
    const n = num(v);
    if (!n) return 'R$ 0';
    if (n >= 1000000) return 'R$ ' + (Math.round(n / 100000) / 10).toLocaleString('pt-BR') + ' mi';
    if (n >= 1000) return 'R$ ' + Math.round(n / 1000) + ' mil';
    return 'R$ ' + Math.round(n);
  };
  const pct = (v) => {
    const n = num(v);
    return (n > 1 && n <= 100 ? Math.round(n) : Math.round(n * 100));
  };
  function telFmt(t) {
    const d = soDig(t);
    const n = d.startsWith('55') && d.length >= 12 ? d.slice(2) : d;
    if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return t || '—';
  }
  /* Número para o wa.me. Com 10 ou 11 dígitos é DDD + número e falta o 55 —
     inclusive DDD 55 (RS), que antes era confundido com o código do país. */
  function waNumero(t) {
    const d = soDig(t).replace(/^0+/, '');
    return d.length <= 11 ? '55' + d : d;
  }
  function dt(s) { const d = new Date(String(s || '').replace(' ', 'T')); return isNaN(d) ? null : d; }
  function fmtData(s) {
    const d = dt(s); if (!d) return '—';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  function rel(s) {
    const d = dt(s); if (!d) return '—';
    const seg = (Date.now() - d.getTime()) / 1000;
    if (seg < 60) return 'agora';
    if (seg < 3600) return 'há ' + Math.floor(seg / 60) + ' min';
    if (seg < 86400) return 'há ' + Math.floor(seg / 3600) + ' h';
    const dias = Math.floor(seg / 86400);
    return dias === 1 ? 'ontem' : 'há ' + dias + ' dias';
  }
  function horasDesde(s) { const d = dt(s); return d ? (Date.now() - d.getTime()) / 3600000 : 9999; }
  const iniciais = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0] || '').join('').toUpperCase() || '?';
  function corDe(nome) {
    let h = 0;
    String(nome || '').split('').forEach((c) => { h = c.charCodeAt(0) + ((h << 5) - h); });
    return `hsl(${Math.abs(h) % 50 + 30}, ${55 + Math.abs(h) % 20}%, ${58 + Math.abs(h) % 12}%)`;
  }

  const I = {
    busca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    whats: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.5-.1-.7.1-.7 1-.9 1.2-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5V9c0-.2-.7-1.6-.9-2.2s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4A3.4 3.4 0 0 0 6 9.2a6 6 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c2.1.8 2.1.6 2.5.5a3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4l-.6-.2M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Z"/></svg>',
    leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
    contatos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
    funil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18l-7 8v7l-4 2v-9L3 4z"/></svg>',
    trofeu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3M10 15h4M9 20h6M12 15v5"/></svg>',
    xcirc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
    painel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    equipe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16.5 3.1a4 4 0 0 1 0 7.8"/></svg>',
    caixa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 9-5 9 5v8l-9 5-9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    ajustes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
    mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    editar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    lixo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12"/></svg>',
    copiar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    relogio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    estrela: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.6l1.3-6.8-5-4.7 6.8-.8L12 2z"/></svg>',
    alerta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l2-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>',
    grafico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>'
  };

  /* ---------------------------------------------- ranking e classificações */
  const CLASSIF = {
    quente: { rot: 'Quente', ico: '🔥', cls: 'c-quente', ordem: 7, ajuda: 'Empresa com porte, dor clara e engajada na campanha. Prioridade máxima.' },
    mql_mais: { rot: 'MQL+', ico: '⚡', cls: 'c-mqlmais', ordem: 6, ajuda: 'Bom perfil e bom porte. Vale o contato logo.' },
    mql: { rot: 'MQL', ico: '✅', cls: 'c-mql', ordem: 5, ajuda: 'Dentro do perfil, precisa de qualificação.' },
    viavel: { rot: 'Viável', ico: '🔵', cls: 'c-viavel', ordem: 4, ajuda: 'Pode comprar, mas não é prioridade agora.' },
    sem_dados: { rot: 'A qualificar', ico: '🟣', cls: 'c-semdados', ordem: 3, ajuda: 'Ainda não fez o diagnóstico — não dá para julgar. A primeira conversa serve para descobrir o perfil.' },
    baixo: { rot: 'Baixo potencial', ico: '⚪', cls: 'c-baixo', ordem: 2, ajuda: 'Porte pequeno demais para a oferta.' },
    fora: { rot: 'Fora do perfil', ico: '❌', cls: 'c-fora', ordem: 1, ajuda: 'Não é público do Combo.' },
    cliente: { rot: 'Já é cliente', ico: '⛔', cls: 'c-cliente', ordem: 0, ajuda: 'Já tem um produto maior e mais completo que o Combo. Não ofertar.' }
  };
  const classifDe = (l) => CLASSIF[l.classificacao] || null;
  const ehCliente = (l) => !!l.cliente_ativo;
  const temDiag = (l) => l.diagnostico === 'feito' || !!l.diag_indice;
  const temHist = (l) => Number(l.hist_campanhas || 0) > 0;
  const jaComprou = (l) => l.hist_comprou === 'sim';
  function historicoDe(l) {
    try { const a = JSON.parse(l.historico_comercial || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  const ROT_STATUS_ANTIGO = { ganho: 'comprou', perdido: 'perdido', tratativa: 'em conversa', novo: 'não contatado', reembolso: 'reembolso', descartado: 'descartado' };

  const STATUS_INFO = {
    novo: { sing: 'Inscrito', plural: 'Inscritos', cor: '#9AA0A8' },
    tratativa: { sing: 'Em tratativa', plural: 'Em tratativa', cor: '#E8B931' },
    ganho: { sing: 'Comprou', plural: 'Compraram', cor: '#22C55E' },
    perdido: { sing: 'Perdido', plural: 'Perdidos', cor: '#F05252' },
    descartado: { sing: 'Descartado', plural: 'Descartados', cor: '#6B7078' }
  };

  const MARCOS_INFO = {
    contato: { rot: 'Primeiro contato', ic: 'whats', vals: { feito: ['Falou com a atendente', 'ok'], sem_resposta: ['Não respondeu', 'alerta'], numero_errado: ['Número errado', 'alerta'] } },
    diagnostico: { rot: 'Diagnóstico', ic: 'grafico', vals: { enviado: ['Diagnóstico enviado', 'info'], feito: ['Diagnóstico feito', 'diag'] } },
    confirmou_live: { rot: 'Confirmou a abertura', ic: 'relogio', vals: { sim: ['Confirmou a abertura', 'ok'], nao: ['Não vai assistir', 'alerta'] } },
    participou: { rot: 'Assistiu a abertura', ic: 'chat', vals: { sim: ['Assistiu a abertura', 'ok'], nao: ['Não assistiu', 'alerta'] } },
    comprou: { rot: 'Comprou o Combo', ic: 'trofeu', vals: { sim: ['Comprou o Combo', 'ok'], nao: ['Não comprou', 'alerta'] } }
  };

  const souCoord = () => S.user && S.user.perfil === 'coordenador';
  const usuarioPorId = (id) => S.usuarios.find((u) => u.id === id);
  const faseDe = (l) => S.fases.find((f) => f.id === l.fase_id);
  const fasesAtivas = () => S.fases.filter((f) => f.ativo !== 'NAO');
  const vendasDoLead = (id) => S.vendas.filter((v) => v.lead_id === id);

  /* --------------------------------------------------------------- API */
  async function api(action, body) {
    const payload = Object.assign({ action, token: S.token }, body || {});
    if (DEMO) return window.DEMO_API(payload);
    const r = await fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    const j = await r.json();
    if (!j.ok) {
      if (j.auth) { sair(true); throw new Error('Sua sessão expirou. Entre de novo.'); }
      throw new Error(j.error || 'Deu erro no servidor.');
    }
    return j.data;
  }

  function aplicar(d) {
    if (!d) return;
    if (d.usuario) S.user = d.usuario;
    ['leads', 'vendas', 'produtos', 'mensagens', 'fases', 'usuarios', 'historico'].forEach((k) => { if (d[k]) S[k] = d[k]; });
    if (d.config) S.config = d.config;
    if (d.links) S.links = d.links;
    if (d.sistema) S.sistema = d.sistema;
    if (d.pode_gerenciar !== undefined) S.podeGerenciar = d.pode_gerenciar;
    S.carregado = true;
  }

  async function carregar() {
    S.sync = true;
    try {
      aplicar(await api(S.modo === 'coord' ? 'admin.painel' : 'bootstrap', {}));
    } finally { S.sync = false; }
    render();
  }

  /* ------------------------------------------------------------- avisos */
  function toast(txt, tipo) {
    const el = document.createElement('div');
    el.className = 'toast ' + (tipo || '');
    el.textContent = txt;
    $toasts.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 3600);
  }
  async function comBotao(btn, fn) {
    if (!btn || btn.disabled) return;
    const txt = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = (btn.dataset.loading || ' Aguarde...');
    try { await fn(); }
    catch (e) { toast(e.message || 'Deu erro.', 'erro'); }
    finally { btn.disabled = false; btn.innerHTML = txt; }
  }

  /* -------------------------------------------------------- bottom sheet */
  function abrirSheet({ titulo, corpo, rodape = '', largo = false, onMount }) {
    $sheet.innerHTML = `
      <div class="sheet-bg" data-fechar>
        <div class="sheet ${largo ? 'largo' : ''}" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
          <div class="grabber"></div>
          <div class="sheet-head"><h2>${esc(titulo)}</h2><button class="x" data-x aria-label="Fechar">${I.x}</button></div>
          <div class="sheet-body">${corpo}</div>
          ${rodape ? `<div class="sheet-foot">${rodape}</div>` : ''}
        </div>
      </div>`;
    const sh = $sheet.querySelector('.sheet');
    // o X do topo e os "Cancelar" do rodapé
    $sheet.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', fecharSheet));
    $sheet.querySelector('[data-fechar]').addEventListener('click', (e) => { if (e.target.dataset.fechar !== undefined) fecharSheet(); });
    if (onMount) onMount(sh);
  }
  function fecharSheet() { $sheet.innerHTML = ''; }

  /* ---------------------------------------------------------- tela de login */
  function telaLogin(erro) {
    $app.innerHTML = `
      <div class="fitas"><div class="fita a">${'BLACK FRIDAY • '.repeat(14)}</div><div class="fita b">${'BLACK FRIDAY • '.repeat(14)}</div></div>
      <div class="login-wrap"><div class="login">
        <div class="marca">
          <svg class="simbolo" viewBox="0 0 64 64" aria-hidden="true">
            <defs><linearGradient id="go" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#8A6508"/><stop offset=".45" stop-color="#F5DE8B"/><stop offset="1" stop-color="#C9A227"/>
            </linearGradient></defs>
            <path d="M22 46V14h6v12.5" stroke="#EEF2F7" stroke-width="7" stroke-linecap="round" fill="none"/>
            <path d="M24 38a7.5 7.5 0 1 1 7.5 7.5A7.5 7.5 0 0 1 24 38zm15 0a7.5 7.5 0 1 0 7.5-7.5A7.5 7.5 0 0 0 39 38z" fill="none" stroke="url(#go)" stroke-width="6"/>
          </svg>
          <h1><span class="txt-ouro">BLACK</span> FRIDAY</h1>
          <div class="sub">VITALÍCIA</div>
          <div class="ano">ÁREA DE ATENDIMENTO · 2026</div>
        </div>
        ${erro ? `<div class="erro-box">${esc(erro)}</div>` : ''}
        <form id="f-login">
          <div class="field"><label>E-mail</label><input class="input" type="email" id="l-email" autocomplete="username" required></div>
          <div class="field"><label>Senha</label><input class="input" type="password" id="l-senha" autocomplete="current-password" required></div>
          <button class="btn ouro bloco" type="submit" data-loading=" Entrando...">Entrar</button>
        </form>
        ${DEMO ? '<p class="hint" style="text-align:center;margin-top:14px">Modo demonstração — entre com qualquer senha usando <b>coord@demo.com</b> (coordenação) ou <b>noelle@demo.com</b> (atendente).</p>' : ''}
      </div></div>`;
    const f = document.getElementById('f-login');
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      comBotao(f.querySelector('button'), async () => {
        const d = await api('login', { email: document.getElementById('l-email').value, senha: document.getElementById('l-senha').value });
        S.token = d.token;
        try { localStorage.setItem('bf_token', d.token); } catch (e) { /* modo privado */ }
        aplicar(d);
        S.modo = souCoord() ? 'coord' : 'usuario';
        S.view = souCoord() ? 'painel' : 'novo';
        if (souCoord()) await carregar(); else render();
        ligarAtualizacao();
      });
    });
  }

  function sair(expirou) {
    S.token = null; S.user = null; S.carregado = false;
    try { localStorage.removeItem('bf_token'); } catch (e) { /* ignora */ }
    telaLogin(expirou ? 'Sua sessão expirou. Entre de novo.' : '');
  }

  /* ------------------------------------------------------------- navegação */
  function navItens() {
    if (S.modo === 'coord') {
      return [
        { id: 'painel', rot: 'Painel', ic: I.painel },
        { id: 'leads', rot: 'Leads', ic: I.leads, n: S.leads.length },
        { id: 'equipe', rot: 'Equipe', ic: I.equipe },
        { id: 'catalogo', rot: 'Funil e msgs', ic: I.caixa },
        { id: 'ajustes', rot: 'Ajustes', ic: I.ajustes }
      ];
    }
    const meu = (st) => S.leads.filter((l) => l.status === st && (st === 'novo' || l.responsavel_id === S.user.id)).length;
    const itens = [
      { id: 'novo', rot: 'Inscritos', ic: I.contatos, n: meu('novo') },
      { id: 'funil', rot: 'Funil', ic: I.funil, n: meu('tratativa') },
      { id: 'ganho', rot: 'Compraram', ic: I.trofeu, n: meu('ganho') },
      { id: 'perdido', rot: 'Perdidos', ic: I.xcirc, n: meu('perdido') }
    ];
    if (S.podeGerenciar) itens.push({ id: 'catalogo', rot: 'Funil e msgs', ic: I.caixa });
    return itens;
  }

  function render() {
    if (!S.carregado) { $app.innerHTML = '<div class="carregando"><div class="spin"></div></div>'; return; }
    const itens = navItens();
    $app.innerHTML = `
      ${DEMO ? '<div class="demo-faixa">MODO DEMONSTRAÇÃO — dados fictícios, nada é salvo</div>' : ''}
      <div class="shell">
        <nav class="nav ${itens.length === 6 ? 'n6' : ''}">
          ${itens.map((n) => `<button data-view="${n.id}" class="${S.view === n.id ? 'on' : ''}">${n.ic}<span class="lbl">${n.rot}</span>${n.n ? `<span class="cnt">${n.n > 999 ? '999+' : n.n}</span>` : ''}</button>`).join('')}
        </nav>
        <div class="corpo">
          <header class="topbar">
            <div class="tit">
              <h2>${esc(S.sistema)}</h2>
              <div class="sub">${S.modo === 'coord' ? 'Coordenação' : 'Olá, ' + esc((S.user.nome || '').split(' ')[0])}${contagemRegressiva()}</div>
            </div>
            ${souCoord() ? `<button class="btn sm line" data-act="trocar-modo">${S.modo === 'coord' ? 'Atender' : 'Coordenar'}</button>` : ''}
            <button class="btn icon line" data-act="recarregar" aria-label="Atualizar">${I.refresh}</button>
            ${avatarHtml(S.user, 'topo')}
          </header>
          <main id="main"></main>
        </div>
      </div>`;
    document.querySelector('.nav').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-view]');
      if (!b) return;
      S.view = b.dataset.view; S.busca = ''; S.filtro = 'todos'; S.limite = 60;
      renderMain();
      document.querySelectorAll('.nav button').forEach((x) => x.classList.toggle('on', x === b));
    });
    const av = document.querySelector('.avatar.topo');
    if (av) av.addEventListener('click', abrirPerfil);
    renderMain();
  }

  /* Liga os eventos UMA vez só. Antes eles eram ligados a cada render() — e o
     render roda a cada atualização automática —, então um clique virava vários:
     o botão Lista/Kanban alternava duas vezes e "não fazia nada", o Mostrar mais
     pulava de 60 em 60 várias vezes etc. O #sheet (detalhe do lead, mensagens)
     fica fora do #app e não tinha ninguém ouvindo: WhatsApp, Comprou, Perdido,
     fase e jornada dentro do card aberto não funcionavam. */
  function ligarEventos() {
    $app.addEventListener('click', acoesGlobais);
    $sheet.addEventListener('click', acoesGlobais);
    $app.addEventListener('input', (ev) => {
      const b = ev.target.closest('[data-busca]');
      if (b) { S.busca = b.value; S.limite = 60; S._focoBusca = true; renderMain(); }
    });
    $app.addEventListener('change', (ev) => {
      const s = ev.target.closest('[data-adm]');
      if (s) { S.adm[s.dataset.adm] = s.value; S.limite = 60; renderMain(); }
    });
  }

  let relogioAtualizacao = null;
  function ligarAtualizacao() {
    if (relogioAtualizacao || DEMO || !(CFG.ATUALIZAR_SEGUNDOS > 0)) return;
    relogioAtualizacao = setInterval(() => { if (S.token && !document.hidden && !$sheet.innerHTML) carregar().catch(() => {}); }, CFG.ATUALIZAR_SEGUNDOS * 1000);
  }

  function contagemRegressiva() {
    const d = S.links && S.links.data_abertura;
    if (!d) return '';
    const alvo = new Date(d + 'T' + ((S.links.hora_abertura || '20:00')) + ':00');
    if (isNaN(alvo)) return '';
    const dias = Math.ceil((alvo.getTime() - Date.now()) / 86400000);
    if (dias > 1) return ` · faltam ${dias} dias para a abertura`;
    if (dias === 1) return ' · a abertura é amanhã';
    if (dias === 0) return ' · a abertura é HOJE';
    return '';
  }

  function avatarHtml(u, cls = '') {
    if (u && u.foto) return `<img class="avatar ${cls}" src="${esc(u.foto)}" alt="">`;
    const nome = u ? u.nome : '?';
    return `<div class="avatar ${cls}" style="background:${corDe(nome)}">${esc(iniciais(nome))}</div>`;
  }

  function renderMain() {
    const m = document.getElementById('main');
    if (!m) return;
    const v = S.view;
    if (S.modo === 'coord') {
      m.innerHTML = v === 'painel' ? viewPainel() : v === 'leads' ? viewLeadsAdmin()
        : v === 'equipe' ? viewEquipe() : v === 'catalogo' ? viewCatalogo() : viewAjustes();
    } else {
      m.innerHTML = v === 'funil' ? viewFunil() : v === 'catalogo' ? viewCatalogo() : viewLista(v);
    }
    const busca = m.querySelector('input[data-busca]');
    if (busca && S._focoBusca) { busca.focus(); busca.setSelectionRange(busca.value.length, busca.value.length); S._focoBusca = false; }
  }

  /* ------------------------------------------------------------- filtros */
  function aplicaBusca(lista) {
    const q = norm(S.busca).trim();
    if (!q) return lista;
    const qd = soDig(q);
    return lista.filter((l) => norm(l.nome).includes(q) || norm(l.email).includes(q) ||
      norm(l.empresa).includes(q) || (qd.length >= 4 && soDig(l.telefone).includes(qd)));
  }
  function aplicaFiltroChip(lista, f) {
    if (f === 'quentes') return lista.filter((l) => l.classificacao === 'quente' || l.classificacao === 'mql_mais');
    if (f === 'diagnostico') return lista.filter(temDiag);
    if (f === 'sem_diag') return lista.filter((l) => !temDiag(l) && !ehCliente(l));
    if (f === 'confirmados') return lista.filter((l) => l.confirmou_live === 'sim');
    if (f === 'ja_comprou') return lista.filter(jaComprou);
    if (f === 'historico') return lista.filter(temHist);
    if (f === 'clientes') return lista.filter(ehCliente);
    if (f === 'parados') return lista.filter((l) => horasDesde(l.ultima_acao || l.inicio_tratativa) > 48);
    return lista;
  }
  function ordenar(st) {
    if (S.ordem === 'ranking') return (a, b) => (b.score || 0) - (a.score || 0) || String(b.criado_em).localeCompare(String(a.criado_em));
    if (st === 'tratativa') return (a, b) => String(a.ultima_acao || a.inicio_tratativa).localeCompare(String(b.ultima_acao || b.inicio_tratativa));
    return (a, b) => String(b.criado_em).localeCompare(String(a.criado_em));
  }
  const botoesOrdem = () => `
    <div class="ordem-linha">
      <button class="btn line sm ${S.ordem === 'ranking' ? 'on' : ''}" data-act="ordem" data-ordem="ranking">${I.estrela}Melhor ranking</button>
      <button class="btn line sm ${S.ordem !== 'ranking' ? 'on' : ''}" data-act="ordem" data-ordem="data">${I.relogio}Mais recentes</button>
    </div>`;

  /* ------------------------------------------------------ área da atendente */
  function viewLista(st) {
    const uid = S.user.id;
    const meus = S.leads.filter((l) => l.responsavel_id === uid);
    const base = S.leads.filter((l) => l.status === st && (st === 'novo' || l.responsavel_id === uid));
    const chipsDef = [['todos', 'Todos'], ['quentes', '🔥 Quentes e MQL+'], ['ja_comprou', '★ Já compraram da 4blue'],
      ['diagnostico', 'Fizeram o diagnóstico'], ['sem_diag', 'Sem diagnóstico'], ['historico', 'Já passaram por outra campanha'],
      ['confirmados', 'Confirmaram a abertura'], ['clientes', '⛔ Já são clientes']];
    if (st === 'tratativa') chipsDef.push(['parados', 'Parados +48h']);
    const chips = chipsDef.map(([k, r]) => `<button class="chip ${S.filtro === k ? 'on' : ''}" data-chip="${k}">${r}<span class="n">${aplicaFiltroChip(aplicaBusca(base), k).length}</span></button>`).join('');
    const lista = aplicaFiltroChip(aplicaBusca(base), S.filtro).sort(ordenar(st));
    const visiveis = lista.slice(0, S.limite);
    const titulos = { novo: 'Inscritos para contatar', ganho: 'Compraram o Combo', perdido: 'Perdidos' };
    return `
      <div class="resumo">
        <div><b class="num">${meus.filter((l) => l.status === 'tratativa').length}</b><span>Em tratativa</span></div>
        <div class="destaque"><b class="num">${meus.filter((l) => l.status === 'ganho').length}</b><span>Compraram</span></div>
        <div><b class="num">${meus.filter(temDiag).length}</b><span>Com diagnóstico</span></div>
      </div>
      <div class="page-head"><h2>${titulos[st] || 'Leads'}</h2>
        <div class="acoes"><button class="btn sm ouro" data-act="novo-lead">${I.mais}Lead</button></div></div>
      <div class="busca">${I.busca}<input class="input" data-busca placeholder="Buscar nome, empresa, telefone, e-mail" value="${esc(S.busca)}" enterkeyhint="search"></div>
      <div class="chips">${chips}</div>
      ${botoesOrdem()}
      ${lista.length ? `<div class="lista">${visiveis.map(cardLead).join('')}</div>
        ${lista.length > S.limite ? `<div class="mais"><button class="btn line" data-act="mais">Mostrar mais (${lista.length - S.limite})</button></div>` : ''}`
        : vazio(st)}`;
  }

  function viewFunil() {
    const uid = S.user.id;
    const base = S.leads.filter((l) => l.status === 'tratativa' && (S.modo === 'coord' || l.responsavel_id === uid));
    const lista = aplicaFiltroChip(aplicaBusca(base), S.filtro);
    const fases = fasesAtivas();
    const semFase = lista.filter((l) => !faseDe(l));
    const ord = ordenar('tratativa');
    const chipsDef = [['todos', 'Todos'], ['quentes', '🔥 Quentes e MQL+'], ['ja_comprou', '★ Já compraram'],
      ['diagnostico', 'Com diagnóstico'], ['historico', 'Já passaram por outra campanha'],
      ['confirmados', 'Confirmaram'], ['clientes', '⛔ Já são clientes'], ['parados', 'Parados +48h']];
    const cab = `
      <div class="page-head"><h2>Funil</h2>
        <div class="acoes">
          <button class="btn sm line" data-act="ver-funil">${S.funilLista ? I.funil : I.leads}${S.funilLista ? 'Kanban' : 'Lista'}</button>
          <button class="btn sm ouro" data-act="novo-lead">${I.mais}Lead</button>
        </div></div>
      <div class="busca">${I.busca}<input class="input" data-busca placeholder="Buscar nome, empresa, telefone, e-mail" value="${esc(S.busca)}"></div>
      <div class="chips">${chipsDef.map(([k, r]) => `<button class="chip ${S.filtro === k ? 'on' : ''}" data-chip="${k}">${r}<span class="n">${aplicaFiltroChip(aplicaBusca(base), k).length}</span></button>`).join('')}</div>`;
    if (!lista.length) return cab + vazio('tratativa');
    if (S.funilLista) return cab + botoesOrdem() + `<div class="lista">${lista.sort(ordenar('tratativa')).map(cardLead).join('')}</div>`;
    const col = (f, leads) => `
      <section class="kcol" style="border-top-color:${f ? esc(f.cor) : 'var(--borda-2)'}">
        <header class="kcol-head">
          <div class="kcol-tit"><b>${f ? esc(f.nome) : 'Sem fase'}</b><span class="kcol-n">${leads.length}</span></div>
          ${f && f.instrucoes ? `<details class="kcol-inst"><summary>O que fazer aqui</summary><ul>${String(f.instrucoes).split('\n').filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
        </header>
        <div class="kcol-body">${leads.length ? leads.sort(ord).map(cardLead).join('') : '<p class="muted small" style="padding:8px 2px">Ninguém aqui.</p>'}</div>
      </section>`;
    return cab + `<div class="kanban">
      ${fases.map((f) => col(f, lista.filter((l) => l.fase_id === f.id))).join('')}
      ${semFase.length ? col(null, semFase) : ''}
    </div>`;
  }

  function vazio(st) {
    const txt = {
      novo: 'Nenhum inscrito por aqui ainda. Assim que alguém se inscrever pelo Active, ele aparece nesta lista.',
      tratativa: 'Você ainda não começou nenhuma conversa. Vá em Inscritos e chame alguém no WhatsApp.',
      ganho: 'Nenhuma venda ainda. As compras do Combo entram sozinhas pela Hotmart no dia da abertura.',
      perdido: 'Nenhum lead perdido.'
    }[st] || 'Nada por aqui.';
    return `<div class="vazio">${I.contatos}<p>${txt}</p></div>`;
  }

  /* ----------------------------------------------------------- card do lead */
  function tagsLead(l, completo) {
    const t = [];
    const cl = classifDe(l);
    if (cl) t.push(`<span class="tag ${cl.cls}" title="Ranking ${l.score} · ${esc(cl.ajuda)}">${cl.ico} ${cl.rot}${l.classificacao === 'sem_dados' ? '' : ` <b>${l.score}</b>`}</span>`);
    if (l.diag_faturamento) t.push(`<span class="tag info" title="Faturamento informado no diagnóstico">${esc(brlCurto(l.diag_faturamento))}/mês</span>`);
    if (l.diag_indice) t.push(`<span class="tag diag" title="Índice geral do diagnóstico">Índice ${pct(l.diag_indice)}%</span>`);
    if (num(l.diag_custo_ineficiencia) > 0) t.push(`<span class="tag alerta" title="Custo de ineficiência por mês">Perde ${esc(brlCurto(l.diag_custo_ineficiencia))}/mês</span>`);
    Object.keys(MARCOS_INFO).forEach((k) => {
      if (k === 'diagnostico' && l.diagnostico === 'feito') return;  // já aparece pelo índice
      const v = MARCOS_INFO[k].vals[l[k]];
      if (v) t.push(`<span class="tag ${v[1]}" title="${esc(MARCOS_INFO[k].rot)}">${esc(v[0])}</span>`);
    });
    if (jaComprou(l)) t.push('<span class="tag ok" title="Já comprou da 4blue em outra campanha">★ Já comprou da 4blue</span>');
    else if (temHist(l)) t.push(`<span class="tag info" title="${esc(historicoDe(l).map((h) => h.c + ' — ' + (ROT_STATUS_ANTIGO[h.s] || h.s)).join(' · '))}">Já passou por ${l.hist_campanhas} campanha${Number(l.hist_campanhas) > 1 ? 's' : ''}</span>`);
    if (l.cliente_mdl && !ehCliente(l)) t.push('<span class="tag">Ex-MDL</span>');
    if (l.cliente_ilu && !ehCliente(l)) t.push('<span class="tag">Ex-Iluminismo</span>');
    const ev = eventosDe(l);
    if (ev.length) t.push(`<span class="tag">${ev.length} evento${ev.length > 1 ? 's' : ''} da 4blue</span>`);
    if (l.status === 'tratativa' && horasDesde(l.ultima_acao || l.inicio_tratativa) > 48) {
      t.push(`<span class="tag alerta">${I.relogio}Parado ${rel(l.ultima_acao || l.inicio_tratativa).replace('há ', '')}</span>`);
    }
    if (completo && l.diag_tipo_negocio) t.push(`<span class="tag">${esc(l.diag_tipo_negocio)}</span>`);
    return t.join('');
  }

  function eventosDe(l) {
    try { const a = JSON.parse(l.eventos || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }

  function cardLead(l) {
    const meta = [l.empresa, telFmt(l.telefone)].filter((x) => x && x !== '—').join(' · ');
    const cliente = ehCliente(l);
    let rodape = '';
    if (l.status === 'novo') {
      rodape = `<div class="lead-actions">
        <button class="btn whats" data-act="wa" data-id="${l.id}">${I.whats}Iniciar conversa</button>
        <button class="btn line icon" data-act="abrir" data-id="${l.id}" aria-label="Detalhes">${I.leads}</button></div>`;
    } else if (l.status === 'tratativa') {
      const f = faseDe(l);
      rodape = `<div class="lead-actions">
        <button class="btn whats icon" data-act="wa" data-id="${l.id}" aria-label="WhatsApp">${I.whats}</button>
        <button class="btn line sm" data-act="fase" data-id="${l.id}" style="border-color:${f ? esc(f.cor) : 'var(--borda)'}">${I.seta}${f ? esc(f.nome) : 'Escolher fase'}</button>
        <button class="btn verde sm icon" data-act="ganho" data-id="${l.id}" aria-label="Comprou">${I.trofeu}</button></div>`;
    } else if (l.status === 'ganho') {
      const vs = vendasDoLead(l.id).filter((v) => v.status === 'ativa');
      rodape = vs.map((v) => `<div class="mini"><span>${esc(v.produto_nome)}</span><b class="nowrap">${brl(v.valor_total)}</b></div>`).join('');
    } else if (l.motivo) {
      rodape = `<div class="mini"><span>Motivo</span><b>${esc(l.motivo)}</b></div>`;
    }
    const quando = l.status === 'novo' ? 'Inscreveu-se ' + rel(l.criado_em)
      : l.status === 'tratativa' ? 'Última ação ' + rel(l.ultima_acao || l.inicio_tratativa)
        : fmtData(l.fechado_em || l.atualizado_em);
    const faixa = cliente
      ? `<div class="faixa alerta">${I.alerta}<span>Já é cliente — não ofertar</span><span class="dir">${esc(String(l.cliente_mdl || l.cliente_ilu).split('·')[0].trim())}</span></div>`
      : l.status === 'ganho'
        ? `<div class="faixa ouro">${I.trofeu}<span>Comprou o Combo Vitalício</span><span class="dir">${esc(l.responsavel_nome || '')}</span></div>`
        : '';
    return `
      <article class="card lead ${cliente ? 'cliente' : ''} ${l.status === 'ganho' ? 'ganho' : ''} ${(!cliente && l.classificacao === 'quente' && l.status !== 'ganho') ? 'quente' : ''}">
        ${faixa}
        <div class="lead-top" data-act="abrir" data-id="${l.id}">
          <div class="avatar" style="background:${corDe(l.nome)}">${esc(iniciais(l.nome))}</div>
          <div class="lead-main">
            <h3>${esc(l.nome || '(sem nome)')}</h3>
            <div class="meta">${esc(meta || l.email || '')}</div>
            <div class="meta">${esc(quando)}${S.modo === 'coord' && l.responsavel_nome ? ' · ' + esc(l.responsavel_nome) : ''}</div>
          </div>
          ${S.modo === 'coord' ? `<span class="status-pill st-${l.status}">${STATUS_INFO[l.status] ? STATUS_INFO[l.status].sing : esc(l.status)}</span>` : ''}
        </div>
        <div class="tags">${tagsLead(l)}</div>
        ${rodape}
      </article>`;
  }

  /* --------------------------------------------------------- detalhe do lead */
  function abrirLead(id) {
    const l = S.leads.find((x) => x.id === id);
    if (!l) return;
    const st = l.status;
    const pode = souCoord() || l.responsavel_id === S.user.id;
    const vs = vendasDoLead(l.id);
    const acoes = [];
    if (st === 'novo' || st === 'tratativa') acoes.push(`<button class="btn whats" data-act="wa" data-id="${l.id}">${I.whats}WhatsApp</button>`);
    if (pode && st === 'tratativa') {
      acoes.push(`<button class="btn verde" data-act="ganho" data-id="${l.id}">${I.trofeu}Comprou</button>`);
      acoes.push(`<button class="btn line" data-act="perdido" data-id="${l.id}">${I.xcirc}Perdido</button>`);
    }
    if (pode && (st === 'perdido' || st === 'descartado')) acoes.push(`<button class="btn line" data-act="reabrir" data-id="${l.id}">${I.refresh}Reabrir</button>`);
    if (S.links.diagnostico) acoes.push(`<button class="btn line" data-act="copiar-diag">${I.copiar}Link do diagnóstico</button>`);

    const info = [
      ['Telefone', telFmt(l.telefone)], ['E-mail', /@/.test(l.email || '') ? l.email : '—'],
      ['Empresa', l.empresa || '—'], ['Cargo', l.cargo || '—'],
      ['Cidade', [l.cidade, l.estado].filter(Boolean).join(' / ') || '—'],
      ['Atendente', l.responsavel_nome || '—'],
      ['Inscreveu-se', fmtData(l.criado_em)], ['Origem', l.origem || '—']
    ];
    if (l.utm_campaign) info.push(['Campanha', l.utm_campaign]);

    abrirSheet({
      titulo: 'Lead',
      largo: true,
      corpo: `
        <div class="det-head">
          <div class="avatar lg" style="background:${corDe(l.nome)}">${esc(iniciais(l.nome))}</div>
          <div style="flex:1;min-width:0">
            <h3 style="font-size:19px;font-weight:800">${esc(l.nome)}</h3>
            <div class="tags" style="margin-top:7px">${tagsLead(l, true)}</div>
          </div>
          ${pode || st === 'novo' ? `<button class="btn line sm icon" data-act="editar" data-id="${l.id}" aria-label="Editar">${I.editar}</button>` : ''}
        </div>
        ${!pode && st !== 'novo' ? `<p class="muted small">Este lead está com ${esc(l.responsavel_nome)}.</p>` : ''}
        ${ehCliente(l) ? `<div class="caixa erro" style="margin-bottom:14px"><b>⛔ Já é cliente ativo da 4blue</b><div class="small" style="margin-top:4px">${esc(l.cliente_mdl || l.cliente_ilu)}. O Combo Vitalício é menor e menos completo do que o que essa pessoa já tem — não faz sentido ofertar.</div></div>` : ''}
        ${acoes.length ? `<div class="acoes-grid">${acoes.join('')}</div>` : ''}
        ${pode && st === 'tratativa' ? blocoFase(l) : ''}
        ${pode && st !== 'novo' ? blocoMarcos(l) : ''}
        ${blocoRanking(l)}
        ${blocoDiagnostico(l)}
        ${blocoHistorico(l)}
        <div class="secao">Dados do lead</div>
        <div class="info">${info.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
        ${vs.length ? `<div class="secao">Compra</div>${vs.map((v) => `
          <div class="caixa ${v.status === 'ativa' ? 'ok' : 'erro'}" style="margin-bottom:8px">
            <b>${esc(v.produto_nome)}</b> — ${brl(v.valor_total)} ${v.parcelas ? 'em ' + esc(v.parcelas) + 'x' : ''}
            <div class="small muted" style="margin-top:3px">${esc([v.forma_pagamento, v.usuario_nome, fmtData(v.data), v.transacao].filter(Boolean).join(' · '))}</div>
            ${v.status !== 'ativa' ? '<div class="small" style="margin-top:3px">Reembolsada</div>' : ''}
          </div>`).join('')}` : ''}
        ${eventosDe(l).length ? `<div class="secao">Eventos anteriores da 4blue</div>
          <div class="caixa">${eventosDe(l).map((e) => `<div>• ${esc(e.e)}${e.t ? ' · ' + esc(e.t) : ''}${/sim/i.test(e.f || '') ? ' · compareceu' : ''}</div>`).join('')}</div>` : ''}
        ${souCoord() ? `<div class="secao">Coordenação</div>
          <div class="row" style="margin-bottom:8px">
            <select class="input" id="d-resp">${S.usuarios.filter((u) => u.ativo === 'SIM').map((u) => `<option value="${u.id}" ${l.responsavel_id === u.id ? 'selected' : ''}>${esc(u.nome)}</option>`).join('')}</select>
            <button class="btn line" style="flex:none" data-act="atribuir" data-id="${l.id}">Passar</button>
          </div>
          <div class="row">
            ${st !== 'novo' ? `<button class="btn line sm" data-act="liberar" data-id="${l.id}">Devolver para a fila</button>` : ''}
            <button class="btn line sm perigo" data-act="excluir-lead" data-id="${l.id}">${I.lixo}Excluir</button>
          </div>` : ''}
        <div class="secao">Anotações e histórico</div>
        <div class="row" style="margin-bottom:10px">
          <input class="input" id="d-nota" placeholder="Escreva uma anotação...">
          <button class="btn line" style="flex:none" data-act="anotar" data-id="${l.id}">Salvar</button>
        </div>
        <div id="d-hist" class="feed"><p class="muted small">Carregando histórico...</p></div>`,
      onMount: async (sh) => {
        try {
          const h = await api('lead.historico', { id: l.id });
          const box = sh.querySelector('#d-hist');
          if (!box) return;
          box.innerHTML = h.length ? h.map((x) => `
            <div class="feed-item"><span class="feed-dot" style="background:${corAcao(x.acao)}"></span>
              <div style="flex:1;min-width:0"><div><b>${esc(x.usuario_nome)}</b> · ${esc(ROT_ACAO[x.acao] || x.acao)}</div>
              ${x.detalhe ? `<div class="small muted">${esc(x.detalhe)}</div>` : ''}
              <div class="quando">${rel(x.data)}</div></div></div>`).join('')
            : '<p class="muted small">Nada registrado ainda.</p>';
        } catch (e) { /* silencioso */ }
      }
    });
  }

  const ROT_ACAO = { criado: 'cadastrou o lead', tratativa: 'iniciou a conversa', contato: 'mandou mensagem', marco: 'marcou', fase: 'mudou a fase', ganho: 'registrou a venda', perdido: 'marcou como perdido', editado: 'editou', nota: 'anotou', atribuido: 'passou o lead', liberado: 'devolveu para a fila', distribuicao: 'distribuiu leads', equipe: 'mexeu na equipe', config: 'mudou os ajustes', excluido: 'excluiu' };
  const corAcao = (a) => ({ ganho: '#22C55E', perdido: '#F05252', marco: '#E8B931', fase: '#60A5FA', criado: '#9AA0A8', nota: '#A78BFA' }[a] || '#6B7078');

  function blocoRanking(l) {
    const cl = classifDe(l);
    if (!cl) return '';
    const motivos = String(l.score_motivos || '').split(' · ').filter(Boolean);
    return `
      <div class="secao">Ranking</div>
      <div class="rank-box ${cl.cls}">
        <div class="rank-top"><span class="rank-ico">${cl.ico}</span>
          <div style="flex:1;min-width:0"><b>${cl.rot}</b><div class="small muted">${esc(cl.ajuda)}</div></div>
          <span class="rank-pts">${l.score}</span></div>
        ${motivos.length ? `<details class="rank-por"><summary>Como chegamos nesse número</summary><ul>${motivos.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></details>` : ''}
      </div>`;
  }

  function blocoDiagnostico(l) {
    if (!temDiag(l)) {
      return `<div class="secao">Diagnóstico Máquina de Lucros</div>
        <div class="caixa aviso">Esta pessoa ainda não respondeu o diagnóstico. É o jeito mais rápido de descobrir o porte da empresa e a dor dela — e o resultado cai aqui sozinho.
        ${S.links.diagnostico ? `<div style="margin-top:9px"><button class="btn sm line" data-act="copiar-diag">${I.copiar}Copiar o link para mandar</button></div>` : ''}</div>`;
    }
    let pilares = {};
    try { pilares = JSON.parse(l.diag_pilares || '{}'); } catch (e) { pilares = {}; }
    const faixa = (v) => { const n = pct(v); return n < 40 ? 'baixo' : n < 65 ? 'medio' : 'alto'; };
    return `
      <div class="secao">Diagnóstico Máquina de Lucros</div>
      <div class="diag-kpis" style="margin-bottom:14px">
        <div><b class="v">${pct(l.diag_indice)}%</b><span>Índice geral</span></div>
        <div><b class="v">${esc(brlCurto(l.diag_faturamento))}</b><span>Fatura por mês</span></div>
        <div><b class="v">${pct(l.diag_lucro_pct)}%</b><span>Lucro declarado</span></div>
        <div><b class="v">${esc(brlCurto(l.diag_custo_ineficiencia))}</b><span>Perde por mês</span></div>
      </div>
      ${Object.keys(pilares).length ? Object.entries(pilares).map(([k, v]) => `
        <div class="pilar"><div class="pilar-top"><b>${esc(k)}</b><span class="muted">${pct(v)}%</span></div>
          <div class="barra"><i class="${faixa(v)}" style="width:${Math.min(100, pct(v))}%"></i></div></div>`).join('') : ''}
      <div class="row" style="margin-top:12px;flex-wrap:wrap">
        ${l.diag_faturamento_desejado ? `<div class="mini" style="flex:1"><span>Quer faturar</span><b>${esc(brlCurto(l.diag_faturamento_desejado))}</b></div>` : ''}
        ${num(l.diag_custo_oportunidade) ? `<div class="mini" style="flex:1"><span>Deixa de ganhar</span><b>${esc(brlCurto(l.diag_custo_oportunidade))}/mês</b></div>` : ''}
      </div>
      ${l.diag_pdf ? `<div style="margin-top:10px"><a class="btn line sm" href="${esc(l.diag_pdf)}" target="_blank" rel="noopener">${I.download}Abrir o PDF do diagnóstico</a></div>` : ''}`;
  }

  /** O que o comercial já viveu com essa pessoa em outras campanhas. */
  function blocoHistorico(l) {
    const h = historicoDe(l);
    if (!h.length) return '';
    const cor = (st) => ({ ganho: 'ok', perdido: 'alerta', tratativa: 'info' }[st] || '');
    return `
      <div class="secao">Histórico com a 4blue</div>
      ${jaComprou(l) ? '<div class="caixa ok" style="margin-bottom:10px"><b>★ Essa pessoa já comprou da gente antes.</b><div class="small" style="margin-top:3px">Já conhece o trabalho e confiou uma vez — use isso na conversa.</div></div>' : ''}
      ${l.hist_atendente ? `<p class="small muted" style="margin-bottom:8px">Quem já atendeu: <b>${esc(l.hist_atendente)}</b></p>` : ''}
      ${h.map((x) => `
        <div class="caixa" style="margin-bottom:8px">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <b style="flex:1;min-width:0">${esc(x.c)}</b>
            <span class="tag ${cor(x.s)}">${esc(ROT_STATUS_ANTIGO[x.s] || x.s)}</span>
          </div>
          <div class="small muted" style="margin-top:4px">${esc([x.m, x.a, x.q].filter(Boolean).join(' · '))}</div>
        </div>`).join('')}`;
  }

  function blocoFase(l) {
    const f = faseDe(l);
    return `<div class="secao">Fase do funil</div>
      <button class="btn line bloco" data-act="fase" data-id="${l.id}" style="justify-content:space-between;border-color:${f ? esc(f.cor) : 'var(--borda)'}">
        <span>${f ? esc(f.nome) : 'Escolher a fase'}</span>${I.seta}</button>
      ${f && f.instrucoes ? `<div class="caixa" style="margin-top:8px"><div class="small muted">${esc(f.instrucoes)}</div></div>` : ''}`;
  }

  function blocoMarcos(l) {
    return `<div class="secao">Jornada do lead</div>` + Object.keys(MARCOS_INFO).map((k) => {
      const info = MARCOS_INFO[k];
      const vals = Object.keys(info.vals);
      return `<div class="marco"><span class="nm">${info.ic ? I[info.ic] : ''} ${esc(info.rot)}</span>
        <span class="ops">${vals.map((v) => `<button data-act="marco" data-id="${l.id}" data-campo="${k}" data-valor="${v}" class="${l[k] === v ? 'on' : ''}">${esc(info.vals[v][0])}</button>`).join('')}
        ${l[k] ? `<button data-act="marco" data-id="${l.id}" data-campo="${k}" data-valor="">limpar</button>` : ''}</span></div>`;
    }).join('');
  }

  /* ------------------------------------------------------------ ações */
  function abrirWhats(id) {
    const l = S.leads.find((x) => x.id === id);
    if (!l) return;
    const msgs = S.mensagens.filter((m) => m.ativo !== 'NAO');
    const doFase = msgs.filter((m) => !m.fase_id || m.fase_id === l.fase_id);
    const lista = (doFase.length ? doFase : msgs);
    let escolhida = lista[0] ? lista[0].id : '';
    const monta = (txt) => String(txt || '')
      .replace(/\{primeiro_nome\}/g, String(l.nome || '').split(' ')[0])
      .replace(/\{nome\}/g, l.nome || '')
      .replace(/\{usuario\}/g, String(S.user.nome || '').split(' ')[0])
      .replace(/\{empresa\}/g, l.empresa || '')
      .replace(/\{link_diagnostico\}/g, S.links.diagnostico || '')
      .replace(/\{link_inscricao\}/g, S.links.inscricao || '')
      .replace(/\{link_live\}/g, S.links.live || '')
      .replace(/\{data_abertura\}/g, fmtDataCurta(S.links.data_abertura))
      .replace(/\{hora_abertura\}/g, S.links.hora_abertura || '');
    abrirSheet({
      titulo: 'Mandar mensagem',
      corpo: `
        <p class="small muted" style="margin-bottom:10px">Para <b>${esc(l.nome)}</b> · ${esc(telFmt(l.telefone))}</p>
        ${ehCliente(l) ? '<div class="caixa erro" style="margin-bottom:10px">⛔ Esta pessoa já é cliente ativo. Não ofereça o Combo.</div>' : ''}
        ${lista.length ? `<div id="wa-msgs">${lista.map((m, i) => `
          <div class="msg-opcao ${i === 0 ? 'on' : ''}" data-msg="${m.id}">
            <b>${esc(m.titulo)}</b><p>${esc(monta(m.texto))}</p></div>`).join('')}</div>
          <div class="msg-opcao" data-msg=""><b>Começar do zero</b><p class="muted">Abre o WhatsApp sem texto pronto.</p></div>`
        : '<p class="muted small">Nenhuma mensagem cadastrada ainda. O WhatsApp vai abrir em branco.</p>'}`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn whats" id="wa-ir">${I.whats}Abrir WhatsApp</button>`,
      onMount: (sh) => {
        sh.querySelectorAll('[data-msg]').forEach((el) => el.addEventListener('click', () => {
          sh.querySelectorAll('[data-msg]').forEach((x) => x.classList.remove('on'));
          el.classList.add('on');
          escolhida = el.dataset.msg;
        }));
        sh.querySelector('#wa-ir').addEventListener('click', () => {
          const m = lista.find((x) => x.id === escolhida);
          const txt = m ? monta(m.texto) : '';
          const url = 'https://wa.me/' + waNumero(l.telefone) + (txt ? '?text=' + encodeURIComponent(txt) : '');
          // abre na mesma interação do clique, senão o navegador bloqueia
          if (window.LW_ABRIR_URL) window.LW_ABRIR_URL(url); else window.open(url, '_blank', 'noopener');
          api('lead.tratativa', { id: l.id, mensagem: m ? m.titulo : '' })
            .then(() => carregar())
            .catch((e) => toast(e.message, 'erro'));
          fecharSheet();
        });
      }
    });
  }
  function fmtDataCurta(s) {
    if (!s) return '';
    const d = new Date(s + 'T12:00:00');
    return isNaN(d) ? s : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function abrirGanho(id) {
    const l = S.leads.find((x) => x.id === id);
    if (!l) return;
    const prods = S.produtos.filter((p) => p.ativo !== 'NAO');
    abrirSheet({
      titulo: 'Registrar a compra',
      corpo: `
        <p class="small muted" style="margin-bottom:12px">${esc(l.nome)} comprou o Combo. No dia da abertura as compras entram sozinhas pela Hotmart — use isto só se precisar registrar à mão.</p>
        <div class="field"><label>Produto</label>
          <select class="input" id="g-prod">
            <option value="Combo Vitalício de Cursos">Combo Vitalício de Cursos</option>
            ${prods.map((p) => `<option value="${esc(p.nome)}" data-valor="${esc(p.valor_total)}">${esc(p.nome)}</option>`).join('')}
          </select></div>
        <div class="row">
          <div class="field"><label>Valor total (R$)</label><input class="input" id="g-total" inputmode="decimal" placeholder="2.997,00"></div>
          <div class="field"><label>Parcelas</label><input class="input" id="g-parc" inputmode="numeric" placeholder="12"></div>
        </div>
        <div class="field"><label>Forma de pagamento</label><input class="input" id="g-forma" placeholder="Cartão, Pix, boleto..."></div>
        <div class="field"><label>Observações</label><textarea class="input" id="g-obs" placeholder="Algo que a equipe precise saber"></textarea></div>`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn verde" id="g-salvar" data-loading=" Salvando...">Registrar</button>`,
      onMount: (sh) => {
        const sel = sh.querySelector('#g-prod');
        sel.addEventListener('change', () => {
          const o = sel.selectedOptions[0];
          if (o && o.dataset.valor) sh.querySelector('#g-total').value = o.dataset.valor;
        });
        sh.querySelector('#g-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          await api('lead.ganho', { id: l.id, venda: {
            produto_nome: sel.value, valor_total: sh.querySelector('#g-total').value,
            parcelas: sh.querySelector('#g-parc').value, forma_pagamento: sh.querySelector('#g-forma').value,
            obs: sh.querySelector('#g-obs').value
          } });
          fecharSheet(); toast('Venda registrada!', 'ok'); await carregar();
        }));
      }
    });
  }

  function abrirPerdido(id) {
    const l = S.leads.find((x) => x.id === id);
    if (!l) return;
    const motivos = ['Não respondeu', 'Sem dinheiro agora', 'Achou caro', 'Não é o momento', 'Não tem empresa', 'Já é cliente', 'Número errado'];
    abrirSheet({
      titulo: 'Marcar como perdido',
      corpo: `
        <p class="small muted" style="margin-bottom:10px">${esc(l.nome)}</p>
        <div class="chips" style="flex-wrap:wrap;overflow:visible">${motivos.map((m) => `<button class="chip" data-motivo="${esc(m)}">${esc(m)}</button>`).join('')}</div>
        <div class="field"><label>Motivo</label><input class="input" id="p-motivo" placeholder="Escreva ou escolha acima"></div>
        <label class="check"><input type="checkbox" id="p-descartar"><span>Descartar de vez (sai das listas e dos números da campanha)</span></label>`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn perigo" id="p-salvar" data-loading=" Salvando...">Confirmar</button>`,
      onMount: (sh) => {
        sh.querySelectorAll('[data-motivo]').forEach((b) => b.addEventListener('click', () => { sh.querySelector('#p-motivo').value = b.dataset.motivo; }));
        sh.querySelector('#p-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          await api('lead.perdido', { id: l.id, motivo: sh.querySelector('#p-motivo').value, descartar: sh.querySelector('#p-descartar').checked });
          fecharSheet(); toast('Lead fechado.', 'ok'); await carregar();
        }));
      }
    });
  }

  function abrirFase(id) {
    const l = S.leads.find((x) => x.id === id);
    if (!l) return;
    abrirSheet({
      titulo: 'Mover no funil',
      corpo: fasesAtivas().map((f) => `
        <div class="fase-opcao ${l.fase_id === f.id ? 'on' : ''}" data-fase="${f.id}">
          <span class="fase-cor" style="background:${esc(f.cor)}"></span>
          <div style="flex:1;min-width:0"><b>${esc(f.nome)}</b>${f.instrucoes ? `<div class="small muted">${esc(String(f.instrucoes).split('\n')[0])}</div>` : ''}</div>
        </div>`).join(''),
      onMount: (sh) => {
        sh.querySelectorAll('[data-fase]').forEach((el) => el.addEventListener('click', async () => {
          try { await api('lead.fase', { id: l.id, fase_id: el.dataset.fase }); fecharSheet(); toast('Fase atualizada.', 'ok'); await carregar(); }
          catch (e) { toast(e.message, 'erro'); }
        }));
      }
    });
  }

  function abrirFormLead(id) {
    const l = id ? S.leads.find((x) => x.id === id) : null;
    const v = (c) => esc(l ? (l[c] || '') : '');
    abrirSheet({
      titulo: l ? 'Editar lead' : 'Novo lead',
      corpo: `
        <div class="field"><label>Nome *</label><input class="input" id="e-nome" value="${v('nome')}"></div>
        <div class="row">
          <div class="field"><label>WhatsApp</label><input class="input" id="e-telefone" inputmode="tel" value="${v('telefone')}"></div>
          <div class="field"><label>E-mail</label><input class="input" id="e-email" inputmode="email" value="${v('email')}"></div>
        </div>
        <div class="row">
          <div class="field"><label>Empresa</label><input class="input" id="e-empresa" value="${v('empresa')}"></div>
          <div class="field"><label>Cargo</label><input class="input" id="e-cargo" value="${v('cargo')}"></div>
        </div>
        <div class="row">
          <div class="field"><label>Cidade</label><input class="input" id="e-cidade" value="${v('cidade')}"></div>
          <div class="field"><label>Estado</label><input class="input" id="e-estado" value="${v('estado')}"></div>
        </div>
        <div class="field"><label>Observações</label><textarea class="input" id="e-obs">${v('obs')}</textarea></div>
        ${!l ? '<label class="check"><input type="checkbox" id="e-assumir" checked><span>Já começar a tratativa comigo</span></label>' : ''}`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn ouro" id="e-salvar" data-loading=" Salvando...">Salvar</button>`,
      onMount: (sh) => {
        sh.querySelector('#e-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          const d = {};
          ['nome', 'telefone', 'email', 'empresa', 'cargo', 'cidade', 'estado', 'obs'].forEach((c) => { d[c] = sh.querySelector('#e-' + c).value; });
          if (l) await api('lead.editar', { id: l.id, lead: d });
          else { d.assumir = sh.querySelector('#e-assumir').checked; await api('lead.criar', { lead: d }); }
          fecharSheet(); toast(l ? 'Lead atualizado.' : 'Lead criado.', 'ok'); await carregar();
        }));
      }
    });
  }

  function abrirPerfil() {
    const u = S.user;
    abrirSheet({
      titulo: 'Minha conta',
      corpo: `
        <div class="det-head">${avatarHtml(u, 'lg')}
          <div><b style="font-size:17px">${esc(u.nome)}</b><div class="small muted">${esc(u.email)}</div>
          <div class="small muted">${u.perfil === 'coordenador' ? 'Coordenação' : 'Atendente'}</div></div></div>
        <div class="field"><label>Seu nome</label><input class="input" id="pf-nome" value="${esc(u.nome)}"></div>
        <div class="field"><label>Foto</label><input class="input" type="file" accept="image/*" id="pf-foto">
          <p class="hint">A foto fica pequena e aparece só aqui no sistema.</p></div>
        <div class="field"><label>Nova senha</label><input class="input" type="password" id="pf-senha" placeholder="deixe vazio para não mudar"></div>
        <button class="btn line bloco perigo" data-act="sair" style="margin-top:8px">Sair da conta</button>`,
      rodape: `<button class="btn line" data-x>Fechar</button><button class="btn ouro" id="pf-salvar" data-loading=" Salvando...">Salvar</button>`,
      onMount: (sh) => {
        let foto = null;
        sh.querySelector('#pf-foto').addEventListener('change', (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const img = new Image();
          const fr = new FileReader();
          fr.onload = () => { img.onload = () => {
            const c = document.createElement('canvas');
            const lado = Math.min(img.width, img.height);
            c.width = c.height = 128;
            c.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 128, 128);
            foto = c.toDataURL('image/jpeg', .82);
          }; img.src = fr.result; };
          fr.readAsDataURL(f);
        });
        sh.querySelector('#pf-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          const d = { nome: sh.querySelector('#pf-nome').value };
          if (foto) d.foto = foto;
          const senha = sh.querySelector('#pf-senha').value;
          if (senha) d.senha = senha;
          S.user = await api('perfil.salvar', d);
          fecharSheet(); toast('Conta atualizada.', 'ok'); await carregar();
        }));
      }
    });
  }

  /* ------------------------------------------------------- ações globais */
  function acoesGlobais(ev) {
    const el = ev.target.closest('[data-act]');
    const chip = ev.target.closest('[data-chip]');
    if (chip) { S.filtro = chip.dataset.chip; S.limite = 60; renderMain(); return; }
    if (!el) return;
    const id = el.dataset.id;
    switch (el.dataset.act) {
      case 'abrir': abrirLead(id); break;
      case 'wa': abrirWhats(id); break;
      case 'ganho': abrirGanho(id); break;
      case 'perdido': abrirPerdido(id); break;
      case 'fase': abrirFase(id); break;
      case 'editar': abrirFormLead(id); break;
      case 'novo-lead': abrirFormLead(); break;
      case 'ordem': S.ordem = el.dataset.ordem; renderMain(); break;
      case 'mais': S.limite += 60; renderMain(); break;
      case 'ver-funil': S.funilLista = !S.funilLista; renderMain(); break;
      case 'recarregar': comBotao(el, async () => { await carregar(); toast('Atualizado.', 'ok'); }); break;
      case 'trocar-modo':
        S.modo = S.modo === 'coord' ? 'usuario' : 'coord';
        S.view = S.modo === 'coord' ? 'painel' : 'novo';
        S.filtro = 'todos'; S.busca = '';
        comBotao(el, carregar);
        break;
      case 'sair': fecharSheet(); sair(); break;
      case 'marco': comBotao(el, async () => {
        await api('lead.marco', { id, campo: el.dataset.campo, valor: el.dataset.valor });
        await carregar(); abrirLead(id);
      }); break;
      case 'reabrir': comBotao(el, async () => { await api('lead.reabrir', { id }); fecharSheet(); toast('Lead reaberto.', 'ok'); await carregar(); }); break;
      case 'anotar': comBotao(el, async () => {
        const inp = document.getElementById('d-nota');
        if (!inp || !inp.value.trim()) return;
        await api('lead.obs', { id, texto: inp.value });
        inp.value = ''; toast('Anotação salva.', 'ok'); await carregar(); abrirLead(id);
      }); break;
      case 'atribuir': comBotao(el, async () => {
        await api('admin.lead.atribuir', { id, usuario_id: document.getElementById('d-resp').value });
        fecharSheet(); toast('Lead passado.', 'ok'); await carregar();
      }); break;
      case 'liberar': comBotao(el, async () => { await api('admin.lead.liberar', { id }); fecharSheet(); toast('Voltou para a fila.', 'ok'); await carregar(); }); break;
      case 'excluir-lead':
        if (!confirm('Excluir este lead de vez? Não dá para desfazer.')) return;
        comBotao(el, async () => { await api('admin.lead.excluir', { id }); fecharSheet(); toast('Lead excluído.', 'ok'); await carregar(); });
        break;
      case 'copiar-diag': copiar(S.links.diagnostico, 'Link do diagnóstico copiado.'); break;
      case 'copiar-campo': { const alvo = document.getElementById(el.dataset.alvo); if (alvo) copiar(alvo.value, 'Copiado.'); break; }
      case 'distribuir': comBotao(el, distribuir); break;
      case 'dup-ver': comBotao(el, verDuplicados); break;
      case 'dup-juntar': comBotao(el, juntarDuplicados); break;
      case 'sinc-diag': comBotao(el, async () => {
        const r = await api('admin.diagnostico.sincronizar', {});
        await carregar();
        const box = document.getElementById('res-diag');
        if (box) box.innerHTML = r.erro ? `<div class="caixa erro">${esc(r.erro)}</div>`
          : `<div class="caixa ok">Leu ${r.linhas} respostas · ${r.atualizados} leads atualizados${r.criados ? ' · ' + r.criados + ' leads criados' : ''}.</div>`;
      }); break;
      case 'sinc-hist': comBotao(el, async () => {
        const r = await api('admin.historico.sincronizar', {});
        await carregar();
        const box = document.getElementById('res-hist');
        if (box) box.innerHTML = r.erro ? `<div class="caixa erro">${esc(r.erro)}</div>`
          : `<div class="caixa ok"><b>${r.com_historico} leads já passaram por outra campanha</b>
              <div class="small" style="margin-top:4px">${(r.planilhas || []).map((p) => esc(p.campanha) + ': ' + (p.erro ? '⚠ ' + esc(p.erro) : p.linhas + ' leads')).join(' · ')}</div>
              ${r.devolvidos_a_quem_atendeu ? `<div class="small" style="margin-top:4px">${r.devolvidos_a_quem_atendeu} lead(s) devolvido(s) para quem já atendia a pessoa.</div>` : ''}</div>`;
      }); break;
      case 'sinc-clientes': comBotao(el, async () => {
        const r = await api('admin.clientes.sincronizar', {});
        await carregar();
        const box = document.getElementById('res-clientes');
        if (box) box.innerHTML = r.erro ? `<div class="caixa erro">${esc(r.erro)}</div>`
          : `<div class="caixa ok">${r.pessoas_na_base} pessoas na base · ${r.leads_atualizados} leads atualizados.</div>`;
      }); break;
      case 'importar': abrirImportar(); break;
      case 'imp-marcos': abrirImportarMarcos(el.dataset.tipo); break;
      case 'exportar': exportarCsv(); break;
      case 'salvar-config': comBotao(el, salvarConfig); break;
      case 'nova-fase': abrirFormFase(); break;
      case 'editar-fase': abrirFormFase(id); break;
      case 'nova-msg': abrirFormMensagem(); break;
      case 'editar-msg': abrirFormMensagem(id); break;
      case 'novo-produto': abrirFormProduto(); break;
      case 'editar-produto': abrirFormProduto(id); break;
      case 'novo-usuario': abrirFormUsuario(); break;
      case 'editar-usuario': abrirFormUsuario(id); break;
      case 'cat': S.catalogo = el.dataset.cat; renderMain(); break;
      case 'excluir-fase':
        if (!confirm('Excluir esta fase?')) return;
        comBotao(el, async () => { await api('fase.excluir', { id }); toast('Fase excluída.', 'ok'); await carregar(); });
        break;
      case 'excluir-msg':
        if (!confirm('Excluir esta mensagem?')) return;
        comBotao(el, async () => { await api('mensagem.excluir', { id }); toast('Mensagem excluída.', 'ok'); await carregar(); });
        break;
    }
  }

  function copiar(txt, msg) {
    if (!txt) return toast('Nada para copiar.', 'erro');
    const ok = () => toast(msg || 'Copiado.', 'ok');
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok).catch(() => fallback());
    else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { toast('Não consegui copiar.', 'erro'); }
      ta.remove();
    }
  }

  window.__BF = { S, api, carregar, render };

  /* ------------------------------------------------------------- início */
  (async function iniciar() {
    ligarEventos();
    let tk = null;
    try { tk = localStorage.getItem('bf_token'); } catch (e) { tk = null; }
    if (DEMO) { telaLogin(''); return; }
    if (!tk) { telaLogin(''); return; }
    S.token = tk;
    try {
      aplicar(await api('bootstrap', {}));
      S.modo = souCoord() ? 'coord' : 'usuario';
      S.view = souCoord() ? 'painel' : 'novo';
      if (souCoord()) await carregar(); else render();
      ligarAtualizacao();
    } catch (e) { telaLogin(''); }
  })();

  /* ====================================================================== */
  /*  ÁREA DA COORDENAÇÃO                                                   */
  /* ====================================================================== */
  function viewPainel() {
    const leads = S.leads;
    const vendas = S.vendas.filter((v) => v.status === 'ativa');
    const total = leads.length || 1;
    const comDiag = leads.filter(temDiag).length;
    const clientes = leads.filter(ehCliente).length;
    const faturado = vendas.reduce((s, v) => s + num(v.valor_total), 0);
    const barra = (rot, n, max, dir, cor) => `
      <div class="bar-linha"><div class="bar-top"><span>${rot}</span><span>${dir}</span></div>
        <div class="barra"><i style="width:${Math.max(2, Math.round((n / (max || 1)) * 100))}%;${cor ? 'background:' + cor : ''}"></i></div></div>`;
    const porStatus = Object.keys(STATUS_INFO).map((k) => [k, leads.filter((l) => l.status === k).length]);
    const porFase = fasesAtivas().map((f) => [f, leads.filter((l) => l.status === 'tratativa' && l.fase_id === f.id).length]);
    const maxFase = Math.max(1, ...porFase.map((x) => x[1]));
    const porResp = S.usuarios.filter((u) => u.ativo === 'SIM').map((u) => {
      const meus = leads.filter((l) => l.responsavel_id === u.id);
      return { nome: u.nome, total: meus.length, tratativa: meus.filter((l) => l.status === 'tratativa').length, ganhos: meus.filter((l) => l.status === 'ganho').length, diag: meus.filter(temDiag).length };
    }).filter((x) => x.total);
    const maxResp = Math.max(1, ...porResp.map((x) => x.total));

    return `
      <div class="page-head"><h2>Painel</h2>
        <div class="acoes">
          <button class="btn sm line" data-act="distribuir" data-loading=" Distribuindo...">Distribuir</button>
          <button class="btn sm line" data-act="exportar">${I.download}CSV</button>
        </div></div>
      <div class="resumo" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
        <div><b class="num">${leads.length}</b><span>Inscritos</span></div>
        <div><b class="num">${comDiag}</b><span>Fizeram o diagnóstico</span></div>
        <div><b class="num">${leads.filter((l) => l.confirmou_live === 'sim').length}</b><span>Confirmaram a abertura</span></div>
        <div><b class="num">${leads.filter(jaComprou).length}</b><span>Já compraram da 4blue</span></div>
        <div class="destaque"><b class="num">${leads.filter((l) => l.status === 'ganho').length}</b><span>Compraram</span></div>
        <div class="destaque"><b class="num">${brlCurto(faturado)}</b><span>Faturado</span></div>
      </div>
      <div class="grid-painel">
        <section class="card bloco">
          <h3>Onde estão os inscritos</h3>
          ${porStatus.map(([k, n]) => barra(STATUS_INFO[k].plural, n, total, `${n} · ${Math.round((n / total) * 100)}%`, STATUS_INFO[k].cor)).join('')}
        </section>
        <section class="card bloco">
          <h3>Funil por fase</h3>
          ${porFase.length ? porFase.map(([f, n]) => barra(esc(f.nome), n, maxFase, String(n), f.cor)).join('') : '<p class="muted small">Nenhum lead em tratativa.</p>'}
        </section>
        <section class="card bloco">
          <h3>Ranking dos leads</h3>
          <p class="small muted" style="margin:-8px 0 12px">Porte da empresa, dor medida pelo diagnóstico e o que a pessoa fez na campanha.</p>
          ${Object.entries(CLASSIF).sort((a, b) => b[1].ordem - a[1].ordem).map(([k, v]) => {
            const n = leads.filter((l) => l.classificacao === k).length;
            const cor = { quente: '#E8B931', mql_mais: '#C9A227', mql: '#22C55E', viavel: '#60A5FA', sem_dados: '#A78BFA', baixo: '#6B7078', fora: '#3A3A41', cliente: '#F05252' }[k];
            return barra(v.ico + ' ' + v.rot, n, total, `${n} · ${Math.round((n / total) * 100)}%`, cor);
          }).join('')}
          ${clientes ? `<div class="caixa erro" style="margin-top:10px"><b>${clientes} ${clientes === 1 ? 'inscrito já é cliente ativo' : 'inscritos já são clientes ativos'}</b><div class="small" style="margin-top:3px">Eles já têm um produto maior que o Combo. Não devem receber a oferta.</div></div>` : ''}
        </section>
        <section class="card bloco">
          <h3>Por atendente</h3>
          ${porResp.length ? porResp.map((r) => barra(esc(r.nome), r.total, maxResp, `${r.total} leads · ${r.tratativa} em conversa · ${r.diag} c/ diag · ${r.ganhos} vendas`)).join('') : '<p class="muted small">Ninguém com leads ainda.</p>'}
        </section>
        <section class="card bloco" style="grid-column:1/-1">
          <h3>Últimas ações</h3>
          <div class="feed">${(S.historico || []).slice(0, 40).map((h) => {
            const l = S.leads.find((x) => x.id === h.lead_id);
            return `<div class="feed-item" ${l ? `data-act="abrir" data-id="${l.id}" style="cursor:pointer"` : ''}>
              <span class="feed-dot" style="background:${corAcao(h.acao)}"></span>
              <div style="flex:1;min-width:0"><div><b>${esc(h.usuario_nome)}</b> · ${esc(ROT_ACAO[h.acao] || h.acao)}${l ? ' — ' + esc(l.nome) : ''}</div>
              ${h.detalhe ? `<div class="small muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.detalhe)}</div>` : ''}
              <div class="quando">${rel(h.data)}</div></div></div>`;
          }).join('') || '<p class="muted small">Sem atividade ainda.</p>'}</div>
        </section>
      </div>`;
  }

  function leadsFiltradosAdmin() {
    const A = S.adm;
    let ls = aplicaBusca(S.leads);
    if (A.status !== 'todos') ls = ls.filter((l) => l.status === A.status);
    if (A.resp !== 'todos') ls = ls.filter((l) => (A.resp === '__sem' ? !l.responsavel_id : l.responsavel_id === A.resp));
    if (A.classe !== 'todos') ls = ls.filter((l) => l.classificacao === A.classe);
    if (A.origem !== 'todos') ls = ls.filter((l) => (l.origem || '—') === A.origem);
    if (A.cliente === 'sim') ls = ls.filter(ehCliente);
    else if (A.cliente === 'nao') ls = ls.filter((l) => !ehCliente(l));
    else if (A.cliente === 'diag') ls = ls.filter(temDiag);
    else if (A.cliente === 'sem_diag') ls = ls.filter((l) => !temDiag(l));
    else if (A.cliente === 'ja_comprou') ls = ls.filter(jaComprou);
    else if (A.cliente === 'historico') ls = ls.filter(temHist);
    return ls.sort(ordenar(null));
  }

  function viewLeadsAdmin() {
    const A = S.adm;
    const ls = leadsFiltradosAdmin();
    const base = aplicaBusca(S.leads);
    const sel = (k, v, r) => `<option value="${v}" ${A[k] === v ? 'selected' : ''}>${r}</option>`;
    const origens = Array.from(new Set(S.leads.map((l) => l.origem || '—'))).sort();
    return `
      <div class="page-head"><h2>Leads</h2>
        <div class="acoes">
          <button class="btn sm line" data-act="importar">${I.upload}Importar</button>
          <button class="btn sm line" data-act="exportar">${I.download}CSV</button>
          <button class="btn sm ouro" data-act="novo-lead">${I.mais}Lead</button>
        </div></div>
      <div class="busca">${I.busca}<input class="input" data-busca placeholder="Buscar nome, empresa, telefone, e-mail" value="${esc(S.busca)}"></div>
      <div class="chips">${[['todos', 'Todos', base.length]].concat(Object.keys(STATUS_INFO).map((k) => [k, STATUS_INFO[k].sing, base.filter((l) => l.status === k).length]))
        .map(([k, r, n]) => `<button class="chip ${A.status === k ? 'on' : ''}" data-adm-status="${k}">${r}<span class="n">${n}</span></button>`).join('')}</div>
      <div class="filtros-linha">
        <select class="input" data-adm="resp"><option value="todos">Todas as atendentes</option><option value="__sem" ${A.resp === '__sem' ? 'selected' : ''}>Sem responsável</option>${S.usuarios.map((u) => `<option value="${u.id}" ${A.resp === u.id ? 'selected' : ''}>${esc(u.nome)}</option>`).join('')}</select>
        <select class="input" data-adm="classe">${sel('classe', 'todos', 'Ranking: todos')}${Object.entries(CLASSIF).sort((a, b) => b[1].ordem - a[1].ordem).map(([k, v]) => sel('classe', k, v.ico + ' ' + v.rot)).join('')}</select>
        <select class="input" data-adm="cliente">${sel('cliente', 'todos', 'Todos')}${sel('cliente', 'diag', 'Com diagnóstico')}${sel('cliente', 'sem_diag', 'Sem diagnóstico')}${sel('cliente', 'ja_comprou', '★ Já compraram da 4blue')}${sel('cliente', 'historico', 'Já passaram por outra campanha')}${sel('cliente', 'sim', '⛔ Já são clientes')}${sel('cliente', 'nao', 'Não são clientes')}</select>
        <select class="input" data-adm="origem"><option value="todos">Todas as origens</option>${origens.map((o) => `<option value="${esc(o)}" ${A.origem === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
      </div>
      ${botoesOrdem()}
      <p class="muted small" style="margin:0 0 10px">${ls.length} lead${ls.length === 1 ? '' : 's'} · o CSV exporta esta lista filtrada</p>
      ${ls.length ? `<div class="lista">${ls.slice(0, S.limite).map(cardLead).join('')}</div>
        ${ls.length > S.limite ? `<div class="mais"><button class="btn line" data-act="mais">Mostrar mais (${ls.length - S.limite})</button></div>` : ''}`
        : '<div class="vazio">' + I.busca + '<p>Nenhum lead com esses filtros.</p></div>'}`;
  }

  async function distribuir() {
    const sim = await api('admin.distribuir', { simular: true });
    if (!sim.distribuidos) return toast('Não há leads sem responsável.', 'ok');
    const txt = Object.entries(sim.por_usuario).map(([k, v]) => `${k}: ${v}`).join('\n');
    if (!confirm(`Distribuir ${sim.distribuidos} leads entre ${sim.atendentes} atendentes?\n\n${txt}`)) return;
    const r = await api('admin.distribuir', {});
    toast(`${r.distribuidos} leads distribuídos.`, 'ok');
    await carregar();
  }

  function viewEquipe() {
    return `
      <div class="page-head"><h2>Equipe</h2>
        <div class="acoes"><button class="btn sm ouro" data-act="novo-usuario">${I.mais}Pessoa</button></div></div>
      <p class="muted small" style="margin-bottom:12px">Quem está marcado para receber leads entra na divisão automática. A coordenação só entra se você marcar.</p>
      <div class="lista">${S.usuarios.map((u) => {
        const meus = S.leads.filter((l) => l.responsavel_id === u.id);
        return `<article class="card lead">
          <div class="lead-top" data-act="editar-usuario" data-id="${u.id}">
            ${avatarHtml(u)}
            <div class="lead-main"><h3>${esc(u.nome)}</h3>
              <div class="meta">${esc(u.email)}</div>
              <div class="meta">${u.perfil === 'coordenador' ? 'Coordenação' : 'Atendente'} · ${u.ativo === 'SIM' ? 'ativa' : 'desativada'}</div></div>
            <button class="btn line icon sm" data-act="editar-usuario" data-id="${u.id}" aria-label="Editar">${I.editar}</button>
          </div>
          <div class="tags">
            <span class="tag">${meus.length} leads</span>
            <span class="tag">${meus.filter((l) => l.status === 'tratativa').length} em conversa</span>
            <span class="tag ok">${meus.filter((l) => l.status === 'ganho').length} vendas</span>
            ${u.recebe_leads === 'SIM' ? '<span class="tag c-quente">Recebe leads</span>' : '<span class="tag">Não recebe leads</span>'}
          </div>
        </article>`;
      }).join('')}</div>`;
  }

  function abrirFormUsuario(id) {
    const u = id ? S.usuarios.find((x) => x.id === id) : null;
    abrirSheet({
      titulo: u ? 'Editar pessoa' : 'Nova pessoa',
      corpo: `
        <div class="field"><label>Nome *</label><input class="input" id="u-nome" value="${esc(u ? u.nome : '')}"></div>
        <div class="field"><label>E-mail (é o login) *</label><input class="input" id="u-email" inputmode="email" value="${esc(u ? u.email : '')}"></div>
        <div class="field"><label>Senha ${u ? '(deixe vazio para não mudar)' : '*'}</label><input class="input" type="password" id="u-senha" placeholder="mínimo 6 caracteres"></div>
        <div class="field"><label>Função</label><select class="input" id="u-perfil">
          <option value="atendente" ${u && u.perfil === 'atendente' ? 'selected' : ''}>Atendente</option>
          <option value="coordenador" ${u && u.perfil === 'coordenador' ? 'selected' : ''}>Coordenação</option>
        </select></div>
        <label class="check"><input type="checkbox" id="u-recebe" ${!u || u.recebe_leads === 'SIM' ? 'checked' : ''}><span>Recebe leads na divisão automática</span></label>
        <label class="check"><input type="checkbox" id="u-ativo" ${!u || u.ativo === 'SIM' ? 'checked' : ''}><span>Conta ativa (desmarque para bloquear o acesso)</span></label>`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn ouro" id="u-salvar" data-loading=" Salvando...">Salvar</button>`,
      onMount: (sh) => {
        sh.querySelector('#u-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          await api('admin.usuario.salvar', { usuario: {
            id: u ? u.id : '', nome: sh.querySelector('#u-nome').value, email: sh.querySelector('#u-email').value,
            senha: sh.querySelector('#u-senha').value, perfil: sh.querySelector('#u-perfil').value,
            recebe_leads: sh.querySelector('#u-recebe').checked ? 'SIM' : 'NAO',
            ativo: sh.querySelector('#u-ativo').checked ? 'SIM' : 'NAO'
          } });
          fecharSheet(); toast('Equipe atualizada.', 'ok'); await carregar();
        }));
      }
    });
  }

  function viewCatalogo() {
    const abas = [['fases', 'Fases do funil'], ['mensagens', 'Mensagens'], ['produtos', 'Produtos']];
    const c = S.catalogo;
    return `
      <div class="page-head"><h2>Funil e mensagens</h2></div>
      <div class="chips">${abas.map(([k, r]) => `<button class="chip ${c === k ? 'on' : ''}" data-act="cat" data-cat="${k}">${r}</button>`).join('')}</div>
      ${c === 'fases' ? `
        <div class="page-head"><h2 style="font-size:16px">Fases</h2><div class="acoes"><button class="btn sm ouro" data-act="nova-fase">${I.mais}Fase</button></div></div>
        <div class="lista">${fasesOrdenadasUI().map((f) => `
          <article class="card lead">
            <div class="lead-top" data-act="editar-fase" data-id="${f.id}">
              <span class="fase-cor" style="background:${esc(f.cor)};width:14px;height:14px;margin-top:5px"></span>
              <div class="lead-main"><h3>${esc(f.nome)}</h3>
                <div class="meta">${S.leads.filter((l) => l.fase_id === f.id).length} leads · ordem ${esc(f.ordem)}${f.ativo === 'NAO' ? ' · desativada' : ''}</div></div>
              <button class="btn line icon sm" data-act="editar-fase" data-id="${f.id}" aria-label="Editar">${I.editar}</button>
            </div>
            ${f.instrucoes ? `<div class="mini"><span>${esc(String(f.instrucoes).split('\n')[0])}</span></div>` : ''}
          </article>`).join('')}</div>`
      : c === 'mensagens' ? `
        <div class="page-head"><h2 style="font-size:16px">Mensagens</h2><div class="acoes"><button class="btn sm ouro" data-act="nova-msg">${I.mais}Mensagem</button></div></div>
        <p class="muted small" style="margin-bottom:12px">Use <code>{primeiro_nome}</code>, <code>{usuario}</code>, <code>{empresa}</code>, <code>{link_diagnostico}</code>, <code>{data_abertura}</code> e <code>{hora_abertura}</code>.</p>
        <div class="lista">${S.mensagens.map((m) => {
          const f = S.fases.find((x) => x.id === m.fase_id);
          return `<article class="card lead">
            <div class="lead-top" data-act="editar-msg" data-id="${m.id}">
              <div class="lead-main"><h3>${esc(m.titulo)}</h3>
                <div class="meta">${f ? esc(f.nome) : 'Todas as fases'}${m.ativo === 'NAO' ? ' · desativada' : ''}</div></div>
              <button class="btn line icon sm" data-act="editar-msg" data-id="${m.id}" aria-label="Editar">${I.editar}</button>
            </div>
            <div class="mini"><span style="white-space:pre-wrap">${esc(String(m.texto).slice(0, 160))}${String(m.texto).length > 160 ? '...' : ''}</span></div>
          </article>`;
        }).join('')}</div>`
      : `
        <div class="page-head"><h2 style="font-size:16px">Produtos</h2><div class="acoes"><button class="btn sm ouro" data-act="novo-produto">${I.mais}Produto</button></div></div>
        <p class="muted small" style="margin-bottom:12px">Usados ao registrar uma venda à mão. No dia da abertura as compras entram sozinhas pela Hotmart.</p>
        <div class="lista">${S.produtos.map((p) => `
          <article class="card lead">
            <div class="lead-top" data-act="editar-produto" data-id="${p.id}">
              <div class="lead-main"><h3>${esc(p.nome)}</h3><div class="meta">${brl(p.valor_total)}${p.parcelas ? ' em ' + esc(p.parcelas) + 'x' : ''}${p.ativo === 'NAO' ? ' · desativado' : ''}</div></div>
              <button class="btn line icon sm" data-act="editar-produto" data-id="${p.id}" aria-label="Editar">${I.editar}</button>
            </div>
          </article>`).join('') || '<p class="muted small">Nenhum produto cadastrado.</p>'}</div>`}`;
  }
  const fasesOrdenadasUI = () => S.fases.slice().sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0));

  function abrirFormFase(id) {
    const f = id ? S.fases.find((x) => x.id === id) : null;
    const cores = ['#8A939B', '#0369B1', '#C9A227', '#E8B931', '#F5DE8B', '#22C55E', '#A78BFA', '#F05252'];
    abrirSheet({
      titulo: f ? 'Editar fase' : 'Nova fase',
      corpo: `
        <div class="field"><label>Nome *</label><input class="input" id="f-nome" value="${esc(f ? f.nome : '')}"></div>
        <div class="row">
          <div class="field"><label>Ordem</label><input class="input" id="f-ordem" inputmode="numeric" value="${esc(f ? f.ordem : String(S.fases.length + 1))}"></div>
          <div class="field"><label>Cor</label><select class="input" id="f-cor">${cores.map((c) => `<option value="${c}" ${f && f.cor === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>O que fazer nesta fase</label><textarea class="input" id="f-inst" placeholder="Uma instrução por linha">${esc(f ? f.instrucoes : '')}</textarea></div>
        <label class="check"><input type="checkbox" id="f-ativo" ${!f || f.ativo !== 'NAO' ? 'checked' : ''}><span>Fase ativa</span></label>
        ${f ? `<button class="btn line bloco perigo" data-act="excluir-fase" data-id="${f.id}">${I.lixo}Excluir fase</button>` : ''}`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn ouro" id="f-salvar" data-loading=" Salvando...">Salvar</button>`,
      onMount: (sh) => {
        sh.querySelector('#f-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          await api('fase.salvar', { fase: {
            id: f ? f.id : '', nome: sh.querySelector('#f-nome').value, ordem: sh.querySelector('#f-ordem').value,
            cor: sh.querySelector('#f-cor').value, instrucoes: sh.querySelector('#f-inst').value,
            ativo: sh.querySelector('#f-ativo').checked ? 'SIM' : 'NAO'
          } });
          fecharSheet(); toast('Fase salva.', 'ok'); await carregar();
        }));
      }
    });
  }

  function abrirFormMensagem(id) {
    const m = id ? S.mensagens.find((x) => x.id === id) : null;
    abrirSheet({
      titulo: m ? 'Editar mensagem' : 'Nova mensagem',
      corpo: `
        <div class="field"><label>Título *</label><input class="input" id="m-titulo" value="${esc(m ? m.titulo : '')}"></div>
        <div class="field"><label>Texto *</label><textarea class="input" id="m-texto" style="min-height:150px">${esc(m ? m.texto : '')}</textarea>
          <p class="hint">Variáveis: {primeiro_nome} {nome} {usuario} {empresa} {link_diagnostico} {link_live} {data_abertura} {hora_abertura}</p></div>
        <div class="row">
          <div class="field"><label>Fase</label><select class="input" id="m-fase"><option value="">Todas as fases</option>
            ${fasesOrdenadasUI().map((f) => `<option value="${f.id}" ${m && m.fase_id === f.id ? 'selected' : ''}>${esc(f.nome)}</option>`).join('')}</select></div>
          <div class="field"><label>Ordem</label><input class="input" id="m-ordem" inputmode="numeric" value="${esc(m ? m.ordem : String(S.mensagens.length + 1))}"></div>
        </div>
        <label class="check"><input type="checkbox" id="m-ativo" ${!m || m.ativo !== 'NAO' ? 'checked' : ''}><span>Mensagem ativa</span></label>
        ${m ? `<button class="btn line bloco perigo" data-act="excluir-msg" data-id="${m.id}">${I.lixo}Excluir mensagem</button>` : ''}`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn ouro" id="m-salvar" data-loading=" Salvando...">Salvar</button>`,
      onMount: (sh) => {
        sh.querySelector('#m-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          await api('mensagem.salvar', { mensagem: {
            id: m ? m.id : '', titulo: sh.querySelector('#m-titulo').value, texto: sh.querySelector('#m-texto').value,
            fase_id: sh.querySelector('#m-fase').value, ordem: sh.querySelector('#m-ordem').value,
            ativo: sh.querySelector('#m-ativo').checked ? 'SIM' : 'NAO'
          } });
          fecharSheet(); toast('Mensagem salva.', 'ok'); await carregar();
        }));
      }
    });
  }

  function abrirFormProduto(id) {
    const p = id ? S.produtos.find((x) => x.id === id) : null;
    abrirSheet({
      titulo: p ? 'Editar produto' : 'Novo produto',
      corpo: `
        <div class="field"><label>Nome *</label><input class="input" id="pr-nome" value="${esc(p ? p.nome : '')}"></div>
        <div class="row">
          <div class="field"><label>Valor total (R$)</label><input class="input" id="pr-total" inputmode="decimal" value="${esc(p ? p.valor_total : '')}"></div>
          <div class="field"><label>Parcelas</label><input class="input" id="pr-parc" inputmode="numeric" value="${esc(p ? p.parcelas : '')}"></div>
        </div>
        <div class="field"><label>Descrição</label><textarea class="input" id="pr-desc">${esc(p ? p.descricao : '')}</textarea></div>
        <label class="check"><input type="checkbox" id="pr-ativo" ${!p || p.ativo !== 'NAO' ? 'checked' : ''}><span>Produto ativo</span></label>`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn ouro" id="pr-salvar" data-loading=" Salvando...">Salvar</button>`,
      onMount: (sh) => {
        sh.querySelector('#pr-salvar').addEventListener('click', (ev) => comBotao(ev.currentTarget, async () => {
          await api('produto.salvar', { produto: {
            id: p ? p.id : '', nome: sh.querySelector('#pr-nome').value, valor_total: sh.querySelector('#pr-total').value,
            parcelas: sh.querySelector('#pr-parc').value, descricao: sh.querySelector('#pr-desc').value,
            ativo: sh.querySelector('#pr-ativo').checked ? 'SIM' : 'NAO'
          } });
          fecharSheet(); toast('Produto salvo.', 'ok'); await carregar();
        }));
      }
    });
  }

  /* --------------------------------------------------------------- ajustes */
  function viewAjustes() {
    const c = S.config || {};
    return `
      <div class="page-head"><h2>Ajustes</h2></div>
      <div class="grid-painel">
        <section class="card bloco">
          <h3>A campanha</h3>
          <div class="field"><label>Nome do sistema</label><input class="input" id="cfg-nome" value="${esc(c.nome_sistema || '')}"></div>
          <div class="row">
            <div class="field"><label>Data da abertura</label><input class="input" type="date" id="cfg-data" value="${esc(c.data_abertura || '')}"></div>
            <div class="field"><label>Hora</label><input class="input" type="time" id="cfg-hora" value="${esc(c.hora_abertura || '')}"></div>
          </div>
          <div class="field"><label>Link do diagnóstico</label><input class="input" id="cfg-diag-url" value="${esc(c.diagnostico_url || '')}"></div>
          <div class="field"><label>Link da página de inscrição</label><input class="input" id="cfg-insc-url" value="${esc(c.inscricao_url || '')}"></div>
          <div class="field"><label>Link da live de abertura</label><input class="input" id="cfg-live-url" value="${esc(c.live_url || '')}"></div>
          <label class="check"><input type="checkbox" id="cfg-dist" ${c.distribuicao_auto ? 'checked' : ''}><span><b>Distribuir automaticamente:</b> todo inscrito já cai para a atendente com menos leads em aberto.</span></label>
          <label class="check"><input type="checkbox" id="cfg-gerencia" ${c.quem_gerencia === 'todos' ? 'checked' : ''}><span>Deixar as atendentes criarem fases, mensagens e produtos</span></label>
          <button class="btn ouro sm" data-act="salvar-config" data-loading=" Salvando...">Salvar</button>
        </section>

        <section class="card bloco">
          <h3>Captação — webhook do ActiveCampaign</h3>
          <p class="small muted" style="margin:-8px 0 12px">Cole esta URL no passo <b>Webhook</b> da automação que roda quando alguém se inscreve. Cada inscrito entra no sistema e já é distribuído. Use sempre o endereço terminado em <code>/exec</code> — o <code>/dev</code> do editor pede login e não funciona para ferramentas de fora.</p>
          <div class="url-bloco">
            <div class="url-tit"><b>Inscrição na Black Friday</b><span class="tag">src=inscricao</span></div>
            <div class="copiar"><input class="input" readonly id="w-insc" value="${esc(c.webhook_inscricao || '')}"><button class="btn ouro" data-act="copiar-campo" data-alvo="w-insc">Copiar</button></div>
            <details class="rank-por"><summary>Se o Active não conseguir enviar o corpo do webhook</summary>
              <p class="small muted" style="margin:8px 0">Esta versão leva os dados na própria URL e funciona por POST e por GET. As tags são preenchidas pelo Active.</p>
              <div class="copiar"><input class="input" readonly id="w-insc-get" value="${esc(c.webhook_inscricao_get || '')}"><button class="btn line" data-act="copiar-campo" data-alvo="w-insc-get">Copiar</button></div>
            </details>
          </div>
          ${c.ac_tag_inscricao ? `<p class="hint">Tag do Active que marca o inscrito: <b>${esc(c.ac_tag_inscricao)}</b></p>` : ''}
          <div class="secao">Já tem gente inscrita?</div>
          <p class="small muted" style="margin:-6px 0 10px">Traga quem se inscreveu antes do webhook ser ligado. Quem já está no sistema é ignorado, ninguém duplica.</p>
          <button class="btn line sm" data-act="importar">${I.upload}Importar planilha de inscritos</button>
        </section>

        <section class="card bloco">
          <h3>Venda — webhook da Hotmart</h3>
          <p class="small muted" style="margin:-8px 0 12px">Cole no Postback/Webhook da Hotmart. Quando a compra do Combo for aprovada, o lead vira <b>Comprou</b> sozinho e a venda é registrada.</p>
          <div class="copiar" style="margin-bottom:12px"><input class="input" readonly id="w-hot" value="${esc(c.webhook_hotmart || '')}"><button class="btn ouro" data-act="copiar-campo" data-alvo="w-hot">Copiar</button></div>
          <div class="field"><label>Produtos da Hotmart (um por linha: ID ; nome)</label>
            <textarea class="input" id="cfg-prods" placeholder="1234567;Combo Vitalício de Cursos">${esc(c.hotmart_produtos_txt || '')}</textarea>
            <p class="hint">Deixe vazio até a oferta subir: enquanto estiver vazio, qualquer compra aprovada é aceita.</p></div>
          <label class="check"><input type="checkbox" id="cfg-teste" ${c.modo_teste ? 'checked' : ''}><span>Aceitar o produto de teste da Hotmart (id 0) — use só para testar o webhook</span></label>
          <button class="btn ouro sm" data-act="salvar-config" data-loading=" Salvando...">Salvar</button>
          ${(c.webhooks || []).length ? `<div class="secao">Últimos webhooks recebidos</div>
            <div class="feed">${c.webhooks.map((w) => `
              <div class="feed-item"><span class="feed-dot" style="background:${w.status === 'ok' ? '#22C55E' : w.status === 'erro' ? '#F05252' : '#6B7078'}"></span>
                <div style="flex:1;min-width:0"><div><b>${esc(w.tipo)}</b> · ${esc(w.identificacao || '—')}</div>
                <div class="small muted">${esc(w.resultado || w.status)}</div>
                <div class="quando">${rel(w.recebido_em)}</div></div></div>`).join('')}</div>` : ''}
        </section>

        <section class="card bloco">
          <h3>Diagnóstico Máquina de Lucros</h3>
          <p class="small muted" style="margin:-8px 0 12px">O sistema lê a planilha de respostas a cada 15 minutos e preenche o card de quem já é inscrito: faturamento, lucro, índice geral, os 8 pilares e o custo de ineficiência.</p>
          <div class="row">
            <div class="field"><label>ID da planilha</label><input class="input" id="cfg-diag-id" value="${esc(c.diag_planilha_id || '')}"></div>
            <div class="field" style="max-width:180px"><label>Aba</label><input class="input" id="cfg-diag-aba" value="${esc(c.diag_aba || '')}"></div>
          </div>
          <label class="check"><input type="checkbox" id="cfg-diag-criar" ${c.diag_criar_lead ? 'checked' : ''}><span>Criar lead para quem fez o diagnóstico e não está inscrito</span></label>
          <p class="small muted">Última leitura: <b>${c.diag_ultima_sinc ? fmtData(c.diag_ultima_sinc) : 'nunca'}</b></p>
          <div class="row" style="flex-wrap:wrap;margin-top:10px">
            <button class="btn line sm" data-act="salvar-config" data-loading=" Salvando...">Salvar</button>
            <button class="btn ouro sm" data-act="sinc-diag" data-loading=" Lendo...">${I.refresh}Ler agora</button>
          </div>
          <div id="res-diag" style="margin-top:10px"></div>
        </section>

        <section class="card bloco">
          <h3>Base de clientes da 4blue</h3>
          <p class="small muted" style="margin:-8px 0 12px">Cruza os inscritos com quem é Mamber do MDL, Iluminista e quem já foi a eventos anteriores. <b>Cliente ativo é marcado em vermelho e sai do topo da lista</b> — já tem um produto maior que o Combo.</p>
          <div class="field"><label>ID da planilha da base</label><input class="input" id="cfg-base-id" value="${esc(c.base_id || '')}"></div>
          <p class="small muted">Última sincronização: <b>${c.ultima_sincronizacao ? fmtData(c.ultima_sincronizacao) : 'nunca'}</b></p>
          <div class="row" style="flex-wrap:wrap;margin-top:10px">
            <button class="btn line sm" data-act="salvar-config" data-loading=" Salvando...">Salvar</button>
            <button class="btn ouro sm" data-act="sinc-clientes" data-loading=" Cruzando...">${I.refresh}Cruzar agora</button>
          </div>
          <div id="res-clientes" style="margin-top:10px"></div>
        </section>

        <section class="card bloco">
          <h3>Campanhas anteriores do comercial</h3>
          <p class="small muted" style="margin:-8px 0 12px">O sistema lê a aba <b>Leads</b> dos outros sistemas de tratativas e traz para o card: por quais campanhas a pessoa passou, como cada uma terminou, quem atendeu e o perfil que o comercial já coletou (cargo, empresa, cidade). Quem foi perdido como <b>"Já é Mamber"</b> entra aqui como cliente ativo.</p>
          <div class="field"><label>Planilhas (uma por linha: ID ; apelido)</label>
            <textarea class="input" id="cfg-hist" style="min-height:110px;font-family:ui-monospace,Menlo,monospace;font-size:12px">${esc(c.hist_planilhas || '')}</textarea>
            <p class="hint">O ID é o trecho do link entre <code>/d/</code> e <code>/edit</code>. A conta que roda o script precisa ter acesso a cada planilha.</p></div>
          <label class="check"><input type="checkbox" id="cfg-hist-seguir" ${c.hist_seguir_atendente ? 'checked' : ''}><span><b>Devolver o lead para quem já atendeu:</b> se a pessoa já foi atendida por alguém que está no time, ela volta para a mesma atendente em vez de entrar no rodízio.</span></label>
          <p class="small muted">Última leitura: <b>${c.hist_ultima_sinc ? fmtData(c.hist_ultima_sinc) : 'nunca'}</b></p>
          <div class="row" style="flex-wrap:wrap;margin-top:10px">
            <button class="btn line sm" data-act="salvar-config" data-loading=" Salvando...">Salvar</button>
            <button class="btn ouro sm" data-act="sinc-hist" data-loading=" Cruzando...">${I.refresh}Cruzar agora</button>
          </div>
          <div id="res-hist" style="margin-top:10px"></div>
        </section>

        <section class="card bloco">
          <h3>Marcar em lote</h3>
          <p class="small muted" style="margin:-8px 0 12px">Suba uma planilha com e-mails ou telefones para marcar a jornada de várias pessoas de uma vez — útil com a lista de quem assistiu a abertura.</p>
          <div class="row" style="flex-wrap:wrap">
            <button class="btn line sm" data-act="imp-marcos" data-tipo="participou">${I.upload}Assistiram a abertura</button>
            <button class="btn line sm" data-act="imp-marcos" data-tipo="confirmou_live">${I.upload}Confirmaram presença</button>
            <button class="btn line sm" data-act="imp-marcos" data-tipo="contato">${I.upload}Já foram contatados</button>
          </div>
        </section>

        <section class="card bloco">
          <h3>Leads duplicados</h3>
          <p class="small muted" style="margin:-8px 0 12px">A mesma pessoa nunca pode virar dois leads — isso coloca duas atendentes falando com ela. O sistema já evita, mas use isto se alguma importação criar repetidos.</p>
          <div class="row" style="flex-wrap:wrap;margin-bottom:10px">
            <button class="btn line sm" data-act="dup-ver" data-loading=" Procurando...">${I.busca}Procurar</button>
            <button class="btn ouro sm" data-act="dup-juntar" data-loading=" Juntando...">Juntar automaticamente</button>
          </div>
          <div id="dup-res"></div>
          <p class="hint" style="margin-top:14px">Versão do sistema: ${esc(c.versao || '—')}</p>
        </section>
      </div>`;
  }

  async function salvarConfig() {
    const g = (id) => { const e = document.getElementById(id); return e ? e.value : undefined; };
    const ck = (id) => { const e = document.getElementById(id); return e ? e.checked : undefined; };
    const cfg = {};
    const mapa = {
      NOME_SISTEMA: g('cfg-nome'), DATA_ABERTURA: g('cfg-data'), HORA_ABERTURA: g('cfg-hora'),
      DIAGNOSTICO_URL: g('cfg-diag-url'), INSCRICAO_URL: g('cfg-insc-url'), LIVE_URL: g('cfg-live-url'),
      HOTMART_PRODUTOS: g('cfg-prods'), DIAG_PLANILHA_ID: g('cfg-diag-id'), DIAG_ABA: g('cfg-diag-aba'),
      BASE_CLIENTES_ID: g('cfg-base-id'), HIST_PLANILHAS: g('cfg-hist')
    };
    Object.keys(mapa).forEach((k) => { if (mapa[k] !== undefined) cfg[k] = mapa[k]; });
    if (ck('cfg-dist') !== undefined) cfg.DISTRIBUICAO_AUTO = ck('cfg-dist') ? 'SIM' : 'NAO';
    if (ck('cfg-gerencia') !== undefined) cfg.QUEM_GERENCIA = ck('cfg-gerencia') ? 'todos' : 'coordenador';
    if (ck('cfg-teste') !== undefined) cfg.HOTMART_MODO_TESTE = ck('cfg-teste') ? 'SIM' : 'NAO';
    if (ck('cfg-diag-criar') !== undefined) cfg.DIAG_CRIAR_LEAD = ck('cfg-diag-criar') ? 'SIM' : 'NAO';
    if (ck('cfg-hist-seguir') !== undefined) cfg.HIST_SEGUIR_ATENDENTE = ck('cfg-hist-seguir') ? 'SIM' : 'NAO';
    S.config = await api('admin.config', { config: cfg });
    toast('Ajustes salvos.', 'ok');
    await carregar();
  }

  function caixaDup(d, titulo) {
    const box = document.getElementById('dup-res');
    if (!box) return;
    const gs = d.grupos || [];
    box.innerHTML = `<div class="caixa ${gs.length ? 'aviso' : 'ok'}"><b>${esc(titulo)}</b>
      ${gs.length ? gs.map((g) => `<div class="dup-grupo">${g.leads.map((l) => `
        <div class="dup-lead ${l.principal ? 'fica' : ''}"><span class="dup-tag">${l.principal ? 'FICA' : 'junta'}</span>
          <b>${esc(l.nome)}</b><span class="muted small">${esc(l.responsavel_nome || 'sem responsável')} · ${esc(l.status)} · ${l.acoes} ações</span></div>`).join('')}</div>`).join('') : ''}</div>`;
  }
  async function verDuplicados() {
    const d = await api('admin.duplicados', {});
    caixaDup(d, d.grupos.length ? `${d.grupos.length} pessoa(s) com mais de um lead` : 'Nenhum duplicado. Está tudo certo.');
  }
  async function juntarDuplicados() {
    const sim = await api('admin.duplicados.juntar', { simular: true });
    if (!sim.grupos) { caixaDup({ grupos: [] }, 'Nenhum duplicado encontrado.'); return; }
    const txt = sim.detalhes.map((d) => `• ${d.nome} → fica com ${d.responsavel}`).join('\n');
    if (!confirm(`Juntar ${sim.juntados} lead(s) duplicado(s) em ${sim.grupos} pessoa(s)?\n\n${txt}\n\nO histórico e as vendas vão para o lead que fica.`)) return;
    const r = await api('admin.duplicados.juntar', {});
    await carregar();
    caixaDup({ grupos: [] }, `${r.juntados} lead(s) juntados em ${r.grupos} pessoa(s).`);
    toast('Duplicados juntados.', 'ok');
  }

  /* ------------------------------------------------- importação de planilha */
  const CAMPOS_IMP = [['nome', 'Nome'], ['email', 'E-mail'], ['telefone', 'WhatsApp'], ['empresa', 'Empresa'], ['cargo', 'Cargo'], ['cidade', 'Cidade'], ['estado', 'Estado']];
  function detectar(cab) {
    const h = cab.map((x) => norm(x).trim());
    const regras = {
      nome: /^nome|nome completo|first_name|full name|contato/,
      email: /mail/, telefone: /telefone|whats|celular|phone|fone/,
      empresa: /empresa|company|orgname|negocio/, cargo: /cargo|funcao|position/,
      cidade: /cidade|city/, estado: /^estado$|^uf$|state/
    };
    // nome exato primeiro: "Email" ganha de "Emails enviados", que vem antes em exportações do Active
    const exatos = { nome: ['nome', 'nome completo', 'name', 'full name'], email: ['email', 'e-mail', 'e mail'], telefone: ['telefone', 'whatsapp', 'celular', 'phone'] };
    const map = {};
    Object.keys(regras).forEach((k) => {
      let achou = h.findIndex((x) => (exatos[k] || []).includes(x));
      h.forEach((x, i) => { if (achou < 0 && regras[k].test(x)) achou = i; });
      map[k] = achou;
    });
    return map;
  }
  async function lerArquivo(f) {
    const nome = f.name.toLowerCase();
    if (/\.csv$|\.txt$/.test(nome)) {
      const txt = await f.text();
      const sep = (txt.split('\n')[0].match(/;/g) || []).length > (txt.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
      return txt.split(/\r?\n/).filter((l) => l.trim()).map((l) => {
        const out = []; let cur = '', dentro = false;
        for (let i = 0; i < l.length; i++) {
          const c = l[i];
          if (c === '"') { if (dentro && l[i + 1] === '"') { cur += '"'; i++; } else dentro = !dentro; }
          else if (c === sep && !dentro) { out.push(cur); cur = ''; }
          else cur += c;
        }
        out.push(cur);
        return out.map((x) => x.trim());
      });
    }
    if (!window.XLSX) {
      await new Promise((ok, err) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload = ok; s.onerror = () => err(new Error('Não consegui carregar o leitor de Excel. Salve a planilha como CSV.'));
        document.head.appendChild(s);
      });
    }
    const buf = await f.arrayBuffer();
    const wb = window.XLSX.read(buf, { type: 'array' });
    return window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
  }

  function abrirImportar() {
    let dados = null, cab = [], mapa = {}, linhas = [];
    abrirSheet({
      titulo: 'Importar inscritos',
      largo: true,
      corpo: `
        <p class="small muted" style="margin-top:0">Suba a exportação do ActiveCampaign (CSV ou Excel). Quem já está no sistema é ignorado — ninguém duplica. Os novos entram já distribuídos entre as atendentes.</p>
        <div class="field"><label>Arquivo (.csv, .xlsx)</label><input class="input" type="file" accept=".csv,.xlsx,.xls,text/csv" id="i-arq"></div>
        <div id="i-map"></div><div id="i-prev" class="small"></div>`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn line" id="i-sim" disabled data-loading=" Conferindo...">Simular</button><button class="btn ouro" id="i-ok" disabled data-loading=" Importando...">Importar</button>`,
      onMount: (sh) => {
        const $map = sh.querySelector('#i-map'), prev = sh.querySelector('#i-prev');
        const ok = sh.querySelector('#i-ok'), sim = sh.querySelector('#i-sim');
        const pintar = () => {
          const ops = (s) => '<option value="-1">— não usar —</option>' + cab.map((c, i) => `<option value="${i}" ${s === i ? 'selected' : ''}>${esc(c || 'coluna ' + (i + 1))}</option>`).join('');
          $map.innerHTML = `<div class="secao">Confira as colunas</div><div class="row" style="flex-wrap:wrap">${CAMPOS_IMP.map(([k, r]) =>
            `<div class="field" style="min-width:170px"><label>${r}</label><select class="input" data-map="${k}">${ops(mapa[k])}</select></div>`).join('')}</div>`;
          $map.querySelectorAll('[data-map]').forEach((s) => s.addEventListener('change', () => { mapa[s.dataset.map] = Number(s.value); montar(); }));
        };
        const montar = () => {
          const v = (r, k) => (mapa[k] >= 0 ? String(r[mapa[k]] || '').trim() : '');
          linhas = [];
          dados.slice(1).forEach((r) => {
            const item = {};
            CAMPOS_IMP.forEach(([k]) => { item[k] = v(r, k); });
            if (item.email || item.telefone) linhas.push(item);
          });
          prev.innerHTML = `<div class="caixa"><b>${linhas.length} linhas com contato</b> de ${dados.length - 1} no arquivo
            ${linhas.slice(0, 3).map((l) => `<div style="margin-top:4px">• ${esc(l.nome || '')} ${esc(l.email || telFmt(l.telefone))}</div>`).join('')}</div><div id="i-res"></div>`;
          ok.disabled = sim.disabled = !linhas.length;
        };
        sh.querySelector('#i-arq').addEventListener('change', async (e) => {
          const f = e.target.files[0];
          if (!f) return;
          prev.textContent = 'Lendo arquivo...';
          try {
            dados = await lerArquivo(f);
            if (dados.length < 2) throw new Error('Arquivo sem linhas.');
            cab = dados[0];
            mapa = detectar(cab);
            pintar(); montar();
          } catch (err) { prev.innerHTML = `<div class="caixa erro">${esc(err.message)}</div>`; ok.disabled = sim.disabled = true; }
        });
        const enviar = (simular) => async () => {
          const r = await api('admin.importar', { linhas, simular });
          const box = sh.querySelector('#i-res');
          const txt = `${r.criados} novos · ${r.ja_existiam} já estavam no sistema`;
          if (simular) { box.innerHTML = `<div class="caixa aviso" style="margin-top:10px"><b>Simulação — nada foi gravado</b><div>${txt}</div></div>`; return; }
          fecharSheet();
          toast(`${r.criados} inscritos importados · ${r.ja_existiam} já existiam`, 'ok');
          await carregar();
        };
        sim.addEventListener('click', (ev) => comBotao(ev.currentTarget, enviar(true)));
        ok.addEventListener('click', (ev) => comBotao(ev.currentTarget, enviar(false)));
      }
    });
  }

  function abrirImportarMarcos(tipo) {
    const titulos = { participou: 'Assistiram a abertura', confirmou_live: 'Confirmaram presença', contato: 'Já foram contatados' };
    let dados = null, cab = [], mapa = {}, linhas = [];
    abrirSheet({
      titulo: titulos[tipo] || 'Marcar em lote',
      largo: true,
      corpo: `
        <p class="small muted" style="margin-top:0">Precisa apenas da coluna de e-mail ou de telefone. Só marca quem já é inscrito aqui.</p>
        <div class="field"><label>Arquivo (.csv, .xlsx)</label><input class="input" type="file" accept=".csv,.xlsx,.xls,text/csv" id="k-arq"></div>
        <div id="k-map"></div><div id="k-prev" class="small"></div>`,
      rodape: `<button class="btn line" data-x>Cancelar</button><button class="btn line" id="k-sim" disabled data-loading=" Conferindo...">Simular</button><button class="btn ouro" id="k-ok" disabled data-loading=" Marcando...">Marcar</button>`,
      onMount: (sh) => {
        const $map = sh.querySelector('#k-map'), prev = sh.querySelector('#k-prev');
        const ok = sh.querySelector('#k-ok'), sim = sh.querySelector('#k-sim');
        const campos = [['email', 'E-mail'], ['telefone', 'Telefone'], ['nome', 'Nome (só para conferir)']];
        const pintar = () => {
          const ops = (s) => '<option value="-1">— não usar —</option>' + cab.map((c, i) => `<option value="${i}" ${s === i ? 'selected' : ''}>${esc(c || 'coluna ' + (i + 1))}</option>`).join('');
          $map.innerHTML = `<div class="secao">Confira as colunas</div><div class="row" style="flex-wrap:wrap">${campos.map(([k, r]) =>
            `<div class="field" style="min-width:180px"><label>${r}</label><select class="input" data-map="${k}">${ops(mapa[k])}</select></div>`).join('')}</div>`;
          $map.querySelectorAll('[data-map]').forEach((s) => s.addEventListener('change', () => { mapa[s.dataset.map] = Number(s.value); montar(); }));
        };
        const montar = () => {
          const v = (r, k) => (mapa[k] >= 0 ? String(r[mapa[k]] || '').trim() : '');
          linhas = [];
          dados.slice(1).forEach((r) => {
            const item = { email: v(r, 'email'), telefone: v(r, 'telefone'), nome: v(r, 'nome') };
            if (item.email || item.telefone) linhas.push(item);
          });
          prev.innerHTML = `<div class="caixa"><b>${linhas.length} linhas com contato</b></div><div id="k-res"></div>`;
          ok.disabled = sim.disabled = !linhas.length;
        };
        sh.querySelector('#k-arq').addEventListener('change', async (e) => {
          const f = e.target.files[0];
          if (!f) return;
          prev.textContent = 'Lendo arquivo...';
          try {
            dados = await lerArquivo(f);
            if (dados.length < 2) throw new Error('Arquivo sem linhas.');
            cab = dados[0];
            const d = detectar(cab);
            mapa = { email: d.email, telefone: d.telefone, nome: d.nome };
            pintar(); montar();
          } catch (err) { prev.innerHTML = `<div class="caixa erro">${esc(err.message)}</div>`; ok.disabled = sim.disabled = true; }
        });
        const enviar = (simular) => async () => {
          const r = await api('admin.importar.marcos', { tipo, linhas, simular });
          const box = sh.querySelector('#k-res');
          const txt = `${r.encontrados} encontrados · ${r.nao_encontrados} não estão no sistema`;
          if (simular) {
            box.innerHTML = `<div class="caixa aviso" style="margin-top:10px"><b>Simulação — nada foi gravado</b><div>${txt}</div>
              ${r.exemplos_nao_encontrados.length ? `<div class="small" style="margin-top:6px">Não encontrados: ${esc(r.exemplos_nao_encontrados.join(', '))}</div>` : ''}</div>`;
            return;
          }
          fecharSheet();
          toast(`${r.atualizados} leads marcados · ${r.nao_encontrados} não encontrados`, 'ok');
          await carregar();
        };
        sim.addEventListener('click', (ev) => comBotao(ev.currentTarget, enviar(true)));
        ok.addEventListener('click', (ev) => comBotao(ev.currentTarget, enviar(false)));
      }
    });
  }

  /* ------------------------------------------------------------------ CSV */
  function exportarCsv() {
    const ls = S.view === 'leads' ? leadsFiltradosAdmin() : S.leads;
    const vendasPor = {};
    S.vendas.filter((v) => v.status === 'ativa').forEach((v) => { (vendasPor[v.lead_id] = vendasPor[v.lead_id] || []).push(v); });
    const cols = [
      ['Ranking', (l) => l.score], ['Classificação', (l) => (classifDe(l) ? classifDe(l).ico + ' ' + classifDe(l).rot : '')],
      ['Nome', (l) => l.nome], ['WhatsApp', (l) => telFmt(l.telefone)], ['E-mail', (l) => l.email],
      ['Empresa', (l) => l.empresa], ['Cargo', (l) => l.cargo], ['Cidade', (l) => [l.cidade, l.estado].filter(Boolean).join(' / ')],
      ['Status', (l) => (STATUS_INFO[l.status] ? STATUS_INFO[l.status].sing : l.status)],
      ['Atendente', (l) => l.responsavel_nome], ['Fase', (l) => (faseDe(l) ? faseDe(l).nome : '')],
      ['Faturamento/mês', (l) => l.diag_faturamento], ['Lucro %', (l) => l.diag_lucro_pct],
      ['Índice geral', (l) => l.diag_indice], ['Perde por mês', (l) => l.diag_custo_ineficiencia],
      ['Tipo de negócio', (l) => l.diag_tipo_negocio], ['PDF do diagnóstico', (l) => l.diag_pdf],
      ['Fez diagnóstico', (l) => (temDiag(l) ? 'SIM' : '')],
      ['Confirmou abertura', (l) => (l.confirmou_live === 'sim' ? 'SIM' : '')],
      ['Assistiu abertura', (l) => (l.participou === 'sim' ? 'SIM' : '')],
      ['Já é cliente ativo', (l) => (ehCliente(l) ? 'SIM' : '')],
      ['Campanhas anteriores', (l) => l.hist_campanhas || ''],
      ['Já comprou da 4blue', (l) => (jaComprou(l) ? 'SIM' : '')],
      ['Quem já atendeu', (l) => l.hist_atendente || ''],
      ['Último desfecho', (l) => l.hist_motivo || ''],
      ['Histórico comercial', (l) => historicoDe(l).map((h) => h.c + ': ' + (ROT_STATUS_ANTIGO[h.s] || h.s) + (h.m ? ' (' + h.m + ')' : '')).join(' | ')],
      ['Cliente MDL', (l) => l.cliente_mdl], ['Cliente Iluminismo', (l) => l.cliente_ilu],
      ['Eventos anteriores', (l) => eventosDe(l).map((e) => e.e).join(' | ')],
      ['Comprou', (l) => (l.status === 'ganho' ? 'SIM' : '')],
      ['Valor da compra', (l) => (vendasPor[l.id] || []).reduce((s, v) => s + num(v.valor_total), 0) || ''],
      ['Inscreveu-se em', (l) => l.criado_em], ['Última ação', (l) => l.ultima_acao],
      ['Motivo da perda', (l) => l.motivo], ['Origem', (l) => l.origem]
    ];
    const cel = (v) => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const txt = '﻿' + [cols.map((c) => cel(c[0])).join(';')].concat(ls.map((l) => cols.map((c) => cel(c[1](l))).join(';'))).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = `black-friday-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(ls.length + ' leads exportados', 'ok');
  }

  // chips de status do coordenador
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-adm-status]');
    if (!b) return;
    S.adm.status = b.dataset.admStatus; S.limite = 60; renderMain();
  });
})();
