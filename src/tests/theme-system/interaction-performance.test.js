import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ThemeColorEditor from '../../components/theme-editor/ThemeColorEditor';
import * as palette from '../../styles/managerTheme';
import {applyThemeCssVariables} from '../../styles/branding';
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({mode:'light',themeId:1,raw:{}}),previewTheme:jest.fn(),clearThemePreview:jest.fn(),setThemeMode:jest.fn()}));
jest.mock('../../components/theme-editor/themeService',()=>({editorContext:()=> 'context',loadDomainTheme:jest.fn().mockResolvedValue({id:1}),saveThemeChanges:jest.fn()}));
test('opening all color fields resolves a palette a bounded number of times instead of once per field',async()=>{
 const calls=jest.spyOn(palette,'describeThemeColor'),resolutions=jest.spyOn(palette,'resolveManagerThemeDetails');let tree;
 await act(async()=>{tree=renderer.create(<ThemeColorEditor theme={{id:1,theme:'Local',colors:{'cardBackground-light':'#ffffff'}}}/>);});
 expect(calls.mock.calls.length).toBeLessThanOrEqual(8);
 expect(resolutions.mock.calls.length).toBeGreaterThan(0);expect(resolutions.mock.calls.length).toBeLessThanOrEqual(8);
 console.info('Resoluções completas na abertura:',resolutions.mock.calls.length);
 await act(async()=>tree.unmount());calls.mockRestore();resolutions.mockRestore();
});
test('preview changes touch only changed CSS properties instead of repainting the entire palette',()=>{
 const setProperty=jest.fn(),removeProperty=jest.fn();global.document={documentElement:{style:{setProperty,removeProperty}}};
 applyThemeCssVariables({themeColors:{cardBackground:'#ffffff',cardText:'#112233'}});setProperty.mockClear();
 applyThemeCssVariables({themeColors:{cardBackground:'#abcdef',cardText:'#112233'}});
 expect(setProperty).toHaveBeenCalledTimes(3);expect(setProperty.mock.calls.map(call=>call[0])).not.toContain('--co-theme-cardText');
 delete global.document;
});
