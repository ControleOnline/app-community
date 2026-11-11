// Tile grid layout for the category cards in icon mode (app-community#1495).
// Tiles keep their width; the free width of the card is distributed between the columns,
// so the grid spans the card's inner width (same 20px margin on both sides).
export const TILE_WIDTH = 104;
export const TILE_MIN_GAP = 8;

export function computeTileColumns(width, tileWidth = TILE_WIDTH, minGap = TILE_MIN_GAP) {
  const available = Number(width) || 0;
  if (available <= 0) return {columns: 1, gap: 0};
  const columns = Math.max(1, Math.floor((available + minGap) / (tileWidth + minGap)));
  // A single column cannot distribute anything: the tile stays at the left.
  const gap = columns > 1 ? (available - columns * tileWidth) / (columns - 1) : 0;
  return {columns, gap};
}

// Rows share the same columns, so an incomplete last row stays left-aligned under them.
export function chunkRows(items, columns) {
  const size = Math.max(1, Math.floor(columns) || 1);
  const rows = [];
  for (let start = 0; start < items.length; start += size) {
    rows.push(items.slice(start, start + size).map((item, offset) => ({item, index: start + offset})));
  }
  return rows;
}
