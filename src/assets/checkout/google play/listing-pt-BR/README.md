# Google Play — On Checkout (`com.controleonline.checkout`)

## Assets
Screenshots redimensionados para política de metadata do Play Store:
- Mobile: **1080×1920** (proporção 9:16)
- Desktop/wide: **1920×1600** (dentro de 16:9 … 9:16)

## Textos de listagem (pt-BR)
- `title.txt`
- `short-description.txt`
- `full-description.txt`

## Publicação (humano / Play Console)
1. Play Console → app **On Checkout** → Presença na loja → listagem principal (pt-BR).
2. Atualizar título, descrições curta/completa com os arquivos acima (ajustar se o console truncar).
3. Substituir screenshots de telefone pelos JPGs `01`–`03` e o wide/tablet pelo `04` se aplicável.
4. Remover imagens genéricas/antigas que não representem o fluxo real.
5. Enviar para revisão e anexar na issue #284 evidência sanitizada (status “Em análise” / ID da release, **sem** dados de cliente).

Automação de upload de listing via API exige service account com permissão de edição no pacote `com.controleonline.checkout` (não disponível neste worker).
