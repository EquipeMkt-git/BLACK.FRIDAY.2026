/* PASSO A PASSO DA EQUIPE — conteúdo da aba "Guia" do painel.
 * L = links do OBS montados pelo painel ({ hFundo, hFrente, vFundo, vFrente }).
 * c(url) = caixinha com botão de copiar. */
window.GUIA = function (L, c) {
  return [
    {
      id: 'rotina', titulo: 'Rotina do dia', sub: 'O que fazer em cada turno',
      html:
        '<div class="aviso dica"><b>Resumo de 30 segundos</b>O YouTube fica no ar 24h sozinho. O Instagram corta a live em 4 horas, então a cada bloco alguém abre as lives das 4 contas de novo. O TikTok vai junto no mesmo bloco. Tudo o que aparece na tela (chamadas, preço, QR) muda pela aba <b>Tela</b> deste painel.</div>' +
        '<h3 style="margin-top:18px">Ordem das plataformas (sempre nesta ordem)</h3>' +
        '<ol class="ordem">' +
        '<li><span class="plat YouTube">YouTube</span> Canal 4blue: liga uma vez e não desliga</li>' +
        '<li><span class="plat Instagram">Instagram</span> @4blueoficial</li>' +
        '<li><span class="plat Instagram">Instagram</span> @renan.kaminski</li>' +
        '<li><span class="plat Instagram">Instagram</span> @aleksander.avalca</li>' +
        '<li><span class="plat Instagram">Instagram</span> @othauanaraujo</li>' +
        '<li><span class="plat TikTok">TikTok</span> @4blueoficial</li></ol>' +
        '<h3 style="margin-top:18px">Começo do turno</h3><div class="passos">' +
        '<div class="passo"><h4>Confira a aba Agora</h4><p>As bolinhas do <b>OBS horizontal (YouTube)</b> e do <b>OBS vertical</b> precisam estar verdes. Vermelha = o PC da live desligou, ficou sem internet ou o OBS fechou. Veja a seção <b>Deu problema?</b></p></div>' +
        '<div class="passo"><h4>Olhe a live do YouTube</h4><p>Abra o canal no celular e veja se está "AO VIVO", com som e com as chamadas mudando.</p></div>' +
        '<div class="passo"><h4>Se tem bloco de Instagram no seu horário</h4><p>Siga a seção <b>Bloco do Instagram e TikTok</b> do começo ao fim.</p></div></div>' +
        '<h3 style="margin-top:18px">Nunca faça</h3>' +
        '<div class="aviso perigo"><ul style="padding-left:18px;display:grid;gap:4px">' +
        '<li>Desligar, reiniciar ou suspender o PC da live.</li>' +
        '<li>Clicar em <b>Parar transmissão</b> no OBS do YouTube.</li>' +
        '<li>Fechar o OBS, mover, apagar ou renomear as fontes (AULA, TELA FUNDO, TELA FRENTE).</li>' +
        '<li>Tocar vídeo, música ou reunião com som no PC da live (o som pode ir para a live).</li>' +
        '<li>Mandar chave de transmissão no WhatsApp, e-mail ou planilha. Ela vai direto do Instagram para o OBS.</li>' +
        '<li>Escrever na tela qualquer número de vendas. O telão de vendas é interno.</li></ul></div>'
    },
    {
      id: 'bloco', titulo: 'Bloco do Instagram e TikTok', sub: 'A cada no máximo 4 horas',
      html:
        '<div class="aviso dica"><b>Quem faz e onde</b>A live do Instagram você cria <b>no seu próprio computador</b> (instagram.com logado na conta). Só a chave precisa ir para o OBS, que roda no <b>PC da live</b> (o computador do colega que transmite). Se você não é o dono desse PC, acesse ele pela <b>Área de Trabalho Remota do Chrome</b> (remotedesktop.google.com) com o acesso que ele te passou. Dica: um perfil do Chrome por conta do Instagram evita ficar saindo e entrando.</div>' +
        '<div class="passos" style="margin-top:14px">' +
        '<div class="passo"><h4>Inicie o bloco no painel</h4><p>Aba <b>Agenda</b> → no bloco do horário, clique em <b>Iniciar bloco</b>. O painel começa a contar 3h50 (o Instagram corta em 4h; a margem é para encerrar com calma).</p></div>' +
        '<div class="passo"><h4>Confira o OBS VERTICAL</h4><p>No PC da live, a janela <b>OBS VERTICAL</b> deve estar aberta, mostrando a tela em pé com o vídeo rodando. Se estiver fechada, abra pelo atalho <b>OBS VERTICAL</b> da área de trabalho.</p></div>' +
        '<div class="passo"><h4>Abra a live da 1ª conta (@4blueoficial)</h4><ol>' +
        '<li>No seu computador, abra o Chrome logado na conta e entre em <a href="https://www.instagram.com/" target="_blank" rel="noopener">instagram.com</a>.</li>' +
        '<li>Clique em <b>+ Criar</b> (menu da esquerda) → <b>Vídeo ao vivo</b>.</li>' +
        '<li>Título: <code class="in">🔴 AO VIVO · Black Friday Vitalícia 4blue</code> · Público: <b>Público</b> → <b>Avançar</b>.</li>' +
        '<li>Aparecem a <b>URL de transmissão</b> e a <b>Chave de transmissão</b>. Deixe essa tela aberta.</li></ol></div>' +
        '<div class="passo"><h4>Cole a chave no OBS</h4><ol>' +
        '<li>No PC da live (direto ou pela Área de Trabalho Remota), no OBS VERTICAL, no quadro <b>Multiple output</b> (Múltiplas saídas), ache o destino com o nome da conta, ex.: <b>IG 4blueoficial</b>.</li>' +
        '<li>Clique em <b>Editar</b>. Em <b>Servidor</b> cole a URL de transmissão; em <b>Chave</b> cole a chave. <b>OK</b>.</li>' +
        '<li>Clique em <b>Iniciar</b> nesse destino. Ele fica verde em alguns segundos.</li></ol></div>' +
        '<div class="passo"><h4>Entre ao vivo no Instagram</h4><p>Volte para a aba do Instagram: a prévia mostra a tela da live. Clique em <b>Ir ao vivo</b>. Depois, no painel (aba <b>Agora</b>), marque a conta como ao vivo.</p></div>' +
        '<div class="passo"><h4>Fixe o comentário</h4><p>Na live, escreva <code class="in">O link está na bio 👆 Black Friday Vitalícia com acesso para sempre</code> e fixe o comentário.</p></div>' +
        '<div class="passo"><h4>Repita para as outras 3 contas</h4><p>Mesma coisa, na ordem: @renan.kaminski → @aleksander.avalca → @othauanaraujo. Cada conta usa o seu destino no Multiple output e a sua chave (a chave muda a cada live).</p></div>' +
        '<div class="passo"><h4>TikTok (@4blueoficial)</h4><ol>' +
        '<li>Abra o TikTok LIVE Studio ou o gerador de chave da conta (se a conta não tiver a opção de transmitir com chave, pule e avise a coordenação).</li>' +
        '<li>Copie <b>URL do servidor</b> e <b>Chave</b> e cole no destino <b>TT 4blueoficial</b> do Multiple output → <b>Iniciar</b> → <b>Ir ao vivo</b> no TikTok.</li></ol>' +
        '<p class="ajuda">O TikTok pode limitar lives que parecem gravadas. Sempre que der, alguém da equipe responde comentários durante o bloco.</p></div>' +
        '<div class="passo"><h4>Durante o bloco</h4><p>Responda comentários quando puder. O painel avisa quando faltarem 20 minutos.</p></div>' +
        '<div class="passo"><h4>Encerre antes do relógio zerar</h4><ol>' +
        '<li>Em cada conta do Instagram e no TikTok: <b>Encerrar vídeo ao vivo</b>.</li>' +
        '<li>No OBS VERTICAL, no Multiple output, clique em <b>Parar</b> em cada destino. <b>Não feche o OBS.</b></li>' +
        '<li>No painel, clique em <b>Encerrar bloco</b>.</li>' +
        '<li>Se tem outro bloco logo em seguida, comece de novo do passo 1 (chaves novas).</li></ol></div></div>'
    },
    {
      id: 'tela', titulo: 'Mudar o que aparece', sub: 'Chamadas, preço, QR, modo sem vídeo',
      html:
        '<div class="passos">' +
        '<div class="passo"><h4>Editar textos</h4><p>Aba <b>Tela</b>: mude chamadas, cartões dos treinamentos, oferta, link do QR, faixa e contagem. A prévia do lado mostra como fica. Clique em <b>Salvar e publicar</b>. Em até 1 minuto muda em todas as lives.</p><p class="ajuda">Dica: palavra entre asteriscos fica dourada. Ex.: <code class="in">Acesso *vitalício*</code>.</p></div>' +
        '<div class="passo"><h4>Deu problema no vídeo? Use "Só informações"</h4><p>Aba <b>Agora</b> → <b>Só informações</b>. O lugar do vídeo vira uma tela com os sócios e as chamadas. Para voltar, <b>Aula rodando</b>.</p><p class="ajuda">Se o arquivo do vídeo sumir ou travar, a tela de informações aparece sozinha por trás, mas o som some. Use o botão para deixar a troca oficial.</p></div>' +
        '<div class="passo"><h4>Aviso piscando</h4><p>Na aba <b>Tela</b>, ligue o <b>Aviso</b> para mostrar uma chamada urgente por cima do vídeo (ex.: "Últimas vagas", "Comente QUERO"). Desligue depois.</p></div>' +
        '<div class="passo"><h4>Trocar a aula</h4><p>A coordenação coloca o vídeo novo na pasta do Drive. O dono do PC da live baixa para <code class="in">C:\\LIVE24H</code> (com outro nome, sem apagar o antigo) e, nos dois OBS, troca o arquivo da fonte <b>AULA</b> (botão direito → Propriedades → Arquivo local). Só depois apaga o vídeo antigo.</p></div></div>'
    },
    {
      id: 'problema', titulo: 'Deu problema?', sub: 'O que fazer em cada caso',
      html:
        '<table class="tabela"><thead><tr><th>O que aconteceu</th><th>O que fazer</th></tr></thead><tbody>' +
        '<tr><td>Bolinha vermelha no painel ("OBS não visto")</td><td>Fale com o dono do PC da live (ou acesse pela Área de Trabalho Remota). O PC ligou? Tem internet? O OBS está aberto? Abra pelo atalho e clique em <b>Iniciar transmissão</b> (só no OBS do YouTube). Se o PC reiniciou, siga <b>Montar o PC</b> → passo "Depois de reiniciar".</td></tr>' +
        '<tr><td>YouTube caiu</td><td>No OBS YOUTUBE, clique em <b>Iniciar transmissão</b>. A chave é fixa e a live volta no mesmo link.</td></tr>' +
        '<tr><td>Instagram caiu antes das 4h</td><td>Pare o destino no Multiple output, crie a live de novo no Instagram (chave nova), cole e inicie.</td></tr>' +
        '<tr><td>Tela preta onde fica o vídeo</td><td>Clique em <b>Só informações</b> no painel e avise a coordenação.</td></tr>' +
        '<tr><td>Textos não mudaram depois de salvar</td><td>Espere 1 minuto. Se não mudar, no OBS clique com o botão direito em <b>TELA FRENTE</b> → Propriedades → <b>Atualizar cache da página atual</b>. Faça o mesmo em TELA FUNDO.</td></tr>' +
        '<tr><td>Barra de baixo do OBS fica vermelha / quadros perdidos</td><td>A internet não está dando conta. Feche outros programas e downloads no PC e na rede. Persistindo, avise a coordenação para baixar a taxa de bits.</td></tr>' +
        '<tr><td>Som estranho na live (notificação, música)</td><td>No OBS, no Mixer de áudio, deixe <b>só a AULA</b> com som. Áudio da área de trabalho e Microfone ficam mudos (ícone vermelho).</td></tr>' +
        '<tr><td>Não aparece "Vídeo ao vivo" no instagram.com</td><td>A conta precisa ser profissional (Criador ou Empresa) e estar com a live liberada. Avise a coordenação.</td></tr>' +
        '</tbody></table>'
    },
    {
      id: 'montar', titulo: 'Montar o PC', sub: 'Uma vez só (coordenação)',
      html:
        '<div class="aviso"><b>Quem faz:</b> a coordenação, uma vez. Leva uns 40 minutos. Depois disso a equipe só usa a <b>Rotina do dia</b>.</div>' +
        '<div class="passos" style="margin-top:14px">' +
        '<div class="passo"><h4>PC e internet</h4><ul><li>De preferência ligado no <b>cabo de rede</b> (não Wi-Fi).</li><li>Teste em <a href="https://fast.com" target="_blank" rel="noopener">fast.com</a> → "Mostrar mais informações": precisa de <b>25 Mbps de upload</b> livres para YouTube + 4 Instagram + TikTok ao mesmo tempo. Se a internet da casa não tiver isso, divida: o OBS YOUTUBE fica no PC de uma pessoa e o OBS VERTICAL no PC de outra (o painel mostra os dois separados).</li><li>É o computador pessoal de alguém: ele pode ser usado para coisas leves (navegador, planilhas), mas <b>não pode desligar, reiniciar nem rodar jogos/edição de vídeo</b>. Na tomada, nunca só na bateria.</li><li>Placa de vídeo NVIDIA ou AMD ajuda muito (o OBS usa ela para codificar).</li></ul></div>' +
        '<div class="passo"><h4>Windows não pode dormir nem reiniciar</h4><ul><li>Configurações → Sistema → Energia → Tela e suspensão: tudo em <b>Nunca</b>.</li><li>Configurações → Windows Update → <b>Pausar atualizações</b> pelo maior prazo.</li><li>Configurações → Sistema → Notificações: desligue (evita som e pop-up).</li></ul></div>' +
        '<div class="passo"><h4>Baixe o vídeo da aula</h4><ol><li>Crie a pasta <code class="in">C:\\LIVE24H</code> no PC da live.</li><li>Abra a <a href="https://drive.google.com/drive/folders/1uIUtHS3lvqXYC5DrOWHutNg847Xed2ix?usp=sharing" target="_blank" rel="noopener">pasta do vídeo no Drive</a>, baixe <code class="in">AULA-GFL-LIVE-24H.mp4</code> (cerca de 1 GB) e salve em <code class="in">C:\\LIVE24H</code>.</li><li>Não mova nem renomeie o arquivo depois que o OBS estiver usando.</li></ol><p class="ajuda">Não precisa instalar o Google Drive: o vídeo fica direto no computador e não depende de internet para tocar.</p></div>' +
        '<div class="passo"><h4>OBS e o plugin de várias saídas</h4><ul><li>Instale o <a href="https://obsproject.com/pt-br/download" target="_blank" rel="noopener">OBS Studio</a> (Windows).</li><li>Instale o plugin <a href="https://github.com/sorayuki/obs-multi-rtmp/releases" target="_blank" rel="noopener">Multiple RTMP outputs</a> (arquivo <b>…-windows-x64-Installer.exe</b> da versão mais recente). Com o OBS fechado.</li></ul></div>' +
        '<div class="passo"><h4>Dois atalhos: OBS YOUTUBE e OBS VERTICAL</h4><p>Na área de trabalho: botão direito → Novo → Atalho. Cole o caminho abaixo, nomeie <b>OBS YOUTUBE</b>. Depois abra Propriedades do atalho e em <b>Iniciar em</b> coloque <code class="in">C:\\Program Files\\obs-studio\\bin\\64bit</code>.</p>' +
        c('"C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe" --multi --profile "YOUTUBE" --collection "YOUTUBE" --disable-shutdown-check') +
        '<p>Faça outro igual chamado <b>OBS VERTICAL</b>:</p>' +
        c('"C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe" --multi --profile "VERTICAL" --collection "VERTICAL" --disable-shutdown-check') +
        '<p class="ajuda">Na primeira vez, dentro de cada OBS: menu <b>Perfil → Novo</b> (YOUTUBE ou VERTICAL) e <b>Coleção de cenas → Nova</b> (mesmo nome). Se o OBS perguntar sobre o assistente de configuração, clique em Não.</p></div>' +
        '<div class="passo"><h4>OBS YOUTUBE: vídeo e saída</h4><ul>' +
        '<li>Configurações → <b>Vídeo</b>: Resolução base e de saída <b>1920x1080</b>, FPS <b>30</b>.</li>' +
        '<li>Configurações → <b>Saída</b> (modo Simples): Taxa de bits do vídeo <b>4500</b>, Codificador <b>Hardware</b> (NVENC/AMD) se tiver, senão Software (x264), Áudio <b>160</b>.</li>' +
        '<li>Configurações → <b>Avançado</b> → Reconectar automaticamente: <b>ligado</b>, atraso 10 s, tentativas 25.</li></ul></div>' +
        '<div class="passo"><h4>OBS YOUTUBE: as 3 fontes (na ordem, de baixo para cima)</h4><ol>' +
        '<li><b>+ → Navegador</b>, nome <b>TELA FUNDO</b>, largura 1920, altura 1080, URL:' + c(L.hFundo) + '<span class="ajuda">Desmarque "Desligar fonte quando não estiver visível".</span></li>' +
        '<li><b>+ → Fonte de mídia</b>, nome <b>AULA</b>: marque <b>Repetir</b>, escolha o arquivo <code class="in">C:\\LIVE24H\\AULA-GFL-LIVE-24H.mp4</code>. Depois: botão direito na AULA → Transformar → <b>Editar transformação</b>: Posição <b>40 / 118</b>, Tipo de caixa delimitadora <b>Esticar para os limites</b>, Tamanho da caixa <b>1344 x 756</b>.</li>' +
        '<li><b>+ → Navegador</b>, nome <b>TELA FRENTE</b>, largura 1920, altura 1080, URL:' + c(L.hFrente) + '</li></ol>' +
        '<p>A lista de fontes deve ficar: TELA FRENTE (em cima), AULA, TELA FUNDO (embaixo). Clique no cadeado de cada fonte para travar.</p></div>' +
        '<div class="passo"><h4>OBS YOUTUBE: áudio</h4><p>No Mixer de áudio, deixe <b>só a AULA</b> com som. Clique no alto-falante de <b>Áudio da área de trabalho</b> e <b>Mic/Aux</b> para ficarem mudos (vermelho).</p></div>' +
        '<div class="passo"><h4>YouTube Studio: a live 24h</h4><ol>' +
        '<li>Abra o <a href="https://studio.youtube.com/channel/UCrVvD7DtaT7SqL3CJiXOlIQ/livestreaming" target="_blank" rel="noopener">YouTube Studio → Transmitir ao vivo</a> → aba <b>Stream</b>.</li>' +
        '<li>Título e descrição com o link da página de vendas; miniatura da Black.</li>' +
        '<li>Configurações da transmissão: <b>Ativar início automático</b> ligado, <b>Ativar interrupção automática</b> <b>desligado</b> (assim uma queda rápida não encerra a live), Latência normal, DVR ligado.</li>' +
        '<li>Copie a <b>Chave de transmissão</b> (de preferência a chave persistente/padrão).</li>' +
        '<li>No OBS YOUTUBE: Configurações → <b>Transmissão</b> → Serviço <b>YouTube - RTMPS</b> → "Usar chave de transmissão" → cole. OK.</li>' +
        '<li>Clique em <b>Iniciar transmissão</b>. Em até 1 minuto o YouTube mostra "AO VIVO".</li></ol>' +
        '<p class="ajuda">O YouTube só guarda as últimas 12 horas da gravação de uma live contínua. Isso é normal.</p></div>' +
        '<div class="passo"><h4>OBS VERTICAL: vídeo e fontes</h4><ul>' +
        '<li>Configurações → <b>Vídeo</b>: base e saída <b>1080x1920</b>, FPS <b>30</b>. Saída: taxa de bits <b>3500</b>.</li>' +
        '<li>Mesmas 3 fontes, com estes links e tamanho <b>1080 x 1920</b>:<br>TELA FUNDO:' + c(L.vFundo) + 'AULA: Posição <b>0 / 250</b>, caixa <b>Esticar para os limites</b>, tamanho <b>1080 x 608</b>.<br>TELA FRENTE:' + c(L.vFrente) + '</li>' +
        '<li>Áudio: igual ao do YouTube (só a AULA com som).</li></ul></div>' +
        '<div class="passo"><h4>OBS VERTICAL: os destinos do Multiple output</h4><p>Menu <b>Docas</b> → marque <b>Multiple output</b>. No quadro que aparece, clique em <b>Adicionar novo destino</b> 5 vezes, com estes nomes:</p>' +
        '<ul><li><b>IG 4blueoficial</b> · <b>IG renan.kaminski</b> · <b>IG aleksander.avalca</b> · <b>IG othauanaraujo</b> · <b>TT 4blueoficial</b></li></ul>' +
        '<p>Em cada um, marque <b>usar as configurações de codificação da saída principal</b> (assim o PC codifica uma vez só). Servidor e chave ficam vazios: a equipe cola a cada bloco.</p>' +
        '<p class="ajuda">O OBS VERTICAL não precisa clicar em "Iniciar transmissão": quem transmite são os destinos do Multiple output.</p></div>' +
        '<div class="passo"><h4>Acesso remoto para a equipe</h4><p>No PC da live, abra <a href="https://remotedesktop.google.com/access" target="_blank" rel="noopener">remotedesktop.google.com/access</a> com a conta Google da 4blue, instale e ative o acesso remoto com um PIN. Passe o PIN só para quem opera os blocos (pessoalmente, não em grupo). Assim qualquer pessoa da equipe cola as chaves no OBS sem estar na casa do colega.</p><p class="ajuda">As senhas do Instagram e do TikTok não ficam no PC da live: cada um cria a live no próprio computador.</p></div>' +
        '<div class="passo"><h4>Teste final</h4><p>No painel, aba <b>Agora</b>: as bolinhas do OBS horizontal e vertical ficam verdes em até 1 minuto. Mude uma chamada na aba Tela, salve e veja a mudança no OBS.</p></div>' +
        '<div class="passo"><h4>Depois de reiniciar o PC (se acontecer)</h4><ol><li>Confira se o vídeo continua em <code class="in">C:\\LIVE24H</code>.</li><li>Abra <b>OBS YOUTUBE</b> → <b>Iniciar transmissão</b>.</li><li>Abra <b>OBS VERTICAL</b> (os destinos só quando tiver bloco).</li></ol></div></div>'
    }
  ];
};
