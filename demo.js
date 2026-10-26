/* ==========================================================================
   MODO DEMONSTRAÇÃO — dados fictícios para conferir o visual sem ligar nada.
   Fica desligado assim que a API_URL for preenchida na config.js.
   ========================================================================== */
(function () {
  'use strict';
  if (window.APP_CONFIG && window.APP_CONFIG.API_URL) return;

  let semente = 20261118;
  const r = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
  const pick = (a) => a[Math.floor(r() * a.length)];
  const agora = () => new Date().toISOString().slice(0, 19);
  const atras = (dias) => new Date(Date.now() - dias * 86400000).toISOString().slice(0, 19);

  const U = [
    { id: 'U1', nome: 'Coordenação 4blue', email: 'coord@demo.com', perfil: 'coordenador', foto: '', ativo: 'SIM', recebe_leads: 'NAO' },
    { id: 'U2', nome: 'Noelle Mulek', email: 'noelle@demo.com', perfil: 'atendente', foto: '', ativo: 'SIM', recebe_leads: 'SIM' },
    { id: 'U3', nome: 'Natália Rodrigues', email: 'natalia@demo.com', perfil: 'atendente', foto: '', ativo: 'SIM', recebe_leads: 'SIM' },
    { id: 'U4', nome: 'Carla Duarte', email: 'carla@demo.com', perfil: 'atendente', foto: '', ativo: 'SIM', recebe_leads: 'SIM' }
  ];

  const F = [
    { id: 'F1', nome: 'Inscrito', ordem: '1', cor: '#8A939B', instrucoes: 'Primeiro contato pelo WhatsApp: se apresente e confirme que ele vai receber os avisos.', ativo: 'SIM' },
    { id: 'F2', nome: 'Em conversa', ordem: '2', cor: '#0369B1', instrucoes: 'Entenda o momento da empresa e mande o link do diagnóstico.', ativo: 'SIM' },
    { id: 'F3', nome: 'Diagnóstico feito', ordem: '3', cor: '#C9A227', instrucoes: 'Comente o resultado. Use o índice e o custo de ineficiência para mostrar o tamanho do problema.', ativo: 'SIM' },
    { id: 'F4', nome: 'Aquecido para a abertura', ordem: '4', cor: '#E8B931', instrucoes: 'Garanta a presença dele na live do dia da oferta.', ativo: 'SIM' },
    { id: 'F5', nome: 'Na abertura', ordem: '5', cor: '#F5DE8B', instrucoes: 'Dia da oferta. Acompanhe de perto e ajude a fechar.', ativo: 'SIM' }
  ];

  const M = [
    { id: 'M1', titulo: 'Primeiro contato', ordem: '1', fase_id: 'F1', ativo: 'SIM', texto: 'Oi {primeiro_nome}, tudo bem? Aqui é {usuario}, da 4blue! Vi que você garantiu seu lugar na nossa Black Friday Vitalícia. Vou te acompanhar até o dia da abertura para você não perder nada. Posso te fazer uma pergunta rápida sobre a sua empresa?' },
    { id: 'M2', titulo: 'Convite para o diagnóstico', ordem: '2', fase_id: 'F2', ativo: 'SIM', texto: '{primeiro_nome}, antes da abertura quero te mostrar uma coisa: um diagnóstico gratuito que mostra quanto a sua empresa está deixando na mesa todo mês. Leva 7 minutos: {link_diagnostico}' },
    { id: 'M3', titulo: 'Comentando o diagnóstico', ordem: '3', fase_id: 'F3', ativo: 'SIM', texto: '{primeiro_nome}, vi aqui o resultado do seu diagnóstico. Chamou minha atenção um ponto específico — posso te explicar em 2 minutos o que ele significa na prática?' },
    { id: 'M4', titulo: 'Confirmação da abertura', ordem: '4', fase_id: 'F4', ativo: 'SIM', texto: '{primeiro_nome}, nossa abertura é dia {data_abertura} às {hora_abertura}. É ao vivo e é o único momento em que o Combo Vitalício vai estar disponível. Posso contar com você?' }
  ];

  const P = [{ id: 'P1', nome: 'Combo Vitalício de Cursos', valor_total: '2997', valor_entrada: '', parcelas: '12', descricao: 'Acesso vitalício a todos os cursos da 4blue', ativo: 'SIM' }];

  const nomes = ['Marcelo Alaite', 'Luciana Ribeiro', 'Pedro Piccoli', 'Tatiane Sabbadini', 'Moises Lewandowski', 'Silvia Guedes',
    'Augusto Rodrigues', 'Jeferson Coelho', 'Ane Guedes', 'Natalia Lima', 'Fernanda Machado', 'Karen Santos', 'Dodi Alessandro',
    'Jozimar Silva', 'Sara Eshiley', 'Carla Christoffoli', 'Washington Silva', 'Públio Almeida', 'Gisele Nascimento',
    'Klein Souza', 'Alex Schmitz', 'Maiza Miranda', 'David Goulart', 'Jose Carlos Rodrigues', 'Laura Tempo',
    'Beatriz Moura', 'Vinícius Prado', 'Débora Sales', 'Ricardo Farias', 'Simone Araújo', 'Eduardo Campos', 'Sérgio Matos'];
  const empresas = ['Martini Ferramentas', 'Sethi Eletrônicos', 'Padaria Agape', 'Alliance Serviços', 'Clínica Consumed',
    'Schmitz Design', 'Almeida Pisos', 'Moving Body', 'Chase Marketing', 'Tempos Conservadora', 'Ospina Auto Peças',
    'Buon Giorno', 'Start Life', 'Divisul', 'Empório da Mama', 'Casa Prestige'];
  const ramos = ['Construção civil', 'Comércio varejista', 'Clínica odontológica', 'Indústria de alimentos', 'Serviços de TI', 'Academia', 'Contabilidade'];
  const cidades = [['São Paulo', 'SP'], ['Curitiba', 'PR'], ['Goiânia', 'GO'], ['Rio de Janeiro', 'RJ'], ['Fortaleza', 'CE'], ['Joinville', 'SC'], ['Belo Horizonte', 'MG']];
  const PILARES = ['Resultados', 'Finanças', 'Estratégia', 'Marketing', 'Vendas', 'Processos', 'Pessoas', 'Liderança'];

  const L = nomes.map((n, i) => {
    const cid = pick(cidades);
    const temDiag = r() < 0.55;
    const fatBase = pick([18000, 35000, 55000, 85000, 140000, 220000, 380000, 600000]);
    const idx = 18 + Math.floor(r() * 55);
    const pil = {};
    PILARES.forEach((p) => { pil[p] = String(Math.max(0, Math.min(100, idx + Math.floor((r() - 0.5) * 42)))) + '%'; });
    const dono = U[1 + (i % 3)];
    const l = {
      id: 'L' + (100 + i), criado_em: atras(1 + i * 0.4 + r()), origem: i % 7 === 0 ? 'planilha' : 'active',
      nome: n, email: n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.') + '@exemplo.com',
      telefone: '55' + pick(['11', '41', '62', '21', '85', '47', '31']) + '9' + String(10000000 + Math.floor(r() * 89999999)),
      empresa: pick(empresas), cargo: pick(['Dono / Sócio', 'Dono / Sócio', 'Diretor', 'Gerente']),
      cidade: cid[0], estado: cid[1], obs: '',
      status: 'novo', responsavel_id: dono.id, responsavel_nome: dono.nome,
      inicio_tratativa: '', ultima_acao: '', fechado_em: '', motivo: '', mensagem_usada: '',
      fase_id: 'F1', fase_em: atras(1 + r()),
      contato: '', contato_em: '', diagnostico: '', diagnostico_em: '',
      confirmou_live: '', confirmou_live_em: '', participou: '', participou_em: '', comprou: '', comprou_em: '',
      diag_id: '', diag_tipo_negocio: '', diag_faturamento: '', diag_lucro_pct: '', diag_faturamento_desejado: '',
      diag_indice: '', diag_custo_ineficiencia: '', diag_custo_oportunidade: '', diag_pilares: '', diag_pdf: '',
      cliente_mdl: '', cliente_ilu: '', eventos: '',
      transacao: '', produto_hotmart: '', valor_venda: '', status_hotmart: '',
      utm_source: pick(['instagram', 'email', 'youtube', '']), utm_campaign: 'black-friday-2026',
      dados_extra: '', criado_por: 'ActiveCampaign', atualizado_em: agora()
    };
    if (temDiag) {
      l.diagnostico = 'feito'; l.diagnostico_em = atras(r() * 4);
      l.diag_tipo_negocio = pick(['Serviço', 'Comércio', 'Indústria']);
      l.diag_faturamento = 'R$ ' + fatBase.toLocaleString('pt-BR');
      l.diag_lucro_pct = String(Math.floor(r() * 18)) + '%';
      l.diag_faturamento_desejado = 'R$ ' + Math.round(fatBase * (1.6 + r())).toLocaleString('pt-BR');
      l.diag_indice = idx + '%';
      l.diag_custo_ineficiencia = 'R$ ' + Math.round(fatBase * (0.08 + r() * 0.14)).toLocaleString('pt-BR');
      l.diag_custo_oportunidade = 'R$ ' + Math.round(fatBase * (0.3 + r() * 0.5)).toLocaleString('pt-BR');
      l.diag_pilares = JSON.stringify(pil);
      l.diag_pdf = 'https://drive.google.com/file/d/exemplo/view';
      l.ramo = pick(ramos);
    }
    // relação com a 4blue
    const rel = r();
    if (rel < 0.1) l.cliente_mdl = 'Mamber Ativo · Máquina de Lucros ' + pick(['Essencial', 'PRO']);
    else if (rel < 0.16) l.cliente_ilu = 'Iluminista Ativo';
    else if (rel < 0.26) l.cliente_mdl = 'Ex Mamber · Máquina de Lucros Essencial';
    else if (rel < 0.33) l.cliente_ilu = 'Ex iluminista';
    if (r() < 0.3) l.eventos = JSON.stringify([{ e: 'Workshop SP 2026', t: pick(['Normal', 'VIP']), f: pick(['Sim', 'Não']) }]);
    // jornada
    const etapa = r();
    if (etapa > 0.3) {
      l.status = 'tratativa'; l.contato = 'feito'; l.contato_em = atras(r() * 3);
      l.inicio_tratativa = atras(r() * 3); l.ultima_acao = atras(r() * 4);
      l.fase_id = temDiag ? pick(['F3', 'F4']) : 'F2';
      if (etapa > 0.6) { l.confirmou_live = 'sim'; l.confirmou_live_em = atras(r()); l.fase_id = 'F4'; }
      if (etapa > 0.86) {
        l.status = 'ganho'; l.comprou = 'sim'; l.comprou_em = atras(r()); l.fechado_em = atras(r());
        l.valor_venda = '2997'; l.transacao = 'HP' + (1700000000 + i * 7919); l.participou = 'sim';
      } else if (etapa > 0.8) { l.status = 'perdido'; l.motivo = pick(['Achou caro', 'Não é o momento', 'Não respondeu']); l.fechado_em = atras(r()); }
    }
    return l;
  });

  const V = L.filter((l) => l.status === 'ganho').map((l, i) => ({
    id: 'V' + i, data: l.comprou_em, lead_id: l.id, lead_nome: l.nome,
    usuario_id: l.responsavel_id, usuario_nome: l.responsavel_nome,
    produto_nome: 'Combo Vitalício de Cursos', valor_total: '2997', parcelas: '12',
    forma_pagamento: 'Cartão', transacao: l.transacao, obs: '', status: 'ativa'
  }));

  const H = [];
  const hist = (lead, u, acao, det) => H.push({ data: agora(), lead_id: lead, usuario_id: u.id, usuario_nome: u.nome, acao, detalhe: det });
  L.slice(0, 26).forEach((l, i) => {
    const u = U.find((x) => x.id === l.responsavel_id) || U[1];
    hist(l.id, { id: 'active', nome: 'ActiveCampaign' }, 'criado', 'Inscreveu-se na Black Friday · atendimento: ' + u.nome);
    if (l.contato) hist(l.id, u, 'tratativa', 'Conversa iniciada no WhatsApp');
    if (l.diagnostico === 'feito') hist(l.id, { id: '', nome: 'Diagnóstico' }, 'marco', 'Diagnóstico respondido · índice ' + l.diag_indice);
    if (l.status === 'ganho') hist(l.id, { id: 'hotmart', nome: 'Hotmart' }, 'ganho', 'Comprou o Combo Vitalício de Cursos');
    if (i > 20) hist(l.id, u, 'nota', 'Ficou de retornar depois da reunião de segunda.');
  });
  H.reverse();

  /* -------------------- cálculo do ranking (igual ao do backend) -------- */
  function faixaFat(v) {
    const n = numero(v);
    if (!n) return -1;
    if (n >= 500000) return 500; if (n >= 300000) return 300; if (n >= 100000) return 100;
    if (n >= 60000) return 60; if (n >= 30000) return 30; if (n >= 10000) return 10;
    return 1;
  }
  function numero(v) {
    if (v == null || v === '') return 0;
    let s = String(v).replace(/[R$\s%]/g, '');
    if (/,/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}(\D|$)/.test(s)) s = s.replace(/\./g, '');
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }
  const pctN = (v) => { const n = numero(v); return n > 1 && n <= 100 ? Math.round(n) : Math.round(n * 100); };
  const curto = (v) => { const n = numero(v); return n >= 1000000 ? 'R$ ' + (Math.round(n / 100000) / 10) + ' mi' : n >= 1000 ? 'R$ ' + Math.round(n / 1000) + ' mil' : 'R$ ' + Math.round(n); };
  function ativo(t) { const s = String(t || '').split('·')[0]; return !!s && /ativ/i.test(s) && !/ex |cancel|inativ/i.test(s); }
  const clienteAtivo = (l) => ativo(l.cliente_mdl) || ativo(l.cliente_ilu);
  function eventos(l) { try { const a = JSON.parse(l.eventos || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }

  function pontuar(l) {
    const m = [];
    let p = 10;
    const add = (n, rot) => { if (n) { p += n; m.push((n > 0 ? '+' : '') + n + ' ' + rot); } };
    const fx = faixaFat(l.diag_faturamento);
    if (fx >= 0) add({ 500: 30, 300: 26, 100: 22, 60: 14, 30: 6, 10: -6, 1: -18 }[fx] || 0, 'fatura ' + curto(l.diag_faturamento) + '/mês');
    const lucro = pctN(l.diag_lucro_pct);
    if (l.diag_lucro_pct && fx >= 30) {
      if (lucro <= 5) add(10, 'lucra só ' + lucro + '% — dor grande');
      else if (lucro <= 12) add(6, 'lucra ' + lucro + '%');
      else if (lucro >= 25) add(-4, 'já lucra ' + lucro + '%');
    }
    const idx = pctN(l.diag_indice);
    if (l.diag_indice) {
      if (idx >= 30 && idx < 60) add(10, 'índice ' + idx + '% — dor clara e empresa estruturada');
      else if (idx < 30) add(4, 'índice ' + idx + '% — muita dor');
      else if (idx < 80) add(4, 'índice ' + idx + '%');
    }
    const custo = numero(l.diag_custo_ineficiencia);
    if (custo >= 50000) add(10, 'perde ' + curto(custo) + '/mês de ineficiência');
    else if (custo >= 20000) add(6, 'perde ' + curto(custo) + '/mês');
    else if (custo >= 5000) add(3, 'perde ' + curto(custo) + '/mês');
    if (l.diagnostico === 'feito') add(12, 'fez o diagnóstico');
    if (l.contato === 'feito') add(5, 'já falou com a atendente');
    if (l.confirmou_live === 'sim') add(8, 'confirmou a abertura');
    if (l.participou === 'sim') add(12, 'assistiu a abertura');
    if (clienteAtivo(l)) add(-60, 'JÁ É CLIENTE ATIVO — fora do público desta oferta');
    else {
      if (l.cliente_mdl) add(8, 'ex-cliente do MDL');
      else if (l.cliente_ilu) add(8, 'ex-Iluminismo');
      const ev = eventos(l).length;
      if (ev) add(Math.min(ev * 3, 9), ev + ' evento(s) da 4blue');
    }
    const s = Math.round(p);
    const temDados = !!(l.diag_indice || l.diag_faturamento || l.cliente_mdl || l.cliente_ilu || eventos(l).length);
    const faixa = s >= 80 ? 'quente' : s >= 60 ? 'mql_mais' : s >= 40 ? 'mql' : s >= 20 ? 'viavel' : s >= 5 ? 'baixo' : 'fora';
    return { score: s, classificacao: clienteAtivo(l) ? 'cliente' : (temDados ? faixa : 'sem_dados'), score_motivos: m.join(' · '), cliente_ativo: clienteAtivo(l) };
  }
  const comScore = (ls) => ls.map((l) => Object.assign({}, l, pontuar(l)));

  const config = {
    nome_sistema: 'Black Friday Vitalícia 2026',
    data_abertura: '2026-11-18', hora_abertura: '20:00',
    diagnostico_url: 'https://cont.4blue.com.br/diagnostico-maquina-de-lucros/',
    inscricao_url: 'https://4blue.com.br/black-friday', live_url: 'https://4blue.com.br/abertura',
    distribuicao_auto: true, quem_gerencia: 'coordenador',
    ac_tag_inscricao: 'inscrito black friday vitalicia 2026',
    webhook_inscricao: 'https://script.google.com/macros/s/SEU_ID/exec?src=inscricao&key=CHAVE',
    webhook_inscricao_get: 'https://script.google.com/macros/s/SEU_ID/exec?src=inscricao&key=CHAVE&email=%EMAIL%&telefone=%PHONE%&nome=%FIRSTNAME%',
    webhook_hotmart: 'https://script.google.com/macros/s/SEU_ID/exec?src=hotmart&key=CHAVE',
    hotmart_produtos: [], hotmart_produtos_txt: '', modo_teste: false,
    diag_planilha_id: '1XZ1PFVywi1fCAkkTFsjlFtLZPgP-UwSMIpIrsvfmRqY', diag_aba: 'Diagnosticos',
    diag_ultima_sinc: atras(0.01), diag_criar_lead: false,
    base_id: '1ihgdFxaR5cM6xyAECvJ-IORN1dmghRin9gmRFCsHe5I', ultima_sincronizacao: atras(0.05),
    versao: 'demonstração',
    webhooks: [
      { recebido_em: atras(0.01), tipo: 'inscricao', identificacao: 'novo.inscrito@exemplo.com', status: 'ok', resultado: 'Inscrito criado · Noelle Mulek' },
      { recebido_em: atras(0.04), tipo: 'hotmart', identificacao: 'comprador@exemplo.com', status: 'ok', resultado: 'VENDA registrada' },
      { recebido_em: atras(0.2), tipo: 'inscricao', identificacao: 'repetido@exemplo.com', status: 'ignorado', resultado: 'Já estava no sistema' }
    ]
  };

  const copia = (x) => JSON.parse(JSON.stringify(x));
  let usuarioAtual = null;

  function base(u) {
    const c = u.perfil === 'coordenador';
    return {
      usuario: copia(u),
      leads: comScore(copia(L.filter((l) => c || l.responsavel_id === u.id || (l.status === 'novo' && !l.responsavel_id)))),
      vendas: copia(V.filter((v) => c || v.usuario_id === u.id)),
      produtos: copia(P), mensagens: copia(M), fases: copia(F),
      sistema: config.nome_sistema,
      pode_gerenciar: c || config.quem_gerencia === 'todos',
      links: { diagnostico: config.diagnostico_url, inscricao: config.inscricao_url, live: config.live_url, data_abertura: config.data_abertura, hora_abertura: config.hora_abertura },
      servidor: agora()
    };
  }

  const achar = (id) => L.find((l) => l.id === id);

  const rotas = {
    login: (b) => {
      const u = U.find((x) => x.email === String(b.email || '').trim().toLowerCase());
      if (!u) throw new Error('Use coord@demo.com ou noelle@demo.com (qualquer senha).');
      usuarioAtual = u;
      return Object.assign({ token: 'demo-' + u.id }, base(u));
    },
    bootstrap: () => base(usuarioAtual),
    'admin.painel': () => Object.assign(base(usuarioAtual), { usuarios: copia(U), historico: copia(H), config: copia(config) }),
    'perfil.salvar': (b) => { if (b.nome) usuarioAtual.nome = b.nome; if (b.foto) usuarioAtual.foto = b.foto; return copia(usuarioAtual); },
    'lead.historico': (b) => copia(H.filter((h) => h.lead_id === b.id)),
    'lead.tratativa': (b) => {
      const l = achar(b.id);
      if (l.status === 'novo') { l.status = 'tratativa'; l.inicio_tratativa = agora(); l.fase_id = l.fase_id || 'F1'; }
      l.contato = 'feito'; l.contato_em = agora(); l.ultima_acao = agora();
      hist(l.id, usuarioAtual, 'tratativa', 'Conversa iniciada no WhatsApp'); H.reverse(); H.reverse();
      return copia(l);
    },
    'lead.marco': (b) => {
      const l = achar(b.id);
      l[b.campo] = b.valor; l[b.campo + '_em'] = b.valor ? agora() : '';
      if (l.status === 'novo' && b.valor) l.status = 'tratativa';
      l.ultima_acao = agora();
      return copia(l);
    },
    'lead.fase': (b) => { const l = achar(b.id); l.fase_id = b.fase_id; l.fase_em = agora(); l.ultima_acao = agora(); if (l.status === 'novo') l.status = 'tratativa'; return copia(l); },
    'lead.obs': (b) => { const l = achar(b.id); H.unshift({ data: agora(), lead_id: l.id, usuario_id: usuarioAtual.id, usuario_nome: usuarioAtual.nome, acao: 'nota', detalhe: b.texto }); return copia(l); },
    'lead.ganho': (b) => {
      const l = achar(b.id);
      l.status = 'ganho'; l.comprou = 'sim'; l.comprou_em = agora(); l.fechado_em = agora(); l.valor_venda = String(numero(b.venda.valor_total));
      V.push({ id: 'V' + V.length, data: agora(), lead_id: l.id, lead_nome: l.nome, usuario_id: usuarioAtual.id, usuario_nome: usuarioAtual.nome,
        produto_nome: b.venda.produto_nome || 'Combo Vitalício de Cursos', valor_total: String(numero(b.venda.valor_total)),
        parcelas: b.venda.parcelas || '', forma_pagamento: b.venda.forma_pagamento || '', transacao: '', obs: b.venda.obs || '', status: 'ativa' });
      return { lead: copia(l) };
    },
    'lead.perdido': (b) => { const l = achar(b.id); l.status = b.descartar ? 'descartado' : 'perdido'; l.motivo = b.motivo; l.fechado_em = agora(); return copia(l); },
    'lead.reabrir': (b) => { const l = achar(b.id); l.status = 'tratativa'; l.motivo = ''; l.fechado_em = ''; return copia(l); },
    'lead.criar': (b) => {
      const d = b.lead || {};
      const novo = Object.assign({}, L[0], d, {
        id: 'L' + (900 + L.length), criado_em: agora(), origem: 'manual', status: d.assumir ? 'tratativa' : 'novo',
        responsavel_id: usuarioAtual.id, responsavel_nome: usuarioAtual.nome, fase_id: 'F1',
        diagnostico: '', diag_indice: '', diag_faturamento: '', diag_pilares: '', diag_pdf: '',
        cliente_mdl: '', cliente_ilu: '', eventos: '', contato: '', confirmou_live: '', participou: '', comprou: '',
        inicio_tratativa: d.assumir ? agora() : '', ultima_acao: agora(), fechado_em: '', motivo: '', valor_venda: ''
      });
      L.unshift(novo);
      return copia(novo);
    },
    'lead.editar': (b) => { const l = achar(b.id); Object.assign(l, b.lead); return copia(l); },
    'admin.lead.atribuir': (b) => { const l = achar(b.id); const u = U.find((x) => x.id === b.usuario_id); l.responsavel_id = u.id; l.responsavel_nome = u.nome; return copia(l); },
    'admin.lead.liberar': (b) => { const l = achar(b.id); l.responsavel_id = ''; l.responsavel_nome = ''; l.status = 'novo'; return copia(l); },
    'admin.lead.excluir': (b) => { const i = L.findIndex((l) => l.id === b.id); if (i >= 0) L.splice(i, 1); return { excluido: b.id }; },
    'admin.distribuir': (b) => {
      const cs = U.filter((u) => u.ativo === 'SIM' && (u.perfil !== 'coordenador' || u.recebe_leads === 'SIM'));
      const sem = L.filter((l) => l.status === 'novo' && !l.responsavel_id);
      const por = {};
      sem.forEach((l, i) => { const u = cs[i % cs.length]; por[u.nome] = (por[u.nome] || 0) + 1; if (!b.simular) { l.responsavel_id = u.id; l.responsavel_nome = u.nome; } });
      return { simulacao: !!b.simular, distribuidos: sem.length, por_usuario: por, atendentes: cs.length };
    },
    'admin.usuario.salvar': (b) => {
      const d = b.usuario;
      if (d.id) { Object.assign(U.find((u) => u.id === d.id), d); return copia(d); }
      const novo = Object.assign({ id: 'U' + (U.length + 1), foto: '' }, d);
      U.push(novo); return copia(novo);
    },
    'fase.salvar': (b) => { const d = b.fase; if (d.id) { Object.assign(F.find((f) => f.id === d.id), d); return copia(d); } const n = Object.assign({ id: 'F' + (F.length + 1) }, d); F.push(n); return copia(n); },
    'fase.excluir': (b) => { const i = F.findIndex((f) => f.id === b.id); if (i >= 0) F.splice(i, 1); return { excluido: b.id }; },
    'mensagem.salvar': (b) => { const d = b.mensagem; if (d.id) { Object.assign(M.find((m) => m.id === d.id), d); return copia(d); } const n = Object.assign({ id: 'M' + (M.length + 1) }, d); M.push(n); return copia(n); },
    'mensagem.excluir': (b) => { const i = M.findIndex((m) => m.id === b.id); if (i >= 0) M.splice(i, 1); return { excluido: b.id }; },
    'produto.salvar': (b) => { const d = b.produto; if (d.id) { Object.assign(P.find((p) => p.id === d.id), d); return copia(d); } const n = Object.assign({ id: 'P' + (P.length + 1) }, d); P.push(n); return copia(n); },
    'admin.config': (b) => {
      const c = b.config || {};
      const mapa = { NOME_SISTEMA: 'nome_sistema', DATA_ABERTURA: 'data_abertura', HORA_ABERTURA: 'hora_abertura',
        DIAGNOSTICO_URL: 'diagnostico_url', INSCRICAO_URL: 'inscricao_url', LIVE_URL: 'live_url',
        HOTMART_PRODUTOS: 'hotmart_produtos_txt', DIAG_PLANILHA_ID: 'diag_planilha_id', DIAG_ABA: 'diag_aba', BASE_CLIENTES_ID: 'base_id' };
      Object.keys(mapa).forEach((k) => { if (c[k] !== undefined) config[mapa[k]] = c[k]; });
      if (c.DISTRIBUICAO_AUTO !== undefined) config.distribuicao_auto = c.DISTRIBUICAO_AUTO === 'SIM';
      if (c.QUEM_GERENCIA !== undefined) config.quem_gerencia = c.QUEM_GERENCIA;
      if (c.HOTMART_MODO_TESTE !== undefined) config.modo_teste = c.HOTMART_MODO_TESTE === 'SIM';
      if (c.DIAG_CRIAR_LEAD !== undefined) config.diag_criar_lead = c.DIAG_CRIAR_LEAD === 'SIM';
      return copia(config);
    },
    'admin.diagnostico.sincronizar': () => ({ linhas: 18, atualizados: 0, ja_estavam: 18, criados: 0, em: agora() }),
    'admin.clientes.sincronizar': () => ({ pessoas_na_base: 412, leads_atualizados: 0, em: agora() }),
    'admin.duplicados': () => ({ grupos: [] }),
    'admin.duplicados.juntar': () => ({ grupos: 0, juntados: 0, detalhes: [] }),
    'admin.importar': (b) => {
      let criados = 0, ja = 0;
      (b.linhas || []).forEach((r2) => {
        const em = String(r2.email || '').toLowerCase();
        if (L.some((l) => l.email === em)) { ja++; return; }
        criados++;
        if (b.simular) return;
        const u = U[1 + (L.length % 3)];
        L.unshift(Object.assign({}, L[0], {
          id: 'L' + (800 + L.length), nome: r2.nome || em, email: em, telefone: r2.telefone || '',
          empresa: r2.empresa || '', cargo: r2.cargo || '', cidade: r2.cidade || '', estado: r2.estado || '',
          criado_em: agora(), origem: 'planilha', status: 'novo', responsavel_id: u.id, responsavel_nome: u.nome,
          fase_id: 'F1', diagnostico: '', diag_indice: '', diag_faturamento: '', diag_pilares: '', diag_pdf: '',
          cliente_mdl: '', cliente_ilu: '', eventos: '', contato: '', confirmou_live: '', participou: '', comprou: '',
          inicio_tratativa: '', ultima_acao: '', fechado_em: '', motivo: '', valor_venda: ''
        }));
      });
      return { simulacao: !!b.simular, linhas: (b.linhas || []).length, criados, ja_existiam: ja, completados: 0, sem_contato: 0, por_usuario: {}, exemplos: [] };
    },
    'admin.importar.marcos': (b) => {
      let ach = 0, atu = 0, nao = 0;
      const falta = [];
      (b.linhas || []).forEach((r2) => {
        const em = String(r2.email || '').toLowerCase();
        const l = L.find((x) => em && x.email === em);
        if (!l) { nao++; if (falta.length < 20) falta.push(em || r2.telefone); return; }
        ach++;
        if (b.simular) return;
        l[b.tipo] = b.valor || (b.tipo === 'contato' ? 'feito' : 'sim');
        l[b.tipo + '_em'] = agora();
        atu++;
      });
      return { simulacao: !!b.simular, tipo: b.tipo, linhas: (b.linhas || []).length, encontrados: ach, atualizados: atu, nao_encontrados: nao, exemplos_nao_encontrados: falta };
    },
    'admin.fila': () => ({ processados: 0 })
  };

  window.DEMO_API = function (payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const fn = rotas[payload.action];
        if (!fn) return reject(new Error('Ação não existe no modo demonstração: ' + payload.action));
        try { resolve(fn(payload)); } catch (e) { reject(e); }
      }, 120);
    });
  };
})();
