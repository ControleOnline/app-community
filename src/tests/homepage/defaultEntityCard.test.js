import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Card from '@controleonline/ui-default/src/react/components/cards/DefaultEntityCard';
jest.mock('react-native',()=>({View:'View'}));
it('composes arbitrary entity media, information and footer using the supplied theme without owning actions',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;const press=jest.fn();let tree;
 act(()=>{tree=renderer.create(<Card media={<Photo/>} footer={<Action onPress={press}/>} palette={{cardBackground:'#fff',cardBorder:'#ddd'}}><Identity/></Card>);});
 function Photo(){return null;}function Identity(){return null;}function Action(){return null;}
 expect(tree.root.findByType(Action).props.onPress).toBe(press);expect(press).not.toHaveBeenCalled();
 const footer=tree.root.findByProps({testID:'default-entity-card-footer'});expect(footer.findByType(Action)).toBeTruthy();expect(footer.findAllByType(Identity)).toHaveLength(0);
 expect(tree.root.findByProps({testID:'default-entity-card-content'}).findByType(Photo)).toBeTruthy();act(()=>tree.unmount());
});
it('uses one table-owned surface when embedded while retaining the common content spacing',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;let tree;
 act(()=>{tree=renderer.create(<Card embedded bodyStyle={{gap:5}} palette={{cardBorder:'border',cardBackground:'surface'}}>Content</Card>);});
 const views=tree.root.findAllByType('View');
 expect(Object.assign({},...views[0].props.style)).toMatchObject({padding:12,borderWidth:0,borderRadius:0,backgroundColor:'transparent'});
 expect(Object.assign({},...views[2].props.style)).toMatchObject({gap:5});
 act(()=>tree.unmount());
});
