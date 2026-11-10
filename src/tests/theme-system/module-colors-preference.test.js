import React from 'react';
import renderer, {act} from 'react-test-renderer';
import useModuleColorsPreference, {moduleColorsEnabled} from '../../components/manager-preview/useModuleColorsPreference';
import {saveThemeLayoutFlags} from '../../components/theme-editor/themeService';
jest.mock('../../components/theme-editor/themeService', () => ({saveThemeLayoutFlags: jest.fn()}));

function Probe(props) {return <preference value={useModuleColorsPreference(props)} />;}
beforeEach(() => saveThemeLayoutFlags.mockReset());
const props = {colors: {useModuleColors: 'true'}, homeLayout: 'list', ready: true, context: 'domain-a'};

test('saved false overrides the layout default, and absent flags keep the old default', () => {
  expect(moduleColorsEnabled({useModuleColors: 'false'}, 'buttons')).toBe(false);
  expect(moduleColorsEnabled({useModuleColors: 'true'}, undefined)).toBe(true);
  expect(moduleColorsEnabled({}, 'buttons')).toBe(true);
  expect(moduleColorsEnabled({}, undefined)).toBe(false);
});

test('does not migrate a local preference or save on mount; writes only after an explicit action', async () => {
  const previous = global.localStorage;
  global.localStorage = {getItem: jest.fn(() => 'disabled'), setItem: jest.fn()};
  let tree;
  try {
    await act(async () => {tree = renderer.create(<Probe {...props} />);});
    const preference = () => tree.root.findByType('preference').props.value;
    expect(preference().value).toBe(true);
    expect(saveThemeLayoutFlags).not.toHaveBeenCalled();
    await act(async () => {expect(await preference().setValue(false)).toBe(true);});
    expect(saveThemeLayoutFlags).toHaveBeenCalledWith({useModuleColors: false});
    expect(preference().value).toBe(false);
    expect(global.localStorage.getItem).not.toHaveBeenCalled();
    expect(global.localStorage.setItem).not.toHaveBeenCalled();
    await act(async () => tree.update(<Probe {...props} colors={{useModuleColors: 'false'}} />));
    expect(preference().value).toBe(false);
    await act(async () => tree.update(<Probe {...props} colors={{useModuleColors: 'true'}} />));
    expect(preference().value).toBe(true);
  } finally {
    if (tree) await act(async () => tree.unmount());
    global.localStorage = previous;
  }
});

test('a denied save keeps the applied value and exposes the API error', async () => {
  saveThemeLayoutFlags.mockRejectedValueOnce(new Error('Sem permissão para editar este tema compartilhado.'));
  let tree;await act(async () => {tree = renderer.create(<Probe {...props} />);});
  const preference = () => tree.root.findByType('preference').props.value;
  await act(async () => {expect(await preference().setValue(false)).toBe(false);});
  expect(preference().value).toBe(true);
  expect(preference().error).toContain('Sem permissão');
  await act(async () => tree.unmount());
});

test('a pending save does not leak its value or error into a different context', async () => {
  let finish;
  saveThemeLayoutFlags.mockReturnValueOnce(new Promise(resolve => {finish = resolve;}));
  let tree;await act(async () => {tree = renderer.create(<Probe {...props} />);});
  const preference = () => tree.root.findByType('preference').props.value;
  let request;act(() => {request = preference().setValue(false);});
  await act(async () => {expect(await preference().setValue(false)).toBe(false);});
  await act(async () => tree.update(<Probe {...props} context="domain-b" />));
  await act(async () => {finish();expect(await request).toBe(false);});
  expect(preference().value).toBe(true);
  expect(preference().error).toBe('');
  expect(saveThemeLayoutFlags).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

test('cannot save before the domain theme is ready', async () => {
  let tree;await act(async () => {tree = renderer.create(<Probe {...props} ready={false} />);});
  await act(async () => {expect(await tree.root.findByType('preference').props.value.setValue(false)).toBe(false);});
  expect(saveThemeLayoutFlags).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});
