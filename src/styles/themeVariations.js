import contract from './themeContract.generated';

export function themeVariationTokens(tokens=[]) {
  const selected=new Set(tokens);
  const variants=new Set(tokens.map(token=>contract.variants?.[token]?.variant).filter(Boolean));
  for(const [token,metadata] of Object.entries(contract.variants || {}))if(variants.has(metadata.variant))selected.add(token);
  return [...selected];
}

export function describeThemeScope(tokens=[]) {
  const result=new Map();
  for(const token of tokens){
    const entry=contract.variants?.[token];
    if(entry)result.set(entry.variant,{label:entry.label,usage:entry.usage});
  }
  return [...result.values()];
}
