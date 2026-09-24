# Composição delimitada — #857, preservando #809 e #835

Estado: preparada e testada; **não é RC congelada nem entrega em staging**.

Base master: `d84cfa176d5d24c5b9830c720e6b0f518f53e58c`.
Código de produto preparado: `f4a64a8dbee32fe3e4cb9d1410f8774def22db93`.
Refs completas: `.release/task-857-composition.json`.

## O que entra

Somente o delta original da #857, reconciliado com a base atual: mainCompany representa a empresa do domínio; currentCompany representa a seleção. Preserva rota HTTP, políticas de fallback e mudanças posteriores da base. Commits originais preservados na ancestralidade dos merges. Módulos: ui-people 4cec40b, ui-default 9f8846a, ui-customers 235226d.

#809 e #835 já foram integradas pela PR #846 (784869fd), ancestral da base atual. O gitlink ui-orders permanece bb577ac6; a implementação operacional/tooltip e estabilidade das rotas foram preservadas. Não reintegrar essas tasks nem reutilizar a RC 1.10.30.

## Validação desta composição

Node 20.20.0. Verificador de contrato passou. Build Expo web passou. Jest: 11 suítes/33 testes passaram (contrato/company, arquivos, vendedores, configuração operacional, estabilidade das rotas e identificação/contexto de comandas). Aviso preexistente de nome duplicado ui-pcp/ui-ppc no Jest; testes executaram.

Navegação autenticada com bundle local e API real dd.controleonline.com: bootstrap, troca de empresa e persistência após reload passaram; nenhum pageerror ou HTTP >=400 da API observado; viewport 390x844 sem overflow horizontal. Frontend servido por interceptação local: **não prova publicação em dev/staging**. Sem operações de escrita de pedidos/clientes nesta revisão.

## Limite e sequência restante

Não incorporar a PR #874 inteira à RC: ela usa módulos agregados de dev e contém uma correção de runner fora deste pacote. PR ui-default#36 preserva ajustes adicionais da investigação, também fora deste pacote. Nenhum trabalho anterior foi apagado.

Esta branch é um artefato de composição para revisão. O manifesto de RC herdado da base não autoriza esta entrega: `.release/task-857-composition.json` é a referência de preparação e declara explicitamente não congelada.

Faltam integrar/revisar esta composição exata, registrar quatro decisões formais, publicar os merges dos módulos na nova RC, congelar manifesto do pai, promover e homologar staging. Não emitir In Review antecipadamente. Falhas gerais de CI devem ser classificadas com evidência do baseline pelo fluxo canônico; não corrigir indiscriminadamente outras tasks nem ignorar os gates.

A entrega original está preservada. Próxima execução deve partir deste pacote, e não reiniciar a investigação de dev.
