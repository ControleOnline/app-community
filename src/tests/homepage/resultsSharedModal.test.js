import React from 'react';
import renderer,{act} from 'react-test-renderer';
import AnimatedModal from '@controleonline/ui-common/src/react/components/AnimatedModal';
jest.mock('react-native',()=>({
 Modal:'Modal',Text:'Text',KeyboardAvoidingView:'KeyboardAvoidingView',Platform:{OS:'web'},Dimensions:{get:()=>({height:800})},Keyboard:{addListener:()=>({remove:()=>{}})},StyleSheet:{create:v=>v,absoluteFillObject:{}},
 Animated:{View:'AnimatedView',Value:class{setValue(){}},spring:()=>({}),timing:()=>({}),parallel:()=>({start:callback=>callback?.()})},
}));
jest.mock('react-native-gesture-handler',()=>({GestureHandlerRootView:'GestureRoot'}));
jest.mock('@backpackapp-io/react-native-toast',()=>({toast:{dismiss:jest.fn()},Toasts:'Toasts'}));
it('uses optional theme overlay and centered content while forwarding the native close event',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const close=jest.fn();let tree;
 act(()=>{tree=renderer.create(<AnimatedModal visible onRequestClose={close} overlayColor="#112233" contentStyle={{justifyContent:'center'}}>Categorias</AnimatedModal>);});
 const views=tree.root.findAllByType('AnimatedView');
 expect(views[0].props.style).toContainEqual({backgroundColor:'#112233'});
 expect(views[1].props.style).toContainEqual({justifyContent:'center'});
 act(()=>tree.root.findByType('Modal').props.onRequestClose());expect(close).toHaveBeenCalledTimes(1);
 act(()=>tree.unmount());
});
it('keeps the existing overlay and bottom alignment when optional props are absent',()=>{
 let tree;act(()=>{tree=renderer.create(<AnimatedModal visible>Detalhes</AnimatedModal>);});
 const views=tree.root.findAllByType('AnimatedView');expect(views[0].props.style[1].backgroundColor).toBe('rgba(15, 23, 42, 0.4)');
 expect(views[1].props.style[0].justifyContent).toBe('flex-end');act(()=>tree.unmount());
});
