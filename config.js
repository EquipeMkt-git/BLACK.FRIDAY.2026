/*
 * CONFIGURAÇÃO DO SITE — Black Friday Vitalícia 2026
 *
 * Cole em API_URL a URL do App da Web do Apps Script (a que termina em /exec).
 * ATENÇÃO: use sempre a URL /exec da implantação, nunca a /dev do editor —
 * a /dev pede login do Google e não funciona para quem está de fora.
 *
 * Enquanto API_URL estiver vazio o site roda em MODO DEMONSTRAÇÃO, com dados
 * fictícios e nada é salvo. Serve para conferir o visual antes de ligar tudo.
 */
window.APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbwXY4Mi6Z-mflekPCx4vAmEpINIrNjPOaT0-gzjwmfoHKuI2leRFlsxyoRX7cVpVnC9/exec',
  NOME: 'Black Friday Vitalícia 2026',
  // Botão "Fazer login com o Google" (mesmo ID do 4social e da Consultoria; é público).
  // Vazio = só e-mail e senha.
  GOOGLE_CLIENT_ID: '397559732703-q3l6tmt3p6hoc8s3aumsah741u6jmrge.apps.googleusercontent.com',
  ATUALIZAR_SEGUNDOS: 60
};
