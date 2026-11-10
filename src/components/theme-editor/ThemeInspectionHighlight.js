import React, {useLayoutEffect, useRef, useState} from 'react';

export function groupInspectionColors(colors) {
  const result = new Map();
  for (const entry of colors) {
    const property = /^border(?:Top|Right|Bottom|Left)?Color$/.test(entry.property) ? 'borderColor' : entry.property;
    const key = JSON.stringify([property, entry.token, entry.value, entry.source, entry.record]);
    if (!result.has(key)) result.set(key, {...entry, property});
  }
  return [...result.values()];
}

export function inspectionLabelPosition(target, size, viewport, panel) {
  const clamp = (value, max) => Math.max(4, Math.min(value, Math.max(4, max)));
  const candidates = [
    [target.left, target.top - size.height - 8],
    [target.left, target.top + target.height + 8],
    ...(panel ? [[panel.left - size.width - 8, target.top], [panel.right + 8, target.top],
      [target.left, panel.top - size.height - 8], [target.left, panel.bottom + 8]] : []),
  ].map(([left, top]) => ({left: clamp(left, viewport.width - size.width - 4),
    top: clamp(top, viewport.height - size.height - 4)}));
  const overlap = position => !panel ? 0 :
    Math.max(0, Math.min(position.left + size.width, panel.right) - Math.max(position.left, panel.left)) *
    Math.max(0, Math.min(position.top + size.height, panel.bottom) - Math.max(position.top, panel.top));
  return candidates.find(candidate => overlap(candidate) === 0) || candidates.sort((a, b) => overlap(a) - overlap(b))[0];
}

export default function ThemeInspectionHighlight({hover, viewport, panel, panelPosition, translate: t}) {
  const label = useRef(null);
  const [position, setPosition] = useState({left: 4, top: 4});
  useLayoutEffect(() => {
    const size = label.current?.getBoundingClientRect();
    if (!size) return;
    const next = inspectionLabelPosition(hover, size, viewport, panel.current?.getBoundingClientRect());
    setPosition(previous => previous.left === next.left && previous.top === next.top ? previous : next);
  }, [hover, viewport, panel, panelPosition]);
  return <>
    <div aria-hidden data-co-theme-highlight="true" style={{pointerEvents: 'none', position: 'fixed',
      left: hover.left, top: hover.top, width: hover.width, height: hover.height,
      outline: '2px solid #218aff', outlineOffset: -2, background: 'transparent', zIndex: 2147482999}} />
    <div ref={label} aria-hidden data-co-theme-inspection-label="true" style={{pointerEvents: 'none', position: 'fixed',
      ...position, width: Math.min(440, viewport.width - 8), boxSizing: 'border-box', maxHeight: viewport.height - 8,
      overflow: 'hidden', padding: '5px 8px', borderRadius: 5, background: '#182235', color: '#ffffff',
      fontSize: 12, fontFamily: 'monospace', zIndex: 2147483001}}>
      <div>{hover.name} · {Math.round(hover.width)} × {Math.round(hover.height)}</div>
      {hover.colors.slice(0, 5).map(({property, token, value, source, record, reference}) =>
        <div key={`${property}:${token}:${record || ''}`} style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, overflowWrap: 'anywhere'}}>
          <span style={{display: 'inline-block', width: 12, height: 12, flexShrink: 0, border: '1px solid #ffffff', background: value || 'transparent'}} />
          <span>{token} · {value || t('Sem valor')} <span style={{color: '#c4d4e7'}}>({property})</span>
            {source && <span style={{display: 'block', color: '#c4d4e7'}}>{t('Cadastro')}: {record}
              {reference && reference !== value ? ` · ${reference} → ${value}` : ''}</span>}
          </span>
        </div>)}
      {hover.colors.length > 5 && <div>+{hover.colors.length - 5} · {t('Clique para ver todas')}</div>}
    </div>
  </>;
}
