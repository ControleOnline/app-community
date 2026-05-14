import * as Font from 'expo-font';

import FeatherFont from 'react-native-vector-icons/Fonts/Feather.ttf';
import FontAwesomeFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import MaterialIconsFont from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';

const VECTOR_ICON_FONTS = {
  Feather: FeatherFont,
  FontAwesome: FontAwesomeFont,
  MaterialIcons: MaterialIconsFont,
};

if (typeof document !== 'undefined') {
  const missingFonts = Object.fromEntries(
    Object.entries(VECTOR_ICON_FONTS).filter(([fontName]) => !Font.isLoaded(fontName)),
  );

  if (Object.keys(missingFonts).length > 0) {
    void Font.loadAsync(missingFonts).catch(() => {});
  }
}
