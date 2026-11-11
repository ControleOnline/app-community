import fs from 'node:fs';
import path from 'node:path';

const read = name => fs.readFileSync(path.join(process.cwd(), 'src/components/theme-editor', name), 'utf8');

test('floating configurator keeps search, mode and save rows fixed above the scrolling list (#1509)', () => {
  const editor = read('ThemeColorEditor.js');
  const panel = read('FloatingThemePanel.web.js');
  // fixed tools (toolbar + error + footer) sit outside the ScrollView that wraps only the groups
  expect(editor).toMatch(/<View style=\{s\.fixedTools\}>\{toolbar\}\{errorNode\}\{footer\}<\/View>/);
  expect(editor).toMatch(/<ScrollView style=\{s\.scrollArea\} contentContainerStyle=\{s\.scrollContent\}>\{metricControls\}\{notices\}\{groupsNode\}<\/ScrollView>/);
  // the panel no longer wraps the whole editor in its own ScrollView and opts in
  expect(panel).not.toMatch(/<ScrollView/);
  expect(panel).toMatch(/concise fixedHeader onSaved/);
  // default layout (e.g. ThemeEditorDialog) is untouched
  expect(editor).toMatch(/\{metricControls\}\{toolbar\}\{notices\}\{errorNode\}\{footer\}\{groupsNode\}/);
});

test('compact tools: 24px buttons, half-width search and half-width origins button (#1509)', () => {
  const metrics = read('themeToolMetrics.js');
  const editor = read('ThemeColorEditor.js');
  const panel = read('FloatingThemePanel.web.js');
  expect(metrics).toMatch(/THEME_TOOL_BUTTON_HEIGHT = 24/);
  expect(editor).toMatch(/toolButton: \{ minHeight: THEME_TOOL_BUTTON_HEIGHT, paddingVertical: 0/);
  expect(editor).toMatch(/toolSearch: \{ flexGrow: 0, flexShrink: 1, flexBasis: '33%'/);
  expect(panel).toMatch(/const button = [^\n]*minHeight: THEME_TOOL_BUTTON_HEIGHT/);
  expect(panel).toMatch(/Ver variáveis e origens[^\n]*false, \{ width: '50%' \}/);
  expect(panel).toMatch(/minHeight: THEME_TOOL_BUTTON_HEIGHT, minWidth: THEME_TOOL_BUTTON_HEIGHT/);
});
