import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerSignIn from '../../components/manager-preview/ManagerSignIn.web';
jest.mock('react-native',()=>({View:'View'}));
jest.mock('@controleonline/ui-login/src/react/pages/sign-in',()=> 'ExistingSignIn');
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({
  avatarEnabled:true,colors:{},guideInvitation:false,dismissGuideInvitation:jest.fn(),avatarSize:40,avatarSide:'right',
  guideDelayMs:15000,guideSuggestionMode:'after-interaction',
})}));
it('reuses login and registration with the requested identity copy and a closed small default guide',()=>{
  global.IS_REACT_ACT_ENVIRONMENT=true;
  let tree; act(()=>{tree=renderer.create(<ManagerSignIn navigation={{navigate:jest.fn()}}/>);});
  expect(tree.root.findByType('ExistingSignIn').props).toMatchObject({introMessage:'Eu sou',identifierLabel:'Usuário',identifierRequiredMessage:'Usuário é obrigatório',createAccountLabel:'Nova conta'});
  expect(tree.root.findAllByType('section')).toHaveLength(0);
  if (process.env.SHENLONG_TESTS !== '1') {
    expect(tree.root.findAllByProps({className:'on-guide'})).toHaveLength(0);
    act(()=>tree.unmount()); return;
  }
  expect(tree.root.findByProps({className:'on-guide'}).props.style['--guide-size']).toBe('40px');
  act(()=>tree.root.findByProps({'aria-label':'Abrir guia On Manager'}).props.onClick());
  expect(tree.root.findAllByType('section')).toHaveLength(1);
  expect(tree.root.findAllByType('h3')[0].props.children).toBe('Olá, sou o Sheng-Long');
  expect(tree.root.findAllByType('button').some(node=>String(node.props.children).includes('Ver pedidos'))).toBe(false);
  act(()=>tree.unmount());
});
