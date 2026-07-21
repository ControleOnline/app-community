flowchart TD

%% =====================================================
%% ENTRADA NO ORDER HISTORY (+)
%% =====================================================

    PDV_NOVA[PDV - Nova compra]
    PDV_TIPO{Tipo do vínculo}
    PDV_NUMERO[Perguntar número]
    PDV_VINCULO[Validar e criar vínculo]

    PDV_NOVA --> PDV_TIPO
    PDV_TIPO -->|TAB| PDV_NUMERO
    PDV_TIPO -->|TABLE| PDV_NUMERO
    PDV_TIPO -->|STAMP| PDV_VINCULO
    PDV_NUMERO --> PDV_VINCULO
    PDV_VINCULO --> COMPRA_INICIO

%% =====================================================
%% FLUXO DE COMPRA NO PDV
%% =====================================================

    COMPRA_INICIO[Iniciar compra]
    COMPRA_FIDELIDADE{Fidelidade ativada?}

    COMPRA_INICIO --> COMPRA_FIDELIDADE
    COMPRA_FIDELIDADE -->|Não| PAGAMENTO_TELA
    COMPRA_FIDELIDADE -->|Sim| CPF_INFORMADO

%% =====================================================
%% VALIDAÇÃO DE CPF
%% =====================================================

    CPF_INFORMADO{CPF informado?}
    CPF_CADASTRADO{CPF cadastrado?}
    CPF_COMPLETO{Cartão completo?}

    CPF_INFORMADO -->|Não| PAGAMENTO_TELA
    CPF_INFORMADO -->|Sim| CPF_CADASTRADO
    CPF_CADASTRADO -->|Não| PAGAMENTO_TELA
    CPF_CADASTRADO -->|Sim| CPF_COMPLETO
    CPF_COMPLETO -->|Não| PAGAMENTO_TELA
    CPF_COMPLETO -->|Sim| BRINDE_MENSAGEM

%% =====================================================
%% FLUXO DE BRINDE
%% =====================================================

    BRINDE_MENSAGEM[Exibir mensagem de brinde]
    BRINDE_TELA[Abrir tela pagamento]
    BRINDE_CARTAO[Mostrar apenas Cartão Fidelidade]
    BRINDE_BLOQUEIO[Bloquear troca de opção]
    BRINDE_FINALIZAR[Finalizar operação]
    BRINDE_FECHAR_PAI[Alterar pai para closed]

    BRINDE_MENSAGEM --> BRINDE_TELA
    BRINDE_TELA --> BRINDE_CARTAO
    BRINDE_CARTAO --> BRINDE_BLOQUEIO
    BRINDE_BLOQUEIO --> BRINDE_FINALIZAR
    BRINDE_FINALIZAR --> BRINDE_FECHAR_PAI

%% =====================================================
%% PAGAMENTO NORMAL
%% =====================================================

    PAGAMENTO_TELA[Ir para tela de pagamento]
    PAGAMENTO_MEIOS[Mostrar meios de pagamento]
    PAGAMENTO_FINALIZAR[Finalizar operação]

    PAGAMENTO_TELA --> PAGAMENTO_MEIOS
    PAGAMENTO_MEIOS --> PAGAMENTO_FINALIZAR

%% =====================================================
%% REGRA DE GRAVAÇÃO NOS ORDERS
%% =====================================================

    PAGAMENTO_FINALIZAR --> FIDELIDADE_VERIFICAR

    FIDELIDADE_VERIFICAR{Possui produto participante?}

    FIDELIDADE_VERIFICAR -->|Não| FIDELIDADE_SALE
    FIDELIDADE_VERIFICAR -->|Sim| FIDELIDADE_PAI_STATUS

    FIDELIDADE_SALE[Pedido permanece como sale]

    FIDELIDADE_PAI_STATUS{Pai está open?}

    FIDELIDADE_PAI_STATUS -->|Não| FIDELIDADE_NAO_CONTA
    FIDELIDADE_PAI_STATUS -->|Sim| FIDELIDADE_FILHO_VALIDO

    FIDELIDADE_FILHO_VALIDO{Filho está pago\n+ vinculado ao pai\n+ possui produto participante?}

    FIDELIDADE_FILHO_VALIDO -->|Não| FIDELIDADE_NAO_CONTA
    FIDELIDADE_FILHO_VALIDO -->|Sim| FIDELIDADE_CONTAR

    FIDELIDADE_CONTAR[Conta como carimbo]

    FIDELIDADE_NAO_CONTA[Não entra na fidelidade]

%% =====================================================
%% PRIMEIRA COMPRA ELEGÍVEL
%% =====================================================

    FIDELIDADE_CONTAR --> FIDELIDADE_PRIMEIRA{É a primeira compra elegível?}

    FIDELIDADE_PRIMEIRA -->|Sim| FIDELIDADE_TRANSFORMAR
    FIDELIDADE_PRIMEIRA -->|Não| FIDELIDADE_MANTER

    FIDELIDADE_TRANSFORMAR[Pai vira tipo fidelity]
    FIDELIDADE_MANTER[Pai permanece open para novos filhos]