# Manager — mapa completo aprovado no localhost

`light.json` e `dark.json` contêm os 262 nomes canônicos de `../themes-map.md`.
Não há tokens legados, cores nos componentes ou preenchimento em tempo de execução.
Origem visual: consulta somente de leitura do tema MANAGER de produção em 2026-11-02.
Os tokens ausentes foram definidos nesta proposta; não são valores já cadastrados
na produção. A proposta preserva o fundo claro #F3F7FB, cards brancos, lateral
#F1F8FB e o verde da identidade. Na revisão, botões principais, período ativo e seletor
de empresa usam o mesmo verde claro #DDF3EE do item de navegação selecionado,
com texto verde escuro para contraste.
O modo escuro usa superfícies azul-petróleo e destaque verde, com texto claro.

Ativação: http://localhost:8081/ (sem parâmetro de prévia)
Claro/escuro são controlados pelo menu do usuário já existente.
A página, DOMAIN e API_ENTRYPOINT precisam estar em loopback.
A paleta local aprovada é aplicada sem mesclar cores do tema recebido pela API.
Domínios publicados e APIs remotas não ativam esta fonte local. O tema aprovado da Lave-Go continua separado.

Nenhuma alteração de banco, schema, API, indicadores, geometria ou publicação.
Somente fonte local de tokens para avaliação. A aprovação visual não implica
que o mapa plano atual da API já suporte dois mapas aninhados de modos;
uma aplicação futura precisa preservar o contrato de transporte existente.

Validação: igualdade exata com os nomes do mapa; cobertura dos papéis consumidos;
isolamento da ativação; contraste >=4.5 para textos nas principais superfícies.
A conferência visual ocorre no app, seletor de empresas, menu da conta e interação
com os menus. O cadastro de todos os tokens não significa que todas as telas do
produto já os consumam: esta etapa não refatora os componentes de outros módulos.

## Publicação da task 1292

A atribuição publicada está em `../domain-profiles.json`, com domínio e API exatos. A configuração é versionada no app, sem gravação de banco. Dev/staging usam Manager; Lave-Go mantém seu perfil isolado. O domínio Manager de produção não foi incluído. Os limites de ativação exclusivamente local descritos acima correspondem à etapa anterior de aprovação visual.
