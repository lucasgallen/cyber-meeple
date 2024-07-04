import { CivType } from "./types";

export const TEMPLE_TILE_COUNT = 57;
export const FARM_TILE_COUNT = 36;
export const MARKET_TILE_COUNT = 30;
export const SETTLEMENT_TILE_COUNT = 30;

export const PLAYER_TILE_CAPACITY = 6;

export const FARM = "farm" as const;
export const MARKET = "market" as const;
export const SETTLEMENT = "settlement" as const;
export const TEMPLE = "temple" as const;

export const CIV_COLOR_MAP: { [C in CivType]: string } = {
  [FARM]: "blue",
  [MARKET]: "green",
  [SETTLEMENT]: "black",
  [TEMPLE]: "red",
};
