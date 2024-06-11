export const TEMPLE_TILE_COUNT = 57;
export const FARM_TILE_COUNT = 36;
export const MARKET_TILE_COUNT = 30;
export const SETTLEMENT_TILE_COUNT = 30;

export const PLAYER_TILE_CAPACITY = 6;

export const COLUMN_SPACE_COUNT = 11;
export const ROW_SPACE_COUNT = 16;

export const FARM = "farm" as const;
export const MARKET = "market" as const;
export const SETTLEMENT = "settlement" as const;
export const TEMPLE = "temple" as const;

export const RIVER_SPACES = [
  /* bottom left corner start */
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [3, 2],
  [4, 2],
  [4, 1],
  [4, 0],
  [5, 0],
  [6, 0],
  [7, 0],
  [8, 0],
  /* bottom left corner end */
  [0, 5],
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [3, 7],
  [4, 7],
  [5, 7],
  [6, 7],
  [6, 8],
  [7, 8],
  [8, 8],
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [12, 7],
  [12, 6],
  [13, 6],
  [14, 6],
  [14, 5],
  [14, 4],
  [15, 4],
  [15, 3],
  [14, 3],
  [13, 3],
  [13, 2],
  [12, 2],
  [12, 1],
  [12, 0],
];
export const TEMPLE_TREASURE_SPACES = [
  [1, 1],
  [1, 7],
  [5, 2],
  [5, 9],
  [8, 6],
  [10, 0],
  [10, 10],
  [13, 4],
  [15, 1],
  [14, 8],
];
