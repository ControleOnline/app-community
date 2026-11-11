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

export function moduleAccentBackground(accent) {
  return accent;
}

// List modules share foreground roles only while a registered route color applies.
// Without that accent, each surface retains its own original theme roles.
export function moduleListAppearance({accent, colors: c, sidebar = false, active = false, highlighted = active, record = {}, enabled = !!accent, palette = c}) {
  let result;
  if (accent) result = {backgroundColor: accent, iconColor: c.moduleListIcon ?? c.textMuted, textColor: c.moduleListText ?? c.cardText};
  else if (sidebar) result = {
    backgroundColor: highlighted ? c.navigationActiveBackground : c.containerTransparentBackground,
    iconColor: active ? c.navigationActiveIcon : c.navigationIcon,
    textColor: active ? c.navigationActiveText : c.navigationText,
  };
  else result = {
    backgroundColor: c.containerTransparentBackground, iconColor: c.textMuted, textColor: c.cardText,
  };
  return {...result,
    iconColor: enabled ? modulePropertyColor(record.iconColor, palette) ?? result.iconColor : result.iconColor,
    textColor: enabled ? modulePropertyColor(record.textColor, palette) ?? result.textColor : result.textColor,
  };
}

// Explicit provenance: runtime menu IDs identify menus, not database route IDs.
export function moduleAccentSource(value, source, record, reference, properties = ['backgroundColor']) {
  return value ? JSON.stringify(properties.map(property => ({property, source, record, reference, value}))) : undefined;
}

// Unlike the legacy accent, optional foreground/icon backgrounds may be fully transparent.
export function modulePropertyColor(value, palette = {}) {
  const reference = typeof value === 'string' ? value.trim() : '';
  const token = /^\$([A-Za-z][\w-]*)$/.exec(reference)?.[1];
  const resolved = token ? palette[token] : reference;
  return typeof resolved === 'string' && typeof processColor(resolved) === 'number' ? resolved : undefined;
}

export function modulePropertySource(record, field, {palette, enabled, table = 'routes', id, property = 'color'}) {
  const value = enabled ? modulePropertyColor(record?.[field], palette) : undefined;
  const column = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  return moduleAccentSource(value, `${table}.${column}`, id, record?.[field], [property]);
}
