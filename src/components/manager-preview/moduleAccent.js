import {processColor} from 'react-native';

export function resolveModuleAccent(categoryColor, palette = {}) {
  const color = typeof categoryColor === 'string' ? categoryColor.trim() : '';
  const token = /^\$([A-Za-z][\w-]*)$/.exec(color)?.[1];
  const resolved = token && Object.hasOwn(palette, token) ? palette[token] : color;
  if (typeof resolved !== 'string' || !resolved) return undefined;

  // Reject invalid and fully transparent colors so the active indicator stays visible.
  const argb = processColor(resolved);
  return typeof argb === 'number' && (argb >>> 24) > 0 ? resolved : undefined;
}

// Explicit provenance: runtime menu IDs identify menus, not database route IDs.
export function moduleAccentSource(value, source, record, reference, properties = ['backgroundColor']) {
  return value ? JSON.stringify(properties.map(property => ({property, source, record, reference, value}))) : undefined;
}

// Marks the editable category/route record behind an element, so the theme inspector can offer
// every color field of the record, including those still empty.
export function moduleRecordSource(kind, record, fields) {
  return record == null || record === '' ? undefined : JSON.stringify({kind, record: String(record), fields});
}

// Unlike the legacy accent, optional foreground/icon backgrounds may be fully transparent.
export function modulePropertyColor(value, palette = {}) {
  const reference = typeof value === 'string' ? value.trim() : '';
  const token = /^\$([A-Za-z][\w-]*)$/.exec(reference)?.[1];
  const resolved = token ? palette[token] : reference;
  return typeof resolved === 'string' && typeof processColor(resolved) === 'number' ? resolved : undefined;
}

const LEGACY_COLUMNS = {color: 'color', textColor: 'text_color', iconColor: 'icon_color', iconBackgroundColor: 'icon_background_color'};

// Module colors come only from the category/route records: the new columns first, then the legacy ones.
// Nothing is read from the theme here; an element without a registered color gets no color.
export function moduleColor(record, fields, palette = {}, {accent = false} = {}) {
  const resolve = accent ? resolveModuleAccent : modulePropertyColor;
  for (const field of fields) {
    const reference = record?.[field];
    const value = resolve(reference, palette);
    if (value) return {value, field, reference};
  }
  return {};
}

// Provenance for the theme inspector: legacy columns use the database names, new ones their own.
export function moduleColorSource(table, color, id, property = 'color') {
  if (!color?.value) return undefined;
  return moduleAccentSource(color.value, `${table}.${LEGACY_COLUMNS[color.field] || color.field}`, id, color.reference, [property]);
}
