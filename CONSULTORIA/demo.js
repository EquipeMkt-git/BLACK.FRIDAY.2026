/*
 * MODO DEMONSTRAÇÃO — roda quando API_URL está vazio no config.js.
 * Todos os nomes e e-mails abaixo são FICTÍCIOS. Nada é salvo.
 * Na tela de login escolha entrar como admin ou como uma pessoa da consultoria.
 */
(function () {
  const PREFIXO = 'vitalicia_bf26_consultoria_';
  const pessoas = [
    ['Pessoa Exemplo Um', 'um'], ['Pessoa Exemplo Dois', 'dois'], ['Pessoa Exemplo Três', 'tres'],
    ['Pessoa Exemplo Quatro', 'quatro'], ['Pessoa Exemplo Cinco', 'cinco'], ['Pessoa Exemplo Seis', 'seis'],
    ['Pessoa Exemplo Sete', 'sete'], ['Pessoa Exemplo Oito', 'oito']
  ].map(function (p, i) {
    return { id: 'U' + i, nome: p[0], email: p[1] + '@exemplo.com', codigo: p[1], perfil: 'consultor', ativo: 'SIM' };
  });
  pessoas.push({ id: 'UADM', nome: 'Coordenação Demo', email: 'coord@exemplo.com', codigo: '', perfil: 'admin', ativo: 'SIM' });

  const ofertas = [['Black Friday Vitalícia (R$ 2.897)', 2897], ['Mambers / Iluministas / Black GFL 2024 (R$ 1.997)', 1997], ['Upgrade Black Friday 2025 (R$ 997)', 997]];
  const compradores = ['Cliente Fictício', 'Comprador Teste', 'Empresa Demo', 'Loja Exemplo', 'Clínica Modelo', 'Indústria Teste', 'Padaria Demo', 'Agência Exemplo'];
  const vendas = [];
  const distrib = ['um', 'um', 'um', 'um', 'dois', 'dois', 'dois', 'tres', 'tres', 'tres', 'quatro', 'quatro', 'cinco', 'seis', '', '', 'lpa', 'lpa', 'um', 'dois'];
  distrib.forEach(function (c, i) {
    const o = ofertas[i % 3 === 2 ? 2 : (i % 4 === 1 ? 1 : 0)];
    const h = 20 + Math.floor(i / 6);
    const d = new Date(2026, 10, 18, h, (i * 7) % 60);
    vendas.push({
      transacao: 'HP' + (100000 + i * 37), data: d.toISOString().slice(0, 19),
      nome: compradores[i % compradores.length] + ' ' + (i + 1), email: 'comprador' + (i + 1) + '@exemplo.com',
      oferta: o[0], valor: o[1], status: i === 9 ? 'reembolsada' : 'ativa',
      sck: c === 'lpa' ? PREFIXO + 'lpa' : (c ? PREFIXO + c : 'vitalicia_bf26_base_lpa')
    });
  });
  const ajustes = {};

  function links(c) {
    const sck = PREFIXO + c;
    return {
      pagina: 'https://cont.4blue.com.br/pagina-de-vendas-black-friday-consultoria/?utm_source=consultoria&utm_content=' + c,
      checkout: 'https://pay.hotmart.com/H108268133T?off=dxsbms9m&checkoutMode=10&split=1&hideBillet=1&sck=' + sck,
      desconto_1997: 'https://pay.hotmart.com/H108268133T?off=x19adxre&checkoutMode=10&split=1&hideBillet=1&sck=' + sck,
      desconto_997: 'https://pay.hotmart.com/S108418550F?off=ekz44qe5&checkoutMode=10&split=12&hideBillet=1&sck=' + sck
    };
  }

  function atribuidas() {
    const cods = {};
    pessoas.forEach(function (p) { if (p.codigo) cods[p.codigo] = p; });
    return vendas.map(function (v) {
      const x = Object.assign({}, v);
      let c = '', origem = '';
      if (x.sck.indexOf(PREFIXO) === 0 && x.sck !== PREFIXO + 'lpa') { c = x.sck.slice(PREFIXO.length); origem = 'link'; }
      if (ajustes[x.transacao] !== undefined) { c = ajustes[x.transacao]; origem = c ? 'manual' : ''; }
      x.codigo = cods[c] ? c : '';
      x.origem = x.codigo ? origem : '';
      x.pessoa = x.codigo ? cods[c].nome : '';
      x.da_pagina = x.sck === PREFIXO + 'lpa' || (x.sck.indexOf(PREFIXO) === 0 && !x.codigo);
      x.ativa = x.status === 'ativa';
      return x;
    });
  }

  function ranking(vs) {
    const soma = {};
    pessoas.filter(function (p) { return p.codigo && p.ativo === 'SIM'; }).forEach(function (p) { soma[p.codigo] = { codigo: p.codigo, nome: p.nome, vendas: 0, faturamento: 0, ultima: '' }; });
    vs.forEach(function (v) { const s = soma[v.codigo]; if (s && v.ativa) { s.vendas++; s.faturamento += v.valor; if (v.data > s.ultima) s.ultima = v.data; } });
    const l = Object.keys(soma).map(function (k) { return soma[k]; });
    l.sort(function (a, b) { return b.vendas - a.vendas || b.faturamento - a.faturamento || a.nome.localeCompare(b.nome); });
    let pos = 0, ant = null;
    l.forEach(function (s, i) { const k = s.vendas + '|' + s.faturamento; if (k !== ant) { pos = i + 1; ant = k; } s.posicao = s.vendas ? pos : null; });
    return l;
  }

  function dados(u) {
    const vs = atribuidas();
    const at = vs.filter(function (v) { return v.ativa && v.codigo; });
    const out = {
      versao: 'demo', hora: new Date().toISOString().slice(0, 19), user: u, ranking: ranking(vs),
      time: { vendas: at.length, faturamento: at.reduce(function (s, v) { return s + v.valor; }, 0) }
    };
    if (u.codigo) {
      out.links = links(u.codigo);
      out.minhas = vs.filter(function (v) { return v.codigo === u.codigo; }).map(function (v) {
        return { transacao: v.transacao, data: v.data, nome: v.nome, email: v.email.slice(0, 2) + '•••' + v.email.slice(v.email.indexOf('@')), oferta: v.oferta, valor: v.valor, ativa: v.ativa, origem: v.origem };
      }).reverse();
    }
    if (u.perfil === 'admin') {
      out.vendas = vs.slice().reverse();
      out.pessoas = pessoas.map(function (p) { return Object.assign({}, p, p.codigo ? { links: links(p.codigo) } : {}); });
      // funil por link (fictício)
      const linhas = pessoas.filter(function (p) { return p.codigo && p.ativo === 'SIM'; }).map(function (p) { return { codigo: p.codigo, nome: p.nome }; });
      linhas.push({ codigo: '', nome: 'Página sem código', sem_codigo: true });
      out.funil = {
        desde: '2026-11-24T17:10:00',
        linhas: linhas.map(function (l, i) {
          const vs = vs2(l);
          const vis = [64, 41, 37, 22, 18, 9, 4, 0, 30][i] || 0;
          const ini = Math.max(vs.length, Math.round(vis * [0.31, 0.28, 0.35, 0.4, 0.22, 0.33, 0.5, 0, 0.2][i]));
          const h = { aguardando: i % 3 === 0 ? 2 : i % 2, recusado: i < 3 ? 1 : 0, expirou: i === 1 ? 1 : 0, abandonou: 0 };
          return {
            codigo: l.codigo, nome: l.nome, sem_codigo: !!l.sem_codigo, acessos: Math.round(vis * 1.6), visitantes: vis, chegadas: vis,
            cliques: ini + 2, iniciaram: ini, vendas: vs.length, faturamento: vs.reduce(function (s, v) { return s + v.valor; }, 0),
            clicaram_sem_comprar: Math.max(0, ini - vs.length), pararam_pagamento: vis ? h.aguardando + h.recusado + h.expirou : 0, hotmart: vis ? h : {},
            conversao: vis ? Math.round(vs.length / vis * 1000) / 10 : null, ultimo: vis ? '2026-11-24T18:' + String(10 + i * 4) + ':00' : ''
          };
        })
      };
      function vs2(l) { return vs.filter(function (v) { return v.ativa && (l.sem_codigo ? (!v.codigo && v.da_pagina) : v.codigo === l.codigo); }); }
    }
    return out;
  }

  let atual = null;
  window.DEMO = {
    pessoas: pessoas,
    entrar: function (email) {
      atual = pessoas.filter(function (p) { return p.email === email; })[0];
      return { ok: true, token: 'demo', user: atual };
    },
    api: function (acao, b) {
      if (acao === 'dados') return dados(atual);
      if (acao === 'sair') { atual = null; return {}; }
      if (atual.perfil !== 'admin') throw new Error('Só a coordenação pode fazer isso.');
      if (acao === 'admin.atribuir') { ajustes[b.transacao] = b.codigo || ''; return dados(atual); }
      if (acao === 'admin.usuario.salvar') {
        const d = b.usuario;
        if (d.id) Object.assign(pessoas.filter(function (p) { return p.id === d.id; })[0], d);
        else pessoas.push(Object.assign({ id: 'U' + Date.now() }, d));
        return dados(atual);
      }
      throw new Error('Ação desconhecida.');
    }
  };
})();
