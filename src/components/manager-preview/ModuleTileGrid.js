import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TILE_MIN_GAP, chunkRows, computeTileColumns} from './moduleTileLayout';

// Icon-mode grid of a category card: columns are spread across the measured width (#1495).
export default function ModuleTileGrid({items, renderTile, testID}) {
  const [width, setWidth] = useState(0);
  const onLayout = event => {
    // Floor so the rows never exceed the measured width by a sub-pixel.
    const next = Math.floor(event?.nativeEvent?.layout?.width || 0);
    setWidth(current => (current === next ? current : next));
  };

  // Until the first measurement, keep the plain wrapping row.
  if (!width) {
    return <View testID={testID} onLayout={onLayout} style={styles.fallback}>
      {items.map((item, index) => renderTile(item, index, null))}
    </View>;
  }

  const {columns, gap} = computeTileColumns(width);
  return <View testID={testID} onLayout={onLayout} style={styles.grid}>
    {chunkRows(items, columns).map((row, rowIndex) =>
      <View key={rowIndex} style={[styles.row, rowIndex > 0 && {marginTop: TILE_MIN_GAP}]}>
        {row.map(({item, index}, column) =>
          renderTile(item, index, {marginRight: column < columns - 1 ? gap : 0}))}
      </View>)}
  </View>;
}

const styles = StyleSheet.create({
  fallback: {flexDirection: 'row', flexWrap: 'wrap', gap: TILE_MIN_GAP, marginTop: 12},
  grid: {marginTop: 12},
  row: {flexDirection: 'row'},
});
