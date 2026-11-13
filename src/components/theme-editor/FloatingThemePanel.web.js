import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import ThemeColorEditor from './ThemeColorEditor';
import { THEME_TOOL_BUTTON_HEIGHT } from './themeToolMetrics';
import { loadDomainTheme, editorContext } from './themeService';
import { attachThemeInspector } from './themeInspector';
import ThemeInspectionHighlight, {groupInspectionColors} from './ThemeInspectionHighlight';
import { useThemeRuntime, getThemeSnapshot } from '../../styles/themeRuntime';
import { resolveManagerTheme, describeThemeColor } from '../../styles/managerTheme';
import { resolveScreenThemeDetails } from '../../styles/screenTheme';
import { parseScreenThemeKey } from '../../styles/screenThemeKeys';
import LoginThemePreview from './LoginThemePreview.web';
import LoginPreviewOrigins from './LoginPreviewOrigins';
import {loadLoginPreviewCompany} from './loginPreviewModel';

const visibleViewport = () => {
  if (typeof window === 'undefined') return { width: 1024, height: 800, inset: 0 };
  const viewport = window.visualViewport;
  return { width: viewport?.width || window.innerWidth, height: viewport?.height || window.innerHeight, inset: viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0 };
};

const shortcutBarInset = () => {
  let inset = 0;
  for (const bar of document.querySelectorAll?.('[data-testid="bottom-navigation"]') || []) {
    const {top, width, height} = bar.getBoundingClientRect();
    if (width && height && top > 0) inset = Math.max(inset, window.innerHeight - top);
  }
  return inset;
};

