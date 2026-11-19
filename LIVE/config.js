/*
 * CONFIGURAÇÃO — Live 24h · Black Friday Vitalícia 2026
 *
 * API_URL: URL /exec do App da Web do Apps Script da Live.
 *          Vazio = MODO DEMONSTRAÇÃO (o painel não salva nada e o overlay usa tela-padrao.js).
 * GOOGLE_CLIENT_ID: ID do cliente OAuth do botão "Entrar com Google"
 *          (o mesmo do 4social e da Consultoria). Não é segredo.
 *
 * Nada de token, senha ou chave de transmissão neste arquivo: o repositório é público.
 */
window.APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbwiCZRzjN4yLR5PpU1avDnJ53K4nHj-4b-ovz4CTdFu_9BBXZIIggQ2v__qnTEFPV08/exec',
  GOOGLE_CLIENT_ID: '397559732703-q3l6tmt3p6hoc8s3aumsah741u6jmrge.apps.googleusercontent.com',
  NOME: 'Live 24h · Black Friday Vitalícia',
  // endereço público das páginas (usado para montar os links do OBS no painel)
  SITE: 'https://equipemkt-git.github.io/BLACK.FRIDAY.2026/LIVE/'
};
