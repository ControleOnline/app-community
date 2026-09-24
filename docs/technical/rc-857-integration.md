# #857 — integração na RC 1.10.31-rc.9

Base da branch RC: app-community master `d84cfa176d5d24c5b9830c720e6b0f518f53e58c`.

| Repo | Base do app master | PR para RC | SHA integrado |
|---|---|---:|---|
| ui-people | `1375f85ad8db738f1e191508f56ac5483092833e` | #27 | `fb105d4577e8a8f560e720b56720a602519ef7db` |
| ui-default | `b8489dfa367d1a18625e2f8783c6d4c7f72c1738` | #37 | `db2790e195642742f77255cee53c1e0053771310` |
| ui-customers | `f31cf6632d1a3064e04e0f15e9e0e6d37a5c476f` | #38 | `1b2c45c7790c932613156fd0616d8075ac363b85` |
| ui-orders (#809/#835 preservadas) | já integrado | — | `bb577ac62ad5436fa8f519999ee298a09e223a4c` |

Também ficam nos SHAs de RC existentes: ui-manager `f08b84ec0711f979717fbd3037fc2a7420a59bb3`, api-community `41348e9f224d12d378aa4d8d14adeb7d3ed1af79`, api-platform-financial `ee494c35cf2623fcf86b19d9347250fc3ef4e9ed`, api-platform-orders `0ce3f06537439d85c7602ca19710b6c8ac5230f3`. Não houve alteração nesses repos.

A branch app-community `rc/1.10.31-rc.9` parte de `d84cfa176d5d24c5b9830c720e6b0f518f53e58c` e contém somente a composição aprovada #857; a referência `.release/rc-manifest.json` permanece `frozen:false` enquanto o root candidate é revisado. Ainda não foi promovida a staging.
