import {groupInspectionColors, inspectionLabelPosition, inspectionLabelWidth} from '../../components/theme-editor/ThemeInspectionHighlight';
import {inspectThemeElement} from '../../components/theme-editor/themeInspector';
import {moduleAccentSource, moduleRecordSource} from '../../components/manager-preview/moduleAccent';

test('equal border sides are grouped while distinct colors retain their identity', () => {
  const entries = ['Top', 'Right', 'Bottom', 'Left'].map(side => ({property: `border${side}Color`, token: 'cardBorder', value: '#123456'}));
  expect(groupInspectionColors(entries)).toHaveLength(1);
  expect(groupInspectionColors([...entries, {property: 'borderLeftColor', token: 'navigationActiveBorder', value: '#abcdef'}])).toHaveLength(2);
});

test.each([
  {left: 1100, top: 80, right: 1640, bottom: 950},
  {left: 560, top: 80, right: 1100, bottom: 950},
])('positions the label outside a right-hand or dragged central panel', panel => {
  const size = {width: 440, height: 130};
  const position = inspectionLabelPosition({left: 1070, top: 250, width: 707, height: 32}, size, {width: 1830, height: 1000}, panel);
  expect(position.left + size.width <= panel.left || position.left >= panel.right ||
    position.top + size.height <= panel.top || position.top >= panel.bottom).toBe(true);
  expect(position.left).toBeGreaterThanOrEqual(4);
  expect(position.left + size.width).toBeLessThanOrEqual(1826);
});

test('a literal module color exposes its database source without inventing a theme token', () => {
  const source = moduleAccentSource('#0284c7', 'routes.color', 'FinancialHubPage', '#0284c7');
  const ancestor = {contains: () => true, getAttribute: () => JSON.stringify([{property: 'backgroundColor', token: 'pageBackground'}])};
  const node = {getAttribute: attribute => attribute === 'data-co-theme-source' ? source : null};
  const element = {closest: selector => selector === '[data-co-theme-source]' ? node : selector === '[data-co-theme]' ? ancestor : null};
  const hit = inspectThemeElement(element);
  expect(hit.node).toBe(node);
  expect(hit.bindings).toEqual([]);
  expect(hit.sources).toEqual([{property: 'backgroundColor', source: 'routes.color', record: 'FinancialHubPage',
    reference: '#0284c7', value: '#0284c7'}]);
  expect(moduleAccentSource(undefined, 'routes.color', 'FinancialHubPage', '#0284c7')).toBeUndefined();
});

test('an element of a module record is inspectable even when none of its colors is set', () => {
  const marker = moduleRecordSource('route', 'FinancialHubPage', ['routeMenuBackground', 'routeMenuIcon', 'routeMenuText']);
  const node = {getAttribute: attribute => attribute === 'data-co-module-record' ? marker : null};
  const hit = inspectThemeElement({closest: selector => selector === '[data-co-module-record]' ? node : null});
  expect(hit.node).toBe(node);
  expect(hit.sources || []).toEqual([]);
  expect(hit.moduleRecord).toEqual({kind: 'route', record: 'FinancialHubPage', fields: ['routeMenuBackground', 'routeMenuIcon', 'routeMenuText']});
  expect(moduleRecordSource('route', '', ['routeMenuText'])).toBeUndefined();
});

test('a target near the top is not covered by a clamped label', () => {
  const target = {left: 100, top: 4, width: 280, height: 40};
  const size = {width: 440, height: 130};
  const position = inspectionLabelPosition(target, size, {width: 1200, height: 800});
  expect(position.top >= target.top + target.height || position.left >= target.left + target.width ||
    position.left + size.width <= target.left).toBe(true);
});

test('a viewport-sized target puts the label away from the pointer and panel', () => {
  const target = {left: 0, top: 0, width: 1200, height: 800, pointer: {x: 20, y: 20}};
  const position = inspectionLabelPosition(target, {width: 440, height: 130}, {width: 1200, height: 800},
    {left: 650, top: 0, right: 1200, bottom: 800});
  expect(position.left + 440).toBeLessThanOrEqual(650);
  expect(position.top).toBeGreaterThan(600);
});

 test("legend stays compact in split view and keeps its full width on wide screens", () => {
  expect(inspectionLabelWidth(1000)).toBe(320);
  expect(inspectionLabelWidth(1830)).toBe(440);
  expect(inspectionLabelWidth(280)).toBe(272);
 });
