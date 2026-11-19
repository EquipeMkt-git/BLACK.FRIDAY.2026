/*
 * CONTEÚDO PADRÃO DA TELA DA LIVE · Black Friday Vitalícia 2026
 * Usado quando o painel ainda não foi configurado ou o Apps Script não responde.
 * Tudo aqui é público (veio da página de vendas). Nada de chave ou senha.
 */
window.TELA_PADRAO = {
  modo: 'video',                 // 'video' = aula rodando · 'tela' = só as informações (sem vídeo)
  rotuloVideo: 'AULA GRATUITA · GESTÃO FINANCEIRA LUCRATIVA',
  contagem: {
    ativo: true,
    titulo: 'A Black Friday Vitalícia termina em',
    fim: '2026-11-27T23:59:00',
    aoAcabar: 'Últimas horas da Black Friday Vitalícia'
  },
  oferta: {
    topo: '8 treinamentos · acesso vitalício',
    de: 'R$ 15.979/ano comprando separado',
    parcela: '12x de R$ 287',
    vista: 'ou R$ 2.897 à vista',
    rodape: '+ R$ 3.191 em bônus · garantia de 30 dias'
  },
  link: {
    url: 'https://cont.4blue.com.br/pagina-de-vendas-black-friday-bc/?utm_source=live24h',
    textoQR: 'Aponte a câmera e garanta o seu desconto',
    textoVertical: 'Link na bio',
    curto: 'cont.4blue.com.br'
  },
  chamadas: [
    { texto: 'Os 8 treinamentos da 4blue em um único combo, com acesso vitalício', ativo: true },
    { texto: 'Pague uma única vez. Sem mensalidade e sem renovação', ativo: true },
    { texto: 'O maior desconto que a 4blue já ofereceu', ativo: true },
    { texto: 'Para sócio, líder e funcionário: treine o seu time na mesma plataforma', ativo: true },
    { texto: '4 encontros ao vivo + acompanhamento no WhatsApp para gerar resultado rápido', ativo: true },
    { texto: 'Garantia incondicional de 30 dias: se não for para você, devolvemos 100%', ativo: true }
  ],
  cards: [
    { tag: 'Treinamento 1', titulo: 'Gestão Financeira Lucrativa', itens: ['Controle financeiro e fluxo de caixa', 'Precificação', 'Análises financeiras', 'Estratégias para aumentar os lucros'], rodape: '+70 aulas · 10 módulos', ativo: true },
    { tag: 'Treinamento 2', titulo: 'Gestão de Pessoas', itens: ['Atração e contratação', 'Cultura de alta performance', 'Liderança', 'Engajamento e retenção'], rodape: '+50 aulas · 6 módulos', ativo: true },
    { tag: 'Treinamento 3', titulo: 'Processos Eficientes', itens: ['Descrição e padronização de processos', 'Processos à prova de erros', 'Comprometimento da equipe', 'Indicadores de resultado'], rodape: '+40 aulas · 6 módulos', ativo: true },
    { tag: 'Treinamento 4', titulo: '14 Técnicas para Vender Mais', itens: ['Neurociência e economia comportamental', 'Autoridade e percepção de valor', 'Atração de clientes', 'Converter mais e mais caro'], rodape: '+50 aulas · 7 módulos', ativo: true },
    { tag: 'Treinamento 5', titulo: 'Formação em Liderança', itens: ['Como extrair o máximo da equipe', 'Habilidades técnicas e emocionais', 'Motivação e gestão de conflitos', 'Delegação e processos'], rodape: '19 aulas · 4 módulos', ativo: true },
    { tag: 'Treinamento 6', titulo: 'Plataforma para Colaboradores', itens: ['Mentalidade e carreira', 'Produtividade e organização', 'Comunicação e relacionamento', 'Vendas e atendimento'], rodape: '17 treinamentos · 5 módulos', ativo: true },
    { tag: 'Treinamento 7', titulo: 'Workshop de Planejamento Estratégico', itens: ['Análises do negócio', 'Visão de futuro e metas para 2027', 'Clareza de foco', 'Como acompanhar a execução'], rodape: '4 horas ao vivo · com gravação', ativo: true },
    { tag: 'Treinamento 8', titulo: 'Aceleração de Resultado Ao Vivo', itens: ['Finanças', 'Vendas', 'Produtividade', 'Acompanhamento no WhatsApp'], rodape: '3 encontros ao vivo · com gravação', ativo: true },
    { tag: 'Bônus', titulo: 'R$ 3.191 em bônus', itens: ['IA para Negócios na Prática', 'Planilhas Financeiras', 'Persuasão e Neurociência na Gestão de Pessoas', 'Finanças 4you: finanças pessoais'], rodape: 'Inclusos no combo', ativo: true }
  ],
  faixa: [
    'Black Friday Vitalícia 4blue',
    '8 treinamentos · acesso para sempre',
    '12x de R$ 287 ou R$ 2.897 à vista',
    'Garantia incondicional de 30 dias',
    '+65.000 clientes atendidos desde 2009',
    'Compra segura pela Hotmart'
  ],
  aviso: { ativo: false, texto: 'Comente QUERO que a gente te manda o link' },
  tempos: { palco: 9 }
};
