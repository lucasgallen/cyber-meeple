import {
  COLUMN_SPACE_COUNT,
  FARM,
  MARKET,
  ROW_SPACE_COUNT,
  SETTLEMENT,
  TEMPLE,
} from "./constants";

// Players: Urn, Archer, Lion, Bull
export enum Dynasty {
  URN,
  ARCHER,
  LION,
  BULL,
}

// Monument
// - 6 total; each a combination of two colors/civ tiles
enum Monument {
  RED_BLUE,
  RED_GREEN,
  RED_BLACK,
  BLUE_GREEN,
  BLUE_BLACK,
  GREEN_BLACK,
}

// Civilization Tile
// - Temple (red), Farm (blue), Market (green), Settlement (black)
type CivType = typeof TEMPLE | typeof FARM | typeof MARKET | typeof SETTLEMENT;

interface TileInterface {
  facedown: boolean;
  river: boolean;
}

interface CatastropheTile extends TileInterface {
  facedown: false;
}
interface UnificationTile extends TileInterface {}
interface DynastyTile extends TileInterface {
  type: Dynasty;
}
export interface CivilizationTile extends TileInterface {
  civType: CivType;
}

export type Tile =
  | CatastropheTile
  | UnificationTile
  | DynastyTile
  | CivilizationTile;

export interface PlayerState {
  dynasty: Dynasty;
  points: {
    red: number;
    blue: number;
    green: number;
    black: number;
    treasure: number;
  };
  tiles: Tile[];
  leaders: 0 | 1 | 2 | 3 | 4;
}

interface Leader {
  civType: CivType;
}
type Kingdom = Array<Tile | Leader>;

export type Space = {
  tile: Tile | null;
  river: boolean;
  treasure: boolean;
  monument: Monument | null;
};

// 16x11 square grid game board
type Row = readonly [
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
  Space,
];
export type Spaces = readonly [
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
];

export function isSpaces(grid: readonly any[]): grid is Spaces {
  if (grid.length !== COLUMN_SPACE_COUNT) return false;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i].length !== ROW_SPACE_COUNT) return false;
      if ((grid[i][j] as Space).tile === undefined) return false;
    }
  }

  return true;
}

export interface TigrisEuphratesState {
  players: {
    "0": PlayerState;
    "1": PlayerState;
    "2": PlayerState;
    "3"?: PlayerState;
  };

  tileBag: Tile[];
  spaces: Spaces;
  kingdoms: Kingdom[];
}
