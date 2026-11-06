import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ManagerStartup from '../../components/manager-preview/ManagerStartup';
const fs=require('node:fs');
const path=require('node:path');
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>null}));
jest.mock('react-native',()=>({...jest.requireActual('react-native'),ActivityIndicator:'ActivityIndicator'}));
test('shared translation startup is visible without the management provider and uses its supplied palette',()=>{
 let tree;act(()=>{tree=renderer.create(<ManagerStartup message="Carregando os textos do sistema…" accessibilityLabel="Preparando traduções do sistema" palette={{pageBackground:'#123456',textPrimary:'#abcdef'}}/>);});
 const root=tree.root.findByType('View');
 expect(root.props.style.backgroundColor).toBe('#123456');
 expect(tree.root.findByType('Text').props.style.color).toBe('#abcdef');
 expect(tree.root.findByType('Text').children.join('')).toBe('Carregando os textos do sistema…');
 act(()=>tree.unmount());
});
test('translation bootstrap preserves the original readiness gate and mounted navigation',()=>{
 const patches=JSON.parse(fs.readFileSync(path.join(process.cwd(),'patches/theme-system.json'),'utf8'));
 const patch=patches.find(p=>p.path==='src/react/components/DefaultProvider.web.js');
 const source=fs.readFileSync(path.join(process.cwd(),'node_modules/@controleonline/ui-common',patch.path),'utf8');
 expect(source).toContain('const translationPending = requiresTranslateBootstrap && !isTranslateBootstrapReady;');
 expect(source).toContain('{translationPending && <ManagerStartup');
 expect(source).toContain('aria-hidden={translationPending}');
 expect(source).toContain('<View style={[providerStyles.content, runtimeUiScaleStyle]}>{children}</View>');
});
