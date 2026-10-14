import createIconSet from '@expo/vector-icons/createIconSet';
import glyphMap from 'react-native-vector-icons/glyphmaps/Feather.json';
import font from 'react-native-vector-icons/Fonts/Feather.ttf';

// Keep the home glyph map and font paired without colliding with Expo's Feather.
export default createIconSet(glyphMap, 'OnGestorHomeFeather', font);
