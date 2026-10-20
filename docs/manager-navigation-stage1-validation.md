# Manager — navegação, identidade e área útil (18/10/2026)

Escopo autorizado: primeira etapa da navegação, mais a correção do menu do perfil sobreposto à navegação do Android. Tudo local; sem commit, push, task externa ou mudança em configuração de negócio. Barra inferior configurável e preferências de ocultação continuam para as próximas etapas.

## Alterações

- ManagerShell: símbolo existente do On Manager no topo mobile, com área de toque de 44 × 44 e retorno a HomePage. Reaproveitada a imagem já disponível com cantos transparentes. Rótulo do destino lateral e breadcrumb: Início. Marca lateral continua retornando à mesma rota. Menu lateral, perfis e permissões preservados.
- ManagerAccountMenu: SafeAreaProvider dentro do Modal, pois a janela do modal pode ter limites diferentes da Activity. O painel lê insets e tamanho dessa janela, respeita as barras inferiores/laterais e limita sua altura com rolagem das opções em áreas pequenas. Mantidas as ações existentes.
- ManagerRuntimeFooter: adaptador pequeno usa o RuntimeInfoFooter compartilhado com o espaçamento soft já existente. Evita alterar os consumidores legacy e conserva cores, estado de conexão, textos e rotação do conteúdo. Resolver do Metro aplica o adaptador somente na prévia habilitada; o gate do Manager preserva outros aplicativos. Nenhuma dependência nova.

## Provas

Testes novos primeiro falharam pela ausência do retorno direto e pelo posicionamento fixo do painel. Depois passaram. 223 testes / 58 suítes do Manager passaram; git diff --check passou. Fixtures cobrem área inferior de 48 e 34, ausência de área reservada e barras laterais em paisagem. Ajustado o mock de safe area no teste da experiência desativada, sem reativar Shenlong.

No AVD Pixel_2_API_25, pacote com.controleonline.manager.localpreview, processo 7492:

- PDV → símbolo do topo → Home: saudação visível.
- PDV → menu lateral → Início → Home: saudação visível.
- Menu do perfil em retrato: painel [32,1213][1048,1747]; barra do Android começa em y=1794. Última ação totalmente acima dela.
- Mesmo menu aberto durante rotação para paisagem: painel [54,499][1740,1033]; barra lateral do Android começa em x=1794. Painel não invade a barra.
- Configurações de rotação do emulador restauradas aos valores anteriores (accelerometer_rotation=1, user_rotation ausente). Home deixada aberta, em retrato.
- Sem novos erros ReactNativeJS/AndroidRuntime no processo testado. Aviso Firebase do pacote local permanece, já conhecido.

São alterações JavaScript na instalação debug existente; não foi alegada uma nova compilação binária. Metro reiniciado na 8084 para carregar o novo resolver; API e sessão preservadas. Gestos e pinpads físicos não foram testados nesta etapa. Evidências em `.codex/qa-native-manager-api25/navigation-stage1-20261018/` na raiz do workspace: screenshots, safe-area-summary.json, runtime-summary.json, runtime-navigation.log e tests.log.

## Roteiro para o usuário

1. Abra o menu de três linhas e entre no PDV.
2. Toque no símbolo On Manager ao lado do menu: deve voltar ao Início.
3. Entre novamente em outra tela, abra o menu e escolha Início: deve retornar à Home.
4. Toque no avatar: todas as opções, incluindo Sair da conta, devem estar acima dos botões do Android.
5. Gire o emulador: o painel deve continuar dentro da área útil, sem cobrir a barra lateral de navegação. Volte para retrato.
6. Confira o alinhamento do rodapé; cores e significado do indicador permanecem iguais.
