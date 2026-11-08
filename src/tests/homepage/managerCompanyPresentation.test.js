import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ManagerBrand, {CompanyName} from '../../components/manager-preview/ManagerBrand';
let mockCompany;
let mockLogoMode='light';
jest.mock('../../styles/themeRuntime',()=>({useThemeRuntime:()=>({mode:mockLogoMode})}));
jest.mock('../../components/theme-editor/companyBrandingRuntime',()=>({useCompanyBranding:company=>company}));
jest.mock('react-native',()=>({Text:'Text',View:'View',Platform:{OS:'web'},StyleSheet:{create:values=>values}}));
jest.mock('@store',()=>({useStore:()=>({getters:{currentCompany:mockCompany,mainCompany:{id:1,alias:'Outra empresa',logo:{id:1},icon:{id:2}}}})}));
jest.mock('@controleonline/ui-default/src/react/components/files/DefaultFile',()=> 'DefaultFile');
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockLogoMode='light';mockCompany={id:5,alias:'Uma empresa com nome muito comprido — unidade centro',icon:{id:5}};});
it('keeps a centered single-line name, shrinks overflowing text and preserves the full accessible label',()=>{
 const measure={scrollWidth:50,clientWidth:90};let tree;
 act(()=>{tree=renderer.create(<ManagerBrand dense subtitle={false} colors={{}}/>,{createNodeMock:element=>element.type==='Text'?measure:null});});
 const text=()=>tree.root.findByType('Text');
 expect(Object.assign({},...tree.root.findByType('DefaultFile').props.style.flat(Infinity).filter(Boolean))).toMatchObject({width:22,height:22});
 expect(text().props.accessibilityLabel).toBe(mockCompany.alias);expect(text().props.numberOfLines).toBe(1);
 expect(Object.assign({},...text().props.style.filter(Boolean))).toMatchObject({fontSize:12,textAlign:'center'});
 measure.scrollWidth=300;
 act(()=>text().props.onLayout({nativeEvent:{layout:{height:16,width:90}}}));
 expect(text().props.style[1].fontSize).toBe(9);expect(text().children.join('')).toBe(mockCompany.alias);
 act(()=>tree.unmount());
});
it('does not reintroduce main-company or hardcoded images for a selected company without media',()=>{
 mockCompany={id:5,alias:'Sem imagem'};let tree;
 act(()=>{tree=renderer.create(<ManagerBrand dense subtitle={false} colors={{}}/>);});
 expect(tree.root.findAllByType('DefaultFile')).toHaveLength(0);expect(tree.root.findByType('Text').children.join('')).toBe('Sem imagem');act(()=>tree.unmount());
});

it('reduces long two-line header names while retaining the full label',()=>{
 let tree;const measure={clientWidth:80,scrollWidth:80,scrollHeight:28};
 act(()=>{tree=renderer.create(<CompanyName label={mockCompany.alias} color="black" dense small lines={2}/>,{createNodeMock:element=>element.type==='Text'?measure:null});});
 const text=tree.root.findByType('Text');
 expect(text.props.numberOfLines).toBe(2);
 expect(text.props.style[1].fontSize).toBe(9);
 expect(text.props.accessibilityLabel).toBe(mockCompany.alias);
 act(()=>tree.unmount());
});
it('adapts the loaded rectangular logo dimensions without cropping',()=>{
 mockCompany={id:5,alias:'Retangular',logo:{id:8}};let tree;
 act(()=>{tree=renderer.create(<ManagerBrand home homeSize={40} homeWidth={80} colors={{}}/>);});
 const image=()=>tree.root.findByType('DefaultFile');
 act(()=>image().props.onLoad({nativeEvent:{target:{naturalWidth:400,naturalHeight:100}}}));
 expect(Object.assign({},...image().props.style.flat(Infinity).filter(Boolean))).toMatchObject({width:80,height:20});
 expect(image().props.resizeMode).toBe('contain');
 act(()=>tree.unmount());
});
it('measures already-loaded web artwork when the file loader does not report dimensions',()=>{
 mockCompany={id:5,alias:'Retangular',logo:{id:8}};let tree;
 const image={naturalWidth:256,naturalHeight:93};
 const node={querySelector:()=>image,addEventListener:jest.fn(),removeEventListener:jest.fn()};
 act(()=>{tree=renderer.create(<ManagerBrand home homeSize={40} homeWidth={76} colors={{}}/>,{createNodeMock:element=>element.type==='View'?node:null});});
 expect(Object.assign({},...tree.root.findByType('DefaultFile').props.style.flat(Infinity).filter(Boolean))).toMatchObject({width:76,height:28});
 act(()=>tree.unmount());expect(node.removeEventListener).toHaveBeenCalledWith('load',expect.any(Function),true);
});

it('switches the selected-company logo with the theme mode and preserves the original fallback',()=>{
 mockCompany={id:5,alias:'Empresa',logo:{id:8},configs:{company_branding:{logoLight:'/light.svg',logoDark:'/dark.svg'}}};let tree;
 const view=()=> <ManagerBrand home homeSize={40} homeWidth={80} colors={{}}/>;
 act(()=>{tree=renderer.create(view());});expect(tree.root.findByType('DefaultFile').props.file).toBe('/light.svg');
 mockLogoMode='dark';act(()=>tree.update(view()));expect(tree.root.findByType('DefaultFile').props.file).toBe('/dark.svg');
 mockCompany={...mockCompany,configs:{company_branding:{logoLight:'/light.svg'}}};act(()=>tree.update(view()));expect(tree.root.findByType('DefaultFile').props.file).toEqual({id:8});
 expect(mockCompany.logo).toEqual({id:8});act(()=>tree.unmount());
});

it('fits the complete header label on one line when the available width is narrow',()=>{
 const label='MT - RONDONÓPOLIS — uma unidade com nome muito comprido';
 let tree;const measure={clientWidth:145,scrollWidth:145};
 act(()=>{tree=renderer.create(<CompanyName label={label} dense small complete/>,{createNodeMock:element=>element.type==='Text'?measure:null});});
 const text=tree.root.findByType('Text');
 expect(text.props.numberOfLines).toBe(1);expect(text.props.adjustsFontSizeToFit).toBe(false);
 expect(Object.assign({},...text.props.style.filter(Boolean))).toMatchObject({textAlign:'center'});
 expect(text.children.join('')).toBe(label);expect(text.props.accessibilityLabel).toBe(label);
 act(()=>tree.unmount());
});
