# Barra inferior do Manager — validação local, 18/10/2026

## Escopo

Retomada da etapa de navegação: aparência compacta uniforme no componente compartilhado, atalhos recebidos da configuração existente por aplicativo/empresa/perfil, e preferência pessoal de visibilidade no avatar. Os itens não foram fixados em quatro: a sessão atual recebeu Home, Opportunities, Clients e Profile. Rótulos continuam passando pela tradução existente. O administrador configura os menus; a preferência do usuário não altera permissões nem a configuração remota.

O Manager utiliza RuntimeBottomNavigationBar em fluxo normal, reservando espaço ao conteúdo; ocultar a barra devolve esse espaço. O padrão compartilhado é soft em todas as telas, com suporte legado explícito preservado. O hook de preferência distingue sessão e armazenamento por usuário/aplicativo neste aparelho. Leitura assíncrona evita exibir preferência de outro usuário; falha ao salvar é informada. Consultas antigas de menus são descartadas ao trocar o contexto.

## Reuso e manutenção

- ManagerBottomNavigation é o adaptador do componente compartilhado; ManagerPreviewProvider mantém a preferência durante a navegação.
- ManagerAccountMenu expõe Mostrar/Ocultar nesta sessão e Manter visível/oculta neste aparelho.
- Overlay persistente: patches/bottom-navigation.json e payloads associados. scripts/apply-bottom-navigation-patch.cjs valida versões e todos os hashes antes de escrever e é idempotente. Após reinstalar dependências, aplicar antes de iniciar a prévia nativa. Os atalhos de prévia web já aplicam o overlay.
- Sem novo APK nesta etapa: alterações JavaScript servidas pelo Metro à instalação debug localpreview existente.

## Evidência

236 testes em 60 suítes passaram; 9 testes de regras de menus passaram. git diff --check e reaplicação idempotente do overlay passaram. Testes incluem preferências por usuário/aplicativo, falhas de armazenamento, sessão, reinício, respostas obsoletas e filtros de menus.

No APK On Manager local, API 25: mesma barra em Home, Clientes e PDV; ocultação mantida entre rotas; reexibição pelo avatar; preferência oculta mantida após encerrar/reabrir o processo; preferência visível restaurada; ocultação apenas na sessão descartada no reinício. Menu do avatar conferido em retrato e paisagem, sem invadir os botões do Android. Rotação original restaurada e Home deixada com barra visível. Processo final 10022 sem ReactNativeJS:E ou AndroidRuntime:E na leitura dos logs.

A primeira tentativa automatizada de restaurar visibilidade foi interceptada pelo aviso de desenvolvimento sobre push/Firebase. Após fechar o aviso, o mesmo caminho passou sem alteração do produto. Esse aviso conhecido do pacote local não foi ocultado globalmente.

Capturas e logs: ../.codex/qa-native-manager-api25/bottom-navigation-20261018/ a partir da raiz do workspace (pasta irmã de app-community). runtime-summary.json resume o resultado e runtime-first-pass.log preserva a tentativa inicial, inclusive a falha de automação.

## Roteiro manual

1. Na Home do On Manager local, abrir Clientes pela barra e voltar por Home; depois abrir PDV pelo menu lateral. Conferir visual uniforme.
2. Avatar → Ocultar nesta sessão. Navegar entre telas: barra ausente e conteúdo ocupa o espaço.
3. Avatar → Mostrar nesta sessão. A barra reaparece.
4. Avatar → Manter oculta neste aparelho. Encerrar o app e reabrir: deve continuar oculta.
5. Avatar → Manter visível neste aparelho. A barra reaparece e volta a ser o padrão no reinício.
6. Opcional: ocultar apenas nesta sessão e encerrar/reabrir: a preferência visível deve voltar.

## Limites

Validação local no emulador; não comprova pinpad físico, pagamentos, produção, impressão, configuração POS nem todos os aplicativos/perfis. App original preservado. Nenhuma venda, pagamento ou configuração de device alterada. Sem commit, push, publicação ou task externa nesta etapa local. Pendências anteriores, como texto do período na Home e aviso Firebase local, continuam fora deste escopo.
