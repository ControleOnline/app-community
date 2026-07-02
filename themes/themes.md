### ### ### ### ### ##### ### ### ### ### ###
### ### ### ENTENDIMENTO ALINHADO ### ### ###
### ### ### ### ### ##### ### ### ### ### ###

No `app-community`, cor hardcoded é qualquer cor ou transparência definida diretamente no código, em vez de vir do tema oficial.

Isso inclui:
- `#HEX`, `rgb(...)`, `rgba(...)`
- `'white'`, `'black'`, `'transparent'`
- opacidades e transparências visuais fixas no componente
- qualquer variação visual decidida localmente no arquivo

A regra correta é:
- As cores devem vir somente do tema atrelado ao `DOMAIN`
- A fonte oficial desse tema é o fluxo do `DOMAIN -> PeopleDomain -> Theme -> theme.colors -> /themes-colors.css`
- No frontend, a referência correta é o tema carregado desse domínio e colocado no store `theme.colors`

E a restrição mais importante:
- Não usar `defaultCompany.theme`
- Não usar `currentCompany.theme`
- Mesmo que existam no código hoje, eles não devem ser tratados como fonte correta de cor

Definição importante para este trabalho:
- variável é o nome que usamos para nos referir a uma cor
- conteúdo é a cor que está dentro da variável

Exemplo:
- `background=white` significa que a variável se chama `background` e que o conteúdo dela é `white`

Então, resumindo em uma frase:
- Valor visual de cor ou transparência só é válido se vier do tema do `DOMAIN`; se estiver literal no arquivo ou vier de `defaultCompany/currentCompany`, está errado.

### ### ### ### #### #### ### ### ### ###
### ### ### FLUXO DE TRABALHO ### ### ###
### ### ### ### #### #### ### ### ### ###

### LEVANTAMENTO
1. Primeiro vamos ler exclusivamente o tema do `DOMAIN` e montar uma memória temporária com:
- nome da variável
- valor atual

2. Depois vamos varrer `app-community` módulo por módulo e arquivo por arquivo.

3. Para cada cor/transparência fora da regra do `themes.md`, vamos gravar no arquivo themes-todo.md

### EXECUÇÃO
1. Para cada registro no themes-todo.md em MÓDULOS / ARQUIVOS HARDCODED:

2. Se existir em memória a variável com o mesmo nome:
- a comparação deve ser feita pelo nome da variável, e não pelo conteúdo
- removemos do arquivo o conteúdo hardcoded
- substituímos a origem do valor pela variável oficial do tema do `DOMAIN`
- o objetivo é manter o mesmo papel visual, mas trocar a fonte do valor para o tema carregado do `DOMAIN`

exemplo:
    em memória: background=white
    no arquivo: background=white

    substituir no código para algo equivalente a:
    background = theme.colors.background

3. Se no arquivo existir uma variável local com nome ruim, mas que claramente representa um token do tema:
- além de trocar o valor, vamos renomear a variável para o nome canônico do tema
exemplo:
    em memória: background=white
    no arquivo: xpto=white
    substituir no código para algo equivalente a:
    background = theme.colors.background

4. Se houver um valor hardcoded mas o contexto não for claro o suficiente para mapear com segurança:
- não corrigimos no escuro
- registramos em um bloco de `pendente`

5. Se existir uma necessidade visual real no código e não houver variável correspondente no tema do banco:
- criamos uma nova variável de tema num arquivo "themes-new.md" (que deve ter o theme local + os novos, para ficar fácil de acompanharmos as mudanças)
- registramos essa nova variável na memória temporária
- e depois usamos essa variável no código

6. O `themes-todo.md` vira o rastreador operacional:
- o que está hardcoded
- o que foi corrigido
- o que ficou pendente
- e o que precisou nascer como novo token de tema
