export const homeMetrics = {
  'closed-sales': {key: 'ClosedSales', label: 'Vendas concluídas'},
  'period-orders': {key: 'PeriodOrders', label: 'Pedidos no período'},
  'open-orders': {key: 'OpenOrders', label: 'Em andamento'},
  clients: {key: 'Clients', label: 'Clientes'},
};
export const metricRoles = {
  Background: 'fundo', Border: 'borda', Text: 'valor principal', SecondaryText: 'título e período',
  MutedText: 'descrição e mensagens', IconBackground: 'fundo do ícone', IconColor: 'cor do ícone',
};
export const metricChoiceKey = id => `homeMetric${homeMetrics[id].key}Appearance`;
export const metricNameKey = id => `homeMetric${homeMetrics[id].key}SpecificName`;
export const metricBaseKey = id => `homeMetric${homeMetrics[id].key}SpecificBase`;
export const metricChoice = (colors, id) => ['primary', 'secondary', 'specific'].includes(colors[metricChoiceKey(id)]) ? colors[metricChoiceKey(id)] : 'default';
export const specificBase = (colors, id) => ['primary', 'secondary'].includes(colors[metricBaseKey(id)]) ? colors[metricBaseKey(id)] : 'default';
export const metricPrefix = (id, choice) => choice === 'default' ? 'indicatorCard' :
  choice === 'specific' ? `homeMetric${homeMetrics[id].key}` : choice === 'primary' ? 'homeMetricPrimary' : 'homeMetricSecondary';
export const metricTokens = (id, choice) => Object.keys(metricRoles).map(role => `${metricPrefix(id, choice)}${role}`);
export const metricAppliedToken = (id, role) => `homeMetric${homeMetrics[id].key}Applied${role}`;
export const isHomeAppearanceColorToken = token =>
  /^(?:homeMetric(?:Primary|Secondary|ClosedSales|PeriodOrders|OpenOrders|Clients)|homeResults)(?:Background|Border|Text|SecondaryText|MutedText|IconBackground|IconColor)$/.test(token);
// Names remain editable labels; stable IDs and CSS-safe scalar transport never depend on them.
export const encodeAppearanceName = name => `v1_${String(name).slice(0, 80).split('').map(char => char.charCodeAt(0).toString(16).padStart(4, '0')).join('')}`;
export function appearanceName(colors, id) {
  const encoded = colors[metricNameKey(id)];
  if (typeof encoded !== 'string' || !/^v1_(?:[a-f0-9]{4}){0,80}$/.test(encoded)) return `${homeMetrics[id].label} — específica`;
  return (encoded.slice(3).match(/.{4}/g) || []).map(char => String.fromCharCode(parseInt(char, 16))).join('');
}
export function chooseMetricAppearance(colors, id, choice) {
  if (!Object.hasOwn(homeMetrics,id) || !['default', 'primary', 'secondary', 'specific'].includes(choice)) throw new Error('Aparência inválida.');
  const changes = {[metricChoiceKey(id)]: choice};
  if (choice === 'specific' && !colors[metricNameKey(id)]) {
    changes[metricNameKey(id)] = encodeAppearanceName(`${homeMetrics[id].label} — específica`);
    changes[metricBaseKey(id)] = metricChoice(colors, id) === 'specific' ? 'default' : metricChoice(colors, id);
  }
  return changes;
}
const own = (raw, token, mode) => {
  const key = Object.hasOwn(raw, `${token}-light`) || Object.hasOwn(raw, `${token}-dark`) ? `${token}-${mode}` : token;
  return raw[key] == null || String(raw[key]).trim() === '' ? null : {value: raw[key], source: key};
};
export function applyHomeMetricAppearances(raw, mode, values, sources) {
  const set = (token, entry) => {if (entry?.value != null) {values[token] = entry.value;sources[token] = entry.source;}};
  for (const role of Object.keys(metricRoles)) {
    const token = `indicatorCard${role}`;
    const fallback = {value: values[token], source: sources[token]};
    for (const choice of ['primary', 'secondary']) {
      const target = `${metricPrefix('closed-sales', choice)}${role}`;
      set(target, own(raw, target, mode) || fallback);
    }
    for (const id of Object.keys(homeMetrics)) {
      const specific = `${metricPrefix(id, 'specific')}${role}`;
      const base = `${metricPrefix(id, specificBase(raw, id))}${role}`;
      set(specific, own(raw, specific, mode) || {value: values[base], source: sources[base]});
      const selected = `${metricPrefix(id, metricChoice(raw, id))}${role}`;
      set(metricAppliedToken(id, role), {value: values[selected], source: sources[selected]});
    }
    set(`homeResults${role}`, own(raw, `homeResults${role}`, mode) || fallback);
  }
}
export function homeMetricColors(colors, id) {
  return Object.fromEntries(Object.keys(metricRoles).map(role => [role, colors[metricAppliedToken(id, role)] ?? colors[`indicatorCard${role}`]]));
}
export function homeResultsColors(colors) {
  return Object.fromEntries(Object.keys(metricRoles).map(role => [role, colors[`homeResults${role}`] ?? colors[`indicatorCard${role}`]]));
}
export function homeMetricFieldLabel(token) {
  for (const [role, label] of Object.entries(metricRoles)) {
    if (token === `homeResults${role}`) return `Resultados — ${label}`;
    for (const choice of ['primary', 'secondary']) if (token === `${metricPrefix('closed-sales', choice)}${role}`) return `${choice === 'primary' ? 'Indicadores — primária' : 'Indicadores — secundária'} — ${label}`;
    for (const [id, metric] of Object.entries(homeMetrics)) if (token === `${metricPrefix(id, 'specific')}${role}`) return `${metric.label} — específica — ${label}`;
  }
  return null;
}
