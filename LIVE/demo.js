/* MODO DEMONSTRAÇÃO — só roda quando API_URL está vazio no config.js. Dados fictícios. */
(function () {
  'use strict';
  const pad = function (n) { return (n < 10 ? '0' : '') + n; };
  const fmt = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  const agora = function () { return fmt(new Date()); };
  let n = 0;
  const id = function (p) { n++; return p + Date.now() + n; };

  const pessoas = [
    { id: 'U1', nome: 'Coordenação (demo)', email: 'coord@demo.com', perfil: 'admin', ativo: 'SIM' },
    { id: 'U2', nome: 'Ana da BC (demo)', email: 'ana@demo.com', perfil: 'equipe', ativo: 'SIM' }
  ];
  const contas = [
    { id: 'yt', plataforma: 'YouTube', nome: 'Canal 4blue', url: 'https://studio.youtube.com/', formato: 'h' },
    { id: 'ig_4blueoficial', plataforma: 'Instagram', nome: '@4blueoficial', url: 'https://www.instagram.com/4blueoficial/', formato: 'v' },
    { id: 'ig_renan', plataforma: 'Instagram', nome: '@renan.kaminski', url: 'https://www.instagram.com/renan.kaminski/', formato: 'v' },
    { id: 'ig_aleksander', plataforma: 'Instagram', nome: '@aleksander.avalca', url: 'https://www.instagram.com/aleksander.avalca/', formato: 'v' },
    { id: 'ig_thauan', plataforma: 'Instagram', nome: '@othauanaraujo', url: 'https://www.instagram.com/othauanaraujo/', formato: 'v' },
    { id: 'tt_4blueoficial', plataforma: 'TikTok', nome: '@4blueoficial', url: 'https://www.tiktok.com/@4blueoficial', formato: 'v' }
  ];
  const daqui = function (min) { return fmt(new Date(Date.now() + min * 60e3)).slice(0, 16); };
  const blocos = [
    { id: 'B1', inicio_previsto: daqui(-90), responsavel: 'Ana da BC (demo)', status: 'ao_vivo', contas_ao_vivo: ['ig_4blueoficial', 'ig_renan'], iniciado_em: fmt(new Date(Date.now() - 85 * 60e3)), encerrar_ate: fmt(new Date(Date.now() + 145 * 60e3)), encerrado_em: '', obs: '' },
    { id: 'B2', inicio_previsto: daqui(240), responsavel: 'Ana da BC (demo)', status: 'agendado', contas_ao_vivo: [], iniciado_em: '', encerrar_ate: '', encerrado_em: '', obs: 'Bloco da noite' }
  ];
  let tela = null;
  const hist = [];
  let usuario = null;
  const log = function (a, d) { hist.unshift({ data: agora(), usuario: usuario ? usuario.email : '', acao: a, detalhe: d || '' }); };

  function dados() {
    const out = {
      versao: 'demo', agora: agora(), user: usuario, tela: tela, contas: contas, blocos: blocos.slice(),
      pings: [{ formato: 'h', camada: 'frente', canal: 'youtube', visto_ha_s: 23 }, { formato: 'h', camada: 'fundo', canal: 'youtube', visto_ha_s: 41 }, { formato: 'v', camada: 'frente', canal: 'vertical', visto_ha_s: 900 }],
      historico: hist.slice(0, 15)
    };
    if (usuario.perfil === 'admin') out.usuarios = pessoas.slice();
    return out;
  }

  window.DEMO = {
    pessoas: pessoas,
    entrar: function (email) { usuario = pessoas.filter(function (p) { return p.email === email; })[0]; log('login'); return { token: 'demo' }; },
    api: function (action, b) {
      if (!usuario) throw new Error('Sessão expirada.');
      if (action === 'dados') return dados();
      if (action === 'sair') { usuario = null; return {}; }
      if (action === 'tela.salvar') { tela = JSON.parse(JSON.stringify(b.tela)); log('tela.salvar'); return dados(); }
      if (action === 'tela.modo') { if (!tela) throw new Error('Salve a tela pelo menos uma vez antes de trocar o modo.'); tela.modo = b.modo; log('tela.modo', b.modo); return dados(); }
      if (action === 'bloco.criar') {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(b.bloco.inicio_previsto || ''))) throw new Error('Informe data e hora de início.');
        blocos.push({ id: id('B'), inicio_previsto: b.bloco.inicio_previsto, responsavel: b.bloco.responsavel || usuario.nome, status: 'agendado', contas_ao_vivo: [], iniciado_em: '', encerrar_ate: '', encerrado_em: '', obs: b.bloco.obs || '' });
        blocos.sort(function (x, y) { return x.inicio_previsto < y.inicio_previsto ? -1 : 1; });
        log('bloco.criar'); return dados();
      }
      if (action === 'bloco.acao') {
        const x = blocos.filter(function (k) { return k.id === b.id; })[0];
        if (!x) throw new Error('Bloco não encontrado.');
        if (b.acao === 'iniciar') { x.status = 'ao_vivo'; x.iniciado_em = agora(); x.encerrar_ate = fmt(new Date(Date.now() + 230 * 60e3)); }
        else if (b.acao === 'conta') { const i = x.contas_ao_vivo.indexOf(b.conta); if (i >= 0) x.contas_ao_vivo.splice(i, 1); else x.contas_ao_vivo.push(b.conta); }
        else if (b.acao === 'encerrar') { x.status = 'encerrado'; x.encerrado_em = agora(); }
        else if (b.acao === 'cancelar') { if (x.status === 'ao_vivo') throw new Error('Encerre o bloco antes de cancelar.'); x.status = 'cancelado'; }
        log('bloco.' + b.acao, b.conta || ''); return dados();
      }
      if (action === 'admin.usuario.salvar') {
        if (usuario.perfil !== 'admin') throw new Error('Só a coordenação pode fazer isso.');
        const u = b.usuario; const e = String(u.email || '').toLowerCase();
        const ja = pessoas.filter(function (p) { return p.email === e; })[0];
        if (ja) Object.assign(ja, { nome: u.nome, perfil: u.perfil, ativo: u.ativo }); else pessoas.push({ id: id('U'), nome: u.nome, email: e, perfil: u.perfil, ativo: u.ativo });
        log('usuario.salvar', e); return dados();
      }
      if (action === 'admin.contas.salvar') { contas.splice(0, contas.length); b.contas.forEach(function (c) { contas.push(c); }); log('contas.salvar'); return dados(); }
      throw new Error('Ação desconhecida.');
    }
  };
})();