export default function FloatingThemePanel({ onClose, initialView = 'screen', viewRequest = 0 }) {const c = useThemeEditorPalette();
  const runtime = useThemeRuntime();
  const mobile = useWindowDimensions().width <= 760;
  const [theme, setTheme] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const [hover, setHover] = useState(null);
  const [selection, setSelection] = useState(null);
  const [interaction, setInteraction] = useState('normal');
  const [editScope, setEditScope] = useState('global');
  const [origins, setOrigins] = useState(false);
  const [loginPreview, setLoginPreview] = useState(false);
  const [loginCompany, setLoginCompany] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [viewport, setViewport] = useState(visibleViewport);
  const [dockInset, setDockInset] = useState(0);
  const [position, setPosition] = useState({ x: null, y: 16 });
  const panel = useRef(null);
  const [portalHost] = useState(() => document.createElement ? document.createElement('div') : document.body);
  const stopDrag = useRef(null);
  const context = editorContext();
  useEffect(() => {
    if (!loginPreview) return;
    let alive = true;
    setLoginCompany(null);setLoginError('');
    loadLoginPreviewCompany().then(company => {if (alive) setLoginCompany(company);})
      .catch(error => {if (alive) {setLoginError(error.message);setInspecting(false);}});
    return () => {alive = false;};
  }, [loginPreview, context]);
  useEffect(() => {
    // Keep the same portal root (and draft) inside an open account modal's focus
    // boundary. Moving the DOM host avoids remounting the editor on menu changes.
    const place = () => {
      if (portalHost !== document.body) {
        const target = document.querySelector('[data-co-theme-editor-host="true"]') || document.body;
        if (portalHost.parentNode !== target) target.appendChild(portalHost);
      }
      if (mobile) setDockInset(shortcutBarInset());
    };
    place();
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(place);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {observer.disconnect();if (portalHost !== document.body) portalHost.remove();};
  }, [mobile, portalHost]);
  useEffect(() => {
    let alive = true;setTheme(null);setError('');setSelection(null);setInspecting(false);
    loadDomainTheme().then((value) => {if (alive) setTheme(value);}).catch((e) => {if (alive) setError(e.message || t("Não foi possível abrir o tema."));});
    return () => {alive = false;};
  }, [context, reload]);
  useEffect(() => {
    setLoginPreview(initialView === 'login');setInspecting(initialView === 'login');
    setSelection(null);setHover(null);
  // Repeated entry requests must reopen the requested view without remounting drafts.
  }, [initialView, viewRequest]);
  useEffect(() => {
    if (!inspecting) return;
    return attachThemeInspector(document, (hit) => {
      const rectangle = hit ? hit.node.getBoundingClientRect() : null;
      const snapshot = getThemeSnapshot();
      const values = resolveScreenThemeDetails(snapshot.preview || snapshot.raw, snapshot.mode, hit?.screen?.id).values;
      const computed = hit ? window.getComputedStyle?.(hit.node) : null;
      const bindings = hit?.node.matches?.(':hover') && hit.states?.hover ? hit.states.hover : hit?.bindings || [];
      const colors = groupInspectionColors([
        ...(hit?.sources || []).map(source => ({...source, token: source.source})),
        ...bindings.map(({property, token}) => ({property, token,
          value: computed?.getPropertyValue(`--co-theme-${token}`).trim() || values[token] || ''})),
      ]);
      const target = rectangle ? {left: rectangle.left, top: rectangle.top, width: rectangle.width, height: rectangle.height,
        name: hit.node.tagName?.toLowerCase() || t('Elemento'), colors} : null;
      setHover((previous) => previous && target && ['left', 'top', 'width', 'height', 'name'].every((key) => previous[key] === target[key])
        && JSON.stringify(previous.colors) === JSON.stringify(colors) ? previous : target);
    }, (hit, escape) => {
      setInspecting(false);
      if (!escape) {setSelection(hit);setInteraction('normal');setEditScope('global');setError(hit ? '' : t("Este elemento não expõe uma referência de cor do tema. Nenhuma variável foi inferida."));}
    });
  }, [inspecting]);
  useEffect(() => {
    const resize = () => {
      setViewport(visibleViewport());
      if (mobile) setDockInset(shortcutBarInset());
      const rectangle = panel.current?.getBoundingClientRect();if (!rectangle) return;
      setPosition((current) => ({ x: current.x === null ? null : Math.min(current.x, Math.max(0, window.innerWidth - rectangle.width)), y: Math.min(current.y, Math.max(0, window.innerHeight - rectangle.height)) }));
    };
    const escape = (event) => {if (event.key === 'Escape' && !inspecting && !event.defaultPrevented) onClose();};
    window.addEventListener('resize', resize);window.visualViewport?.addEventListener('resize', resize);window.visualViewport?.addEventListener('scroll', resize);document.addEventListener('keydown', escape);
    return () => {window.removeEventListener('resize', resize);window.visualViewport?.removeEventListener('resize', resize);window.visualViewport?.removeEventListener('scroll', resize);document.removeEventListener('keydown', escape);stopDrag.current?.();};
  }, [inspecting, mobile, onClose]);
  const actual = resolveScreenThemeDetails(runtime.preview || runtime.raw, runtime.mode, selection?.screen?.id);
  const values = actual.values;
  const bindings = useMemo(() => selection?.states?.[interaction] || selection?.bindings || [], [selection, interaction]);
  const selectedTokens = useMemo(() => [...new Set(bindings.map((item) => item.token))], [bindings]);
  const selectScrollbar = () => {
    // Native scrollbar parts are CSS pseudo-elements and cannot be selected as DOM nodes.
    setSelection((current) => ({
      kind: 'scrollbar',
      screen: current?.screen,
      states: {
        normal: [
          {property: 'scrollbar thumb', token: 'scrollbarThumb'},
          {property: 'scrollbar track', token: 'scrollbarTrack'},
        ],
        hover: [{property: 'scrollbar thumb :hover', token: 'scrollbarThumbHover'}],
      },
    }));
    setInspecting(false);
    setInteraction('normal');
    if (!selection?.screen) setEditScope('global');
    setError('');
  };
  const drag = (event) => {
    if (mobile || event.target.closest?.('button,input')) return;
    const start = { x: event.clientX, y: event.clientY };
    const rectangle = event.currentTarget.parentElement.getBoundingClientRect();
    const move = (e) => setPosition({ x: Math.max(0, Math.min(window.innerWidth - rectangle.width, rectangle.left + e.clientX - start.x)), y: Math.max(0, Math.min(window.innerHeight - rectangle.height, rectangle.top + e.clientY - start.y)) });
    const stop = () => {document.removeEventListener('pointermove', move);document.removeEventListener('pointerup', stop);};
    stopDrag.current?.();stopDrag.current = stop;
    document.addEventListener('pointermove', move);document.addEventListener('pointerup', stop, { once: true });
  };
  const button = (label, action, selected = false, extraStyle = null) => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected }} onPress={action} style={{ minHeight: THEME_TOOL_BUTTON_HEIGHT, justifyContent: 'center', paddingVertical: 0, paddingHorizontal: 9, ...extraStyle, borderWidth: 1, borderColor: selected ? c.buttonBorder : c.modalBorder, borderRadius: 7, backgroundColor: selected ? c.buttonBackground : c.buttonBackgroundSecondary }}><Text style={{ fontSize: 12, color: selected ? c.buttonText : c.buttonTextSecondary }}>{label}</Text></Pressable>;
  const compactInspection = mobile && inspecting;
  const mobileBottom = 12 + Math.ceil(Math.max(viewport.inset, dockInset));
  const mobileMaxHeight = Math.max(0, Math.min(Math.floor(viewport.height * .78),
    viewport.height + viewport.inset - mobileBottom - 12));
  return createPortal(<>
    {loginPreview && !loginCompany && <div role="status" style={{position: 'fixed', inset: 0,
      right: mobile ? 0 : 580, zIndex: 2147482990, display: 'grid', placeItems: 'center',
      background: c.pageBackground, color: c.textPrimary, padding: 24}}>
      {loginError ? t(loginError) : t('Carregando a prévia do login…')}
    </div>}
    {loginPreview && loginCompany && <LoginThemePreview company={loginCompany} mobile={mobile} />}
    {hover && inspecting && <ThemeInspectionHighlight hover={hover} viewport={viewport}
      panel={panel} panelPosition={position} translate={t} />}
    <div ref={panel} data-co-theme-tools="true" role="dialog" aria-modal="false" aria-label={t("Configurador flutuante de temas")}
    style={{ position: 'fixed', ...(mobile ? { left: 12, bottom: mobileBottom, width: 'calc(100vw - 24px)', maxHeight: mobileMaxHeight } : { right: position.x === null ? 16 : undefined, left: position.x ?? undefined, top: position.y, width: 'min(540px, calc(100vw - 24px))', maxHeight: 'calc(100vh - 32px)' }), display: 'flex', flexDirection: 'column', background: c.modalBackground, border: `1px solid ${c.modalBorder}`, borderRadius: 14, boxShadow: `0 12px 42px ${c.modalShadow}`, zIndex: 2147483000, color: c.modalText, fontFamily: 'system-ui, sans-serif' }}>
      <div onPointerDown={drag} style={{ padding: 12, cursor: mobile ? 'auto' : 'move', userSelect: 'none', borderBottom: `1px solid ${c.dividerBackground}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <strong>{t("Configurador de temas")}</strong>
        <button onClick={onClose} aria-label={t("Fechar painel e cancelar prévia")} style={{ border: 0, background: c.containerTransparentBackground, color: c.modalText, minHeight: THEME_TOOL_BUTTON_HEIGHT, minWidth: THEME_TOOL_BUTTON_HEIGHT, padding: 0, cursor: 'pointer' }}>✕</button>
      </div>
      {compactInspection && <View style={{ padding: 10, gap: 6 }}>
        <Text style={{ fontSize: 12, color: c.textLink }}>{t("Toque no elemento para editar suas cores. Arraste a página para rolar.")}</Text>
        {button(t("Barra de rolagem"), selectScrollbar)}
        {button(t("Cancelar inspeção"), () => setInspecting(false))}
      </View>}
      {/* Keep the editor mounted while inspecting so touch selection never discards the draft. */}
      <div style={{ display: compactInspection ? 'none' : 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
        <View style={{ padding: 10, gap: 8 }}>
          <Text style={{ fontSize: 12, color: c.textSecondary }}>{theme ? t("{{v0}} · tema #{{v1}} do domínio atual", { v0: theme.theme, v1: theme.id }) : error ? t("Tema do domínio indisponível") : t("Carregando tema do domínio…")}</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {button(inspecting ? t("Parar inspeção") : selection ? t("Voltar à inspeção") : t("⌖ Inspecionar elemento"), () => setInspecting((value) => !value))}
            {button(t("Barra de rolagem"), selectScrollbar, selection?.kind === 'scrollbar')}
            {button(loginPreview ? t('Voltar à tela atual') : t('Prévia do login'), () => {
              setLoginPreview(value => !value);setSelection(null);setInspecting(!loginPreview);setHover(null);
            }, loginPreview)}
            {!!selection && button(t("Todas as variáveis"), () => setSelection(null))}
            {!!selection?.container && button(
              t(selection.container.kind === 'shortcut-bar' ? "Fundo e borda da barra de atalhos" : "Fundo e borda do menu"),
              () => {setSelection(selection.container);setInteraction('normal');},
            )}
            {!!error && button(t("Recarregar"), () => setReload((value) => value + 1))}
          </View>
          {inspecting && !mobile && <Text style={{ fontSize: 12, color: c.textLink }}>{t("Passe sobre a tela e clique no elemento. Esc encerra a inspeção.")}</Text>}
          {!!error && <Text accessibilityRole="alert" style={{ fontSize: 12, color: c.textDanger }}>{t(error)}</Text>}
          {loginPreview && <>
            <Text style={{fontSize: 12, color: c.textSecondary}}>{t('Prévia do login do domínio. Use o inspetor para editar as cores; variáveis compartilhadas também afetam outras telas. Nenhum acesso ou envio de credenciais é executado.')}</Text>
            {loginError ? <Text accessibilityRole="alert" style={{color: c.textDanger}}>{t(loginError)}</Text>
              : !loginCompany ? <Text style={{color: c.textSecondary}}>{t('Carregando imagens e empresa do domínio…')}</Text>
              : <details open={!!selection?.media}><summary style={{cursor: 'pointer'}}>{t('Origem do logo e do fundo')}</summary>
                <div style={{maxHeight: 220, overflow: 'auto'}}>
                <LoginPreviewOrigins company={loginCompany} selectedType={selection?.media?.type} />
                </div>
              </details>}
          </>}
          {!!selection && <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {button(t("Normal"), () => setInteraction('normal'), interaction === 'normal')}
            {!!selection.states?.hover && button(t("Hover"), () => setInteraction('hover'), interaction === 'hover')}
          </View>}
          {!!selection && !inspecting && <Text style={{fontSize: 12, color: c.textSecondary}}>
            {t('Para selecionar outro elemento, clique em Voltar à inspeção.')}
          </Text>}
          {/* per-screen theme overrides removed (#1460) */}
          {!!bindings.length && <>
            {button(origins ? t("Ocultar origens") : t("Ver variáveis e origens"), () => setOrigins((value) => !value), false, { width: '50%' })}
            {origins && <View style={{ gap: 4, padding: 8, backgroundColor: c.sectionBackground, borderRadius: 7 }}>
              {bindings.map((binding, index) => {const source = actual.sources[binding.token];return <Text key={`${binding.property}-${binding.token}-${index}`} selectable style={{ fontSize: 12, color: c.modalText }}>{binding.property} → {binding.token}: {String(values[binding.token] ?? t("Sem valor neste modo"))}{t(" · origem: ")}{parseScreenThemeKey(source || '') ? t("Nesta tela · {{v0}}-{{v1}}", { v0: binding.token, v1: runtime.mode }) : source || t("sem referência cadastrada")}</Text>;})}
            </View>}
          </>}
        </View>
        {!!selection?.sources?.length && <View style={{padding: 10, gap: 4}}>
          <Text style={{fontSize: 12, color: c.textSecondary}}>{t('Cores vindas dos cadastros dos módulos; não são variáveis do tema.')}</Text>
          {groupInspectionColors(selection.sources.map(source => ({...source, token: source.source}))).map(source =>
            <Text key={`${source.property}:${source.source}`} selectable style={{fontSize: 12, color: c.textPrimary}}>
              {source.source} · {source.record} · {source.value} ({source.property})
            </Text>)}
        </View>}
        {!!selection && !bindings.length && !selection.sources?.length && !selection.media && <Text style={{ padding: 10, fontSize: 12, color: c.textSecondary }}>{t("Este estado não expõe variáveis de cor do tema.")}</Text>}
        <View style={{ flexShrink: 1, minHeight: 0, ...(selection && !bindings.length ? { display: 'none' } : {}) }}>{theme && <ThemeColorEditor key={`${theme.id}:${context}`} theme={theme} selectedTokens={selectedTokens} homeMetric={selection?.homeMetric} screen={null} fixedMode={loginPreview} concise fixedHeader onSaved={setTheme} />}</View>
      </div>
    </div>
  </>, portalHost);
}
