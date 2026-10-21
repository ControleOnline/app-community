# Tema da prévia — contrato local de 16/10/2026

O tema continua sendo escolhido pelo domínio (`PeopleDomain -> Theme`), e não
pela empresa operacional selecionada. A adaptação inicial de código não alterou
o banco. Depois, com autorização explícita em 16/10, foi criado o tema independente
ON_MANAGER_NEUTRAL_20261016 (/themes/11) no banco de staging, vinculado somente
a localhost:8081. Os outros 24 vínculos e o tema anterior permaneceram iguais.
Ver docs/themes/on-manager-neutral/application-validation.json. Sem commit, push
ou publicação de código.

`src/styles/managerTheme.js` resolve somente referências entre tokens. O modo
claro preserva os valores semânticos recebidos; os nomes usados pela tabela são
mapeados explicitamente para bg-headers-light/bg-even-light/bg-odd-light. O modo
escuro referencia bg-dark, darkCard, darkBorder e os tokens de menus, cabeçalhos
e linhas dark já existentes no tema. Não há valores de cor fixos nesse resolvedor,
transformação automática de cor, aliases por tentativa ou paleta substituta.

A antiga previewPalette agora delega a esse contrato; o provider continua
reaplicando mudanças reais da origem e restaurando o tema ao sair da prévia.
Token obrigatório ausente fica sem substituição e aparece como configuração
incompleta no shell. A adaptação do DefaultTable não substitui tokens ausentes
por outras superfícies. O tema determina as cores; o layout determina a geometria.

Verificação: 140 testes / 33 suítes e exportação web passaram. A consulta pública
à API local themes-colors.css, com o domínio localhost:8081, confirmou os tokens
obrigatórios nos dois modos e que todos os valores resolvidos pertencem ao tema
recebido. Testes cobrem troca de domínio/modo, valores exatos, ausência de tokens,
restauração do provider e preservação de campos da marca. Não foi homologada a
pintura completa no navegador nesta rodada.

Escopo delimitado à prévia e à sua tabela: os mecanismos históricos do aplicativo
paralelo não foram removidos globalmente; cores da ilustração/carta do avatar não
são uma paleta de componentes e foram preservadas. Tema por empresa independente
é outra regra de negócio e não foi introduzida silenciosamente.
