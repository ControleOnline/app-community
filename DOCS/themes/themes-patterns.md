# themes-patterns.md

Objetivo:
- definir padroes globais de map para papeis visuais recorrentes
- evitar que o mesmo componente use tokens diferentes em telas diferentes
- servir como referencia rapida para qualquer modulo, nao apenas `general-settings`

Regra geral:
- usar sempre nomes canonicos de `themes-map.md`
- nao inventar alias locais
- nao misturar tokens diferentes para o mesmo papel visual
- quando o mesmo papel visual reaparecer em outra tela, reutilizar o mesmo token

## padroes globais

### contador
- fundo do contador: `badgeBackground`
- texto do contador: `badgeText`

### card de secao
- fundo do card: `cardBackground`
- borda do card: `cardBorder`
- titulo principal: `cardText`
- texto de apoio: `textSecondary`

### botao de ajuda `?`
- icone/acento do tooltip: `iconInfo`

### icone de cabecalho de grupo ou secao
- fundo do wrapper do icone: `cardIconBackground`
- borda do wrapper do icone: `cardIconBorder`
- cor do icone: `cardIconColor`

### seletor visual
- estado marcado: `iconActive`
- estado desmarcado: `iconDisabled`

Aplicar este padrao em:
- checkbox
- radio
- estrela de opcao ativa
- lista selecionavel
- item configurado com `check-circle`

### acao de remocao ou exclusao
- remover com `-`: `iconDanger`
- lixo / lixeira / delete / trash: `iconDanger`

### loading
- spinner de carregamento: `loadingSpinner`

### placeholder de input
- placeholder de campo: `inputPlaceholderText`

### switch
- trilha ligada: `switchOnTrack`
- trilha desligada: `switchOffTrack`
- thumb ligado: `switchOnThumb`
- thumb desligado: `switchOffThumb`
- trilha desabilitada: `switchDisabledTrack`
- thumb desabilitado: `switchDisabledThumb`

### chip de status
- texto e icone do estado ativo: `badgeSelectedText`
- texto e icone do estado inativo: `badgeDisabledText`
- fundo do estado ativo: `badgeSelectedBackground`
- borda do estado ativo: `badgeSelectedBorder`
- fundo do estado inativo: `badgeDisabledBackground`
- borda base: `badgeBorder`

## exemplos aplicados

### clients-index
- contador do rodape: `badgeBackground` + `badgeText`

### general-settings
- card da secao: `cardBackground` + `cardBorder` + `cardText` + `textSecondary`
- tooltip `?`: `iconInfo`
- icone do cabecalho da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- loaders das tabs: `loadingSpinner`
- placeholders dos campos: `inputPlaceholderText`
- switches das tabs: `switchOnTrack` + `switchOffTrack` + `switchOnThumb` + `switchOffThumb` + `switchDisabledTrack` + `switchDisabledThumb`

### general-settings / shop
- grupos de preferencias: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- icones internos padrao de cards e listas: `cardIconColor`
- seletores de `Catalogo do shop`: `iconActive` + `iconDisabled`
- seletores de `Enderecos exibidos no localizador`: `iconActive` + `iconDisabled`
- opcoes de `Entrada principal`: `iconActive` + `iconDisabled`
- remocao com `remove-circle-outline`: `iconDanger`

### general-settings / order print
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- chip de ativacao: `badgeSelectedText` + `badgeDisabledText`
- selecao de devices: `iconActive` + `iconDisabled`

### general-settings / order payment
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- chips de ativacao: `badgeSelectedText` + `badgeDisabledText`
- selecao de devices: `iconActive` + `iconDisabled`

### general-settings / menu catalog
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- categorias e grupos ocultos: `iconActive` + `iconDisabled`

### general-settings / crm
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- `delete`: `iconDanger`

### general-settings / maps
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- placeholder dos campos: `inputPlaceholderText`

### general-settings / integrations
- icones das secoes: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- loading das credenciais: `loadingSpinner`

### general-settings / display preparation
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- item configurado com `check-circle`: `iconActive`

### general-settings / operations
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- loading da secao: `loadingSpinner`

### general-settings / logs
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- switches: `switchOnTrack` + `switchOffTrack` + `switchOnThumb` + `switchOffThumb` + `switchDisabledTrack` + `switchDisabledThumb`

### general-settings / login
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`

### general-settings / maintenance
- icone da secao: `cardIconBackground` + `cardIconBorder` + `cardIconColor`
- switches: `switchOnTrack` + `switchOffTrack` + `switchOnThumb` + `switchOffThumb` + `switchDisabledTrack` + `switchDisabledThumb`
