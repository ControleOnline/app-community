# Dispositivos — adaptação local de 16/10/2026

Escopo: somente DevicesIndex na prévia MANAGER. Resultados, Configurador,
DeviceDetail e as regras de PDV/mesa/comanda não foram alterados.

## Particularidades preservadas

- DefaultTable com cartões agrupados por dispositivo físico e configurações clicáveis.
- CompactFilterSelector para tipos e subtipos de gateways PDV (Cielo, Getnet, InfinitePay).
- Identificação e prioridade do dispositivo atual, indicadores operacionais e de rede.
- Rotas de detalhes e criação; os callbacks existentes permanecem intactos.
- Paginação, consultas e stores originais; nenhuma gravação operacional no teste.

## Alteração

ManagerDevicesPage passa uma paleta explícita derivada dos tokens do tema ativo.
A lista, as abas agrupadas e os cartões usam essa paleta sem sobreposição das
cores da empresa. Os aliases de fundo/texto/seleção são referências diretas a
tokens. As cores dos ícones e chips dos tipos passam a usar cardIconColor nesse
adaptador; a identificação textual do tipo permanece. Isso acompanha o modo
claro/escuro do Manager sem reintroduzir uma paleta literal nos componentes.

DevicesIndex usa o cabeçalho compartilhado do Manager. Título e descrição ficam
no conteúdo; Voltar é oferecido quando navigation.canGoBack() permite. O shell
continua oferecendo empresa, conta e menu. Detalhes conservam o cabeçalho nativo.

O pacote publicado ui-common 1.2.97 recebe apenas props opcionais. Ausente a
paleta explícita, mantém o comportamento anterior. O overlay local tem hashes
antes/depois e valida todos os três arquivos antes de escrever. Está integrado
a web:manager-preview e pode ser reaplicado sem duplicar alterações.

## Validação

- Teste antes: Devices ignorava a paleta explícita e usava a cor da empresa.
- Testes depois: prioridade da paleta, propagação ao trocar filtro, estilo do
  cartão e callback com registro original; cabeçalho/voltar e caminho legado.
- 146 testes / 36 suítes do Manager aprovados.
- 16 testes / 2 suítes de agrupamento/identidade/filtros de dispositivos aprovados,
  com host React Native substituído por stub para a execução Node.
- Exportação web da prévia aprovada em /tmp/on-manager-devices-build.
- Overlay reaplicado sem conflito; git diff --check aprovado.

Limites: não é homologação visual no navegador, nem ensaio com impressora,
gateway, criação/edição de Device Config ou operação de venda. Nenhum tema ou
vínculo de domínio foi modificado nesta rodada. Sem commit ou push.
