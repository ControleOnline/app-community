import WebIcon from '../../components/HomeIcon.web';
import NativeIcon from '../../components/HomeIcon.js';
import glyphMap from 'react-native-vector-icons/glyphmaps/Feather.json';
import font from 'react-native-vector-icons/Fonts/Feather.ttf';

jest.mock('@expo/vector-icons/createIconSet', () => ({
  __esModule: true,
  default: (map, family, asset) => ({map, family, asset}),
}));
jest.mock('react-native-vector-icons/Feather', () => 'NativeFeather');

it('isolates the home font from both existing Feather families and pairs its map with its asset', () => {
  expect(WebIcon.family.toLowerCase()).not.toBe('feather');
  expect(WebIcon.map).toBe(glyphMap);
  expect(WebIcon.asset).toBe(font);
  // These code points differ in the Expo map: a mixed font renders other symbols.
  expect(WebIcon.map.users).toBe(0xf209);
  expect(WebIcon.map.target).toBe(0xf1ec);
  expect(WebIcon.map.user).toBe(0xf204);
  expect(WebIcon.map.home).toBe(0xf184);
});

it('keeps the existing native Feather component', () => {
  expect(NativeIcon).toBe('NativeFeather');
});
