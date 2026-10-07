# Preparação operacional no APP

Task: ControleOnline/app-community#1013.

## Composição

A rota existente `OnboardingPage` (`/onboarding`) é composta no APP por
`src/onboarding/OnboardingPage.js`. O pacote `ui-manager` mantém sua entrada,
mas o consumidor substitui apenas o componente dessa rota. Não há cópia dos
submódulos antigos nem edição dos pacotes instalados para esta feature.
Um atalho na home ADMIN/MANAGER abre essa mesma rota para os responsáveis
autorizados; o conteúdo da home continua sendo o componente do pacote atual.

A página utiliza os pacotes npm declarados no APP. As gravações continuam nas
telas desses pacotes e nos contratos Composer existentes da API. Não foi
necessária uma entidade, endpoint ou migração de onboarding.

| Etapa | Rotas atuais reutilizadas |
| --- | --- |
| Empresa e responsáveis | MyCompaniesPage, UsersPage |
| Equipe e garçons | EmployeesPage, UsersPage |
| Produtos e catálogo | ProductsPage, ProductShowcasesPage |
| Devices | DevicesIndex, ConfiguratorPage e editor específico do equipamento |
| Filas e produção | DisplayList, com os fluxos existentes de filas e produtos |
| Revisão | Acompanhamento local e observações; não ativa a operação |

Para cada equipamento, o resolvedor `getDeviceDetailRoute` do `ui-common`
escolhe o editor. O parâmetro é `deviceId` do **Device**, e não o ID de
DeviceConfig. As interpretações de modo, mesa/comanda, gerenciamento do vínculo
e cobrança reutilizam os helpers atuais de configuração. A flag canônica
`order-charge-enabled` não é inferida do gateway ou do modo garçom.

O garçom é um modo do PDV; não é criado um papel de usuário novo pelo
onboarding. Contas de login e vínculos de colaboradores permanecem distintos.

## Leitura e evidência

As únicas leituras específicas do onboarding são GET de `people_links`,
`products`, `device_configs`, `queues` e `displays`. Os filtros de empresa são
enviados ao servidor e os registros retornados são novamente delimitados pela
empresa selecionada antes da apresentação. Há paginação limitada a 20 páginas;
resultado incompleto é marcado como parcial. Uma falha de consulta não é
convertida em coleção vazia nem em configuração inexistente.

Os dados são indicativos de cadastros disponíveis, não prova de funcionamento.
As marcações são explicitamente revisão humana local. O onboarding não cria
pedido, pagamento, comando remoto ou configuração ao ser aberto.

As telas de cadastro/configuração mantêm suas próprias autorizações. A API
continua responsável pela decisão financeira em cada operação. Para o
onboarding, a entrada administrativa exige os vínculos/permissões da empresa
selecionada; um ROLE_MANAGER global de outra empresa não concede acesso.
ROLE_SUPER sem vínculo administrativo vê apenas a pré-visualização.

## Rascunho

AsyncStorage armazena apenas escolhas, etapa, notas e revisões. A chave contém
API, domínio, aplicação base, empresa e usuário. Configurações dos equipamentos,
respostas da API, credenciais e tokens não são gravados nesse rascunho.
Falha de armazenamento mantém as escolhas em memória com aviso. Mudança de
contexto invalida respostas pendentes e a retomada aguarda gravações anteriores.

O rascunho de versões anteriores não é migrado: ele não serve como prova de
configuração da composição atual.

## Verificações

`npm test -- --runInBand` inclui os projetos de testes gerais e de onboarding.
`npm run test:onboarding` executa somente o onboarding.
`npm run test:waiter` executa a regressão existente do garçom.

Depois de exportar o APP web em um diretório local, execute:

```sh
npm run test:onboarding:browser -- /caminho/absoluto/do/export
```

O smoke executa o APP exportado em um servidor local temporário, com sessão e
dados sintéticos. Todas as requisições que não são assets locais são
interceptadas. Não utiliza sessão operacional nem acesso ao banco. Verifica
mobile/desktop, acompanhamento após recarga, dispositivos e revisão, com
capturas em `/tmp/onboarding-1013-mobile.png` e
`/tmp/onboarding-1013-desktop.png`.

Teste sintético e compilação não substituem o aceite autenticado: conferir os
cadastros reais, os acessos da equipe, os devices, o lançamento e a consulta do
garçom, a produção e a cobrança conforme a autorização comercial.
