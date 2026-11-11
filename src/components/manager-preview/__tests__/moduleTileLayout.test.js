import {chunkRows, computeTileColumns} from '../moduleTileLayout'

describe('computeTileColumns (#1495)', () => {
  test('spreads the free width between the columns', () => {
    // card 280 => inner 238: 2 columns, 104*2 + gap = 238
    expect(computeTileColumns(238)).toEqual({columns: 2, gap: 30})
  })

  test('a new column enters exactly when the gap would drop to the 8px minimum', () => {
    expect(computeTileColumns(327)).toEqual({columns: 2, gap: 119})
    expect(computeTileColumns(328)).toEqual({columns: 3, gap: 8})
  })

  test('a single column keeps the tile at the left, no distribution', () => {
    expect(computeTileColumns(150)).toEqual({columns: 1, gap: 0})
    expect(computeTileColumns(0)).toEqual({columns: 1, gap: 0})
  })

  test('the grid always spans the width: columns*tile + (columns-1)*gap = width', () => {
    for (const width of [212, 238, 260, 300, 327, 328, 400, 441, 560, 777]) {
      const {columns, gap} = computeTileColumns(width)
      if (columns > 1) expect(columns * 104 + (columns - 1) * gap).toBeCloseTo(width, 5)
      if (columns > 1) expect(gap).toBeGreaterThanOrEqual(8)
    }
  })
})

describe('chunkRows (#1495)', () => {
  test('rows share the same columns and the last row stays incomplete at the left', () => {
    const rows = chunkRows(['a', 'b', 'c', 'd', 'e'], 3)
    expect(rows.map(row => row.map(entry => entry.item))).toEqual([['a', 'b', 'c'], ['d', 'e']])
    expect(rows[1].map(entry => entry.index)).toEqual([3, 4])
  })
})
