import React from 'react';
import renderer, {act} from 'react-test-renderer';
import useJourneyReadiness from '../../components/manager-preview/useJourneyReadiness';
let mockLoading = true;
jest.mock('@store', () => ({useStore:()=>({getters:{isLoading:mockLoading,lastCompletedRequest:{completedAt:10,status:'success'}}})}));
it('finishes the current view after the shared response returned and the store committed', () => {
  global.IS_REACT_ACT_ENVIRONMENT=true;
  const x={journal:{snapshot:()=>({active:{id:'new'},events:[{type:'read.shared-returned',journeyId:'new',requestId:'r1',resource:'people'}]})},dataCommitted:jest.fn()};
  function Probe(){useJourneyReadiness({experience:x,route:'ClientsIndex',focused:true});return null;}
  let tree; act(()=>{tree=renderer.create(<Probe/>);});
  expect(x.dataCommitted).not.toHaveBeenCalled();
  mockLoading=false; act(()=>{tree.update(<Probe/>);});
  expect(x.dataCommitted).toHaveBeenCalledWith('ClientsIndex');
  act(()=>tree.unmount());
});
