import {resolveManagerTheme} from '../../styles/managerTheme';
import {initializeGlobalChromeColors} from '../../styles/globalChromeTheme';
import {metricAppliedToken, metricChoiceKey, metricNameKey, metricBaseKey, chooseMetricAppearance, appearanceName, encodeAppearanceName} from '../../styles/homeMetricAppearance';
const base = {'indicatorCardBackground-light':'#ffffff','indicatorCardBackground-dark':'#112233',
  'indicatorCardText-light':'#000000','indicatorCardText-dark':'#eeeeee'};
const background = (colors,id,mode='light') => resolveManagerTheme(colors,mode)[metricAppliedToken(id,'Background')];

test('adding appearance variants never changes the resolution model of a legacy theme', () => {
  const legacy={darkCard:'#123456','bg-dark':'#010203','text-headers-dark':'#eeeeee',cardBackground:'#ffffff'};
  const configured=initializeGlobalChromeColors({...legacy,'homeMetricPrimaryBackground-light':'#00ff00',
    ...chooseMetricAppearance(legacy,'clients','primary')});
  expect(resolveManagerTheme(configured,'dark')).toMatchObject({cardBackground:'#123456',pageBackground:'#010203',
    homeResultsBackground:'#123456',homeMetricClientsAppliedBackground:'#123456'});
});

test('default indicators remain shared, and primary/secondary selections affect only assigned purposes', () => {
  const colors={...base,'homeMetricPrimaryBackground-light':'#00ff00','homeMetricSecondaryBackground-light':'#ff0000',
    ...chooseMetricAppearance(base,'closed-sales','primary'),...chooseMetricAppearance(base,'clients','secondary')};
  expect(background(colors,'closed-sales')).toBe('#00ff00');
  expect(background(colors,'clients')).toBe('#ff0000');
  expect(background(colors,'period-orders')).toBe('#ffffff');
  expect(background(colors,'open-orders')).toBe('#ffffff');
  expect(background(colors,'closed-sales','dark')).toBe('#112233');
});

test('specific colors inherit the previously selected primary without affecting other users of primary', () => {
  const primary={...base,'homeMetricPrimaryBackground-light':'#00ff00',...chooseMetricAppearance(base,'closed-sales','primary'),
    ...chooseMetricAppearance(base,'clients','primary')};
  const specific={...primary,...chooseMetricAppearance(primary,'closed-sales','specific')};
  expect(specific[metricBaseKey('closed-sales')]).toBe('primary');
  expect(background(specific,'closed-sales')).toBe('#00ff00');
  const edited={...specific,'homeMetricClosedSalesBackground-light':'#0000ff'};
  expect(background(edited,'closed-sales')).toBe('#0000ff');
  expect(background(edited,'clients')).toBe('#00ff00');
  const restored={...edited,...chooseMetricAppearance(edited,'closed-sales','default')};
  expect(background(restored,'closed-sales')).toBe('#ffffff');
  expect(background({...restored,...chooseMetricAppearance(restored,'closed-sales','specific')},'closed-sales')).toBe('#0000ff');
});

test('renaming uses a CSS-safe scalar label and does not alter stable bindings or colors', () => {
  const name='Vendas 🎉; azul {especial}';
  const selected={...base,...chooseMetricAppearance(base,'closed-sales','specific'),'homeMetricClosedSalesBackground-light':'#abcdef'};
  const renamed={...selected,[metricNameKey('closed-sales')]:encodeAppearanceName(name)};
  expect(renamed[metricNameKey('closed-sales')]).toMatch(/^v1_[a-f0-9]+$/);
  expect(appearanceName(renamed,'closed-sales')).toBe(name);
  expect(JSON.parse(JSON.stringify(renamed))[metricChoiceKey('closed-sales')]).toBe('specific');
  expect(background(renamed,'closed-sales')).toBe('#abcdef');
});

test('Results retains both original modes after indicator defaults are edited', () => {
  const loaded=initializeGlobalChromeColors(base);
  const changed={...loaded,'indicatorCardBackground-light':'#ff0000','indicatorCardBackground-dark':'#00ff00'};
  expect(resolveManagerTheme(changed,'light').homeResultsBackground).toBe('#ffffff');
  expect(resolveManagerTheme(changed,'dark').homeResultsBackground).toBe('#112233');
  expect(background(changed,'clients')).toBe('#ff0000');
});
