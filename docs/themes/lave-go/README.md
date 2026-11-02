# Lave-Go — tema aprovado no ambiente local

`light.json` e `dark.json` são dados das paletas aprovadas, usando exclusivamente
os nomes de objetos de `../themes-map.md`. Não são cores padrão ou fallbacks.
A ativação é automática no localhost/loopback com `DOMAIN=https://app.lave-go.com`.
Não depende de parâmetro na URL; claro/escuro seguem a preferência do menu do usuário.
A seleção de franquia não escolhe a paleta.
Sem essa ativação, o carregamento normal do domínio continua sendo utilizado.
Nenhum arquivo desta revisão grava na API ou no banco.

Os componentes usam os tokens diretamente, sem branches da Lave-Go, aliases de
cores ou substituição de token ausente. As cores locais não são mescladas com a
paleta de outro domínio. O seletor compartilhado de tipo de app recebe `colors`;
a adaptação provisória da dependência é reaplicável por `manager:prepare` e falha
sem sobrescrever versões incompatíveis. O CSS corretivo foi removido.

Papéis principais:
- KPI: `cardBackground`, `cardBorder`, `cardText`, `textSecondary`, `textMuted`.
- Painéis: `panelBackground`, `panelBorder`; interior do gráfico: `sectionBackground`.
- Ícones dos cards/acessos: `cardIconBackground`, `cardIconBorder`, `cardIconColor`.
- Acessos: `listItemBackground`, `listItemActiveBackground`, `listItemBorder`, `listItemText`.
- Empresa e app: `selectBackground`, `selectBorder`, `selectText`, `selectIcon`.
- Conta: tokens `menu*`; seleção de empresa: tokens `modal*` e `listItem*`.
- Cabeçalho e lateral: tokens `header*` e `navigation*`.

Geometria: removida a borda superior exclusiva dos KPIs; arredondamento original
de 16 px restaurado. O mapa atual não define cor independente para essa faixa.
Dimensões, tipografia e posicionamento são responsabilidade do layout, não das
paletas JSON. Não foram criados tokens nem colunas de banco para esses detalhes.

Limite desta etapa: os arquivos são fixtures de revisão local, não um novo formato
persistido de `Theme.colors`. O resolvedor legado dos demais domínios foi mantido;
a adequação de seus tokens/modos continua pendente de revisão nesses ambientes.
Antes de aplicar no banco, é necessário definir/validar o transporte dos dois
modos pela API (que atualmente serializa um mapa plano) e os vínculos do tema.
Não enviar os dois arquivos como um objeto aninhado para a API atual.

## Publicação da task 1292

A atribuição publicada está em `../domain-profiles.json`, com domínio e API exatos. A configuração é versionada no app, sem gravação de banco. Dev/staging usam Manager; Lave-Go mantém seu perfil isolado. O domínio Manager de produção não foi incluído. Os limites de ativação exclusivamente local descritos acima correspondem à etapa anterior de aprovação visual.
