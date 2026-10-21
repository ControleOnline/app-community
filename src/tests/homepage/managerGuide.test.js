import {resolveGuideStep, appendGuideEvent} from '../../components/manager-preview/guideModel';

const orders = {name: 'OrderHistoryPage', title: 'Pedidos', params: {scope: 'company'}};
const devices = {name: 'DevicesIndex', title: 'Dispositivos', params: {}};

it('suggests an existing authorized destination and preserves its route parameters', () => {
  expect(resolveGuideStep('HomePage', [orders, devices]).destination).toEqual(orders);
  expect(resolveGuideStep('HomePage', [devices]).destination).toEqual(devices);
  expect(resolveGuideStep('HomePage', []).destination).toBeNull();
});

it('offers contextual guidance without implying that it has executed a business action', () => {
  const step = resolveGuideStep('OrderHistoryPage', [orders]);
  expect(step.message).toContain('filtros');
  expect(step.destination).toBeNull();
  expect(resolveGuideStep('UnknownRoute', []).destination).toBeNull();
});

it('keeps only a bounded temporary record of navigation choices, without conversation or customer data', () => {
  let events = [];
  for (let i = 0; i < 25; i++) events = appendGuideEvent(events, {type: 'open', route: 'HomePage', message: 'private', user: 'private'});
  expect(events).toHaveLength(20);
  expect(events[0]).toEqual({type: 'open', route: 'HomePage'});
});
