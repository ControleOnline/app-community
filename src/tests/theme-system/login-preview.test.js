import React from 'react';
import renderer, {act} from 'react-test-renderer';
import LoginThemePreview from '../../components/theme-editor/LoginThemePreview.web';
import LoginPreviewOrigins from '../../components/theme-editor/LoginPreviewOrigins';
import {loadLoginPreviewCompany, loginPreviewMedia} from '../../components/theme-editor/loginPreviewModel';
import {inspectThemeElement} from '../../components/theme-editor/themeInspector';
import {api} from '@controleonline/ui-common/src/api';

let mockContext = 'original';
const mockRuntime = {mode: 'light', raw: {pageBackground: 'white', inputBackground: 'yellow', inputText: 'black',
  inputPlaceholderText: 'gray', inputIcon: 'black', footerText: 'yellow', footerBackground: 'black'}, preview: null};
jest.mock('../../styles/themeRuntime', () => ({useThemeRuntime: () => mockRuntime}));
jest.mock('../../components/manager-preview/model', () => ({managerPreviewEnabled: true}));
jest.mock('../../components/theme-editor/themeService', () => ({editorContext: () => mockContext}));
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: jest.fn()}}));
jest.mock('@controleonline/ui-common/src/react/utils/fileUrl', () => ({
  extractFileId: file => file?.id || '', resolveFileImageUrl: file => file?.url || ''}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile', () => 'DefaultFile');
jest.mock('@controleonline/ui-common/src/utils/oauth', () => ({resolveCompanyGoogleOauthClientId: () => ''}));
jest.mock('@controleonline/ui-login/src/react/utils/discordOauth', () => ({resolveCompanyDiscordOauthClientId: () => ''}));
jest.mock('@controleonline/../../src/styles/branding', () => ({withOpacity: value => value}));
jest.mock('react-native', () => {
  const base = jest.requireActual('./nativeMock.cjs');
  return {...base, Dimensions: {get: () => ({height: 852})}, Platform: {...base.Platform, select: entries => entries.web}};
});

const company = {id: 7, alias: 'Domain company', logo: {id: 9, url: 'https://images.example/logo.png'},
  theme: {background: {id: 10, url: 'https://images.example/background.png'}}};
beforeEach(() => {mockContext = 'original'; api.fetch.mockReset(); mockRuntime.preview = null;});

test('reads the domain company without writing or changing operational stores', async () => {
  api.fetch.mockResolvedValue({response: {data: company}});
  expect(await loadLoginPreviewCompany()).toEqual(company);
  expect(api.fetch).toHaveBeenCalledTimes(1);
  expect(api.fetch).toHaveBeenCalledWith('people/company/default', {skipSession: true});
});

test('rejects a response when the editor context changes during the request', async () => {
  let finish;
  api.fetch.mockImplementation(() => new Promise(resolve => {finish = resolve;}));
  const request = loadLoginPreviewCompany();
  mockContext = 'changed';finish({response: {data: company}});
  await expect(request).rejects.toThrow('contexto mudou');
});

test('reports the actual logo and company media background, including missing images', () => {
  expect(loginPreviewMedia(company, 'logo')).toMatchObject({companyId: 7, fileId: 9, source: 'mainCompany.logo'});
  expect(loginPreviewMedia(company, 'background')).toMatchObject({fileId: 10, source: 'mainCompany.theme.background'});
  expect(loginPreviewMedia({id: 7}, 'background')).toMatchObject({file: undefined, url: ''});
});
test('origins display the exact linked logo and background files without editing them', () => {
 let tree;
 act(()=>{tree=renderer.create(<LoginPreviewOrigins company={company}/>);});
 const files=tree.root.findAllByType('DefaultFile');
 expect(files.map(node=>node.props.file)).toEqual([company.logo,company.theme.background]);
 expect(files.every(node=>node.props.company===company && node.props.resizeMode==='contain')).toBe(true);
 act(()=>tree.unmount());
});

test('preview has no credential fields, submits, login actions or mode selector', () => {
  let tree;
  act(() => {tree = renderer.create(<LoginThemePreview company={company} mobile={false} />);});
  const root = tree.root;
  expect(root.findAllByType('DefaultFile').map(node => node.props.file.id)).toEqual([10, 9]);
  expect(root.findAll(node => node.props.onPress || node.props.onSubmit || node.props.onChangeText)).toHaveLength(0);
  expect(root.findAllByType('TextInput')).toHaveLength(0);
  const labels = root.findAllByType('Text').map(node => node.children.join(''));
  expect(labels).toContain('Usuário');expect(labels).toContain('Nova conta');
  expect(labels).not.toContain('Entre com suas credenciais para acessar');
  expect(root.findByProps({testID: 'login-preview-footer'}).findByType('Text').props.numberOfLines).toBe(1);
  const field = root.findAll(node => node.props.dataSet?.coThemeStates)[0];
  expect(JSON.parse(field.props.dataSet.coThemeStates).normal).toEqual(expect.arrayContaining([
    {property: 'color', token: 'inputText'}, {property: 'placeholderTextColor', token: 'inputPlaceholderText'}]));
  act(() => {mockRuntime.preview = {...mockRuntime.raw, loginInputBackground: 'blue'}; tree.update(<LoginThemePreview company={company} mobile={false} />);});
  const changedField = root.findAll(node => node.props.dataSet?.coThemeStates)[0];
  expect(JSON.parse(changedField.props.dataSet.coThemeStates).normal).toContainEqual({property: 'backgroundColor', token: 'loginInputBackground'});
  act(() => tree.unmount());
});

test('selecting an image returns media origin, not an invented theme color', () => {
  const node = {getAttribute: () => JSON.stringify({type: 'logo', companyId: 7})};
  const hit = inspectThemeElement({closest: selector => selector === '[data-co-login-media]' ? node : null});
  expect(hit).toMatchObject({kind: 'login-media', bindings: [], media: {type: 'logo', companyId: 7}});
});

test('rotates footer lines instead of rendering two rows and restores chrome on unmount', () => {
  jest.useFakeTimers();
  let tree;
  try {
    act(() => {tree = renderer.create(<LoginThemePreview mobile={false} company={{...company,
      configs: {'device-runtime-footer-text': 'Primeira linha\nSegunda linha'}}} />);});
    const footerText = () => tree.root.findByProps({testID: 'login-preview-footer'}).findByType('Text').children.join('');
    expect(footerText()).toBe('Primeira linha');
    act(() => jest.advanceTimersByTime(4000));
    expect(footerText()).toBe('Segunda linha');
    expect(tree.root.findByType('style').children.join('')).toContain('visibility: hidden');
    act(() => tree.unmount());tree = null;
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    if (tree) act(() => tree.unmount());
    jest.useRealTimers();
  }
});
