# On Manager · proposta neutra

Paleta aplicada em 16/10/2026 após autorização explícita do usuário para criar
um tema separado no banco de staging e vinculá-lo somente a localhost:8081.
Tema criado: ON_MANAGER_NEUTRAL_20261016 (/themes/11). Vínculo: /people_domains/25.
O tema anterior /themes/9 e os outros 24 vínculos de domínio permaneceram iguais.
Nenhum dado operacional, commit, push ou publicação de código foi feito.

- `theme.json`: formato `{theme, colors}` aceito pelo editor JSON do ThemeManager.
  Preserva os 184 tokens existentes; ajusta 59 para retomar a direção visual inicial.
- `changes.json`: valores anteriores e propostos, somente tokens de cor.
- `validation.json`: nenhum token obrigatório ausente em claro/escuro; oito pares
  de texto/fundo com contraste mínimo 4,5:1. Usa o resolvedor real de managerTheme.js.
- `roadmap/palette/index.html` na raiz do workspace: prévia autocontida, responsiva,
  com modos claro/escuro. É proposta visual com dados ilustrativos, não captura do ERP.

Superfícies claras e neutras, texto azul-escuro, navegação discreta e ação âmbar.
Modo escuro retoma os fundos azulados discretos. As cores vivem na configuração
do tema, sem retorno da paleta fixa ou fallback nos componentes.

Validação da aplicação: `application-validation.json`. Os 184 tokens retornados
pela API :8000 e pelo proxy da :8081 correspondem exatamente ao JSON preparado.
O campo background=6 foi preservado do tema anterior: o banco exige valor não nulo,
embora o modelo da API declare nullable. A primeira tentativa sem esse campo
falhou sem criar o tema; a criação com o valor preservado passou.
A verificação é de configuração e HTTP, sem homologação visual do navegador.
Recarregar a 8081 para buscar a nova configuração.

Reversão: PUT /people_domains/25 com {"theme":"/themes/9"}, com autorização.
A reversão restaura somente o vínculo local, sem apagar o tema novo.
