import { isArray } from "util";
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
export enum Monument {
  RED_BLUE,
  RED_GREEN,
  RED_BLACK,
  BLUE_GREEN,
  BLUE_BLACK,
  GREEN_BLACK,
}

// Civilization Tile
// - Temple (red), Farm (blue), Market (green), Settlement (black)
export type CivType =
  | typeof TEMPLE
  | typeof FARM
  | typeof MARKET
  | typeof SETTLEMENT;

interface TileInterface {
  facedown: boolean;
  river: boolean;
}

interface CatastropheTile extends TileInterface {
  catastrophe: true;
  facedown: false;
}
interface UnificationTile extends TileInterface {}
interface DynastyTile extends TileInterface {
  dynasty: Dynasty;
}
export interface CivilizationTile extends TileInterface {
  civType: CivType;
}

export type Tile =
  | CatastropheTile
  | UnificationTile
  | DynastyTile
  | CivilizationTile;

export type PlayerState = {
  dynasty: Dynasty;
  points: { [C in CivType]: number };
  treasures: number;
  tiles: Tile[];
  leaders: Leader[];
};

export type Leader = {
  dynasty: Dynasty;
  civType: CivType;
};
export type Kingdom = {
  id: string;
  spaces: SpaceId[];
};

export type SpaceId = `${number},${number}`;
export type Space = {
  id: SpaceId;
  tile: Tile | null;
  river: boolean;
  treasure: boolean;
  monument: Monument | null;
  leader: Leader | null;
};

// 16x11 square grid game board
export type Row = readonly [
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

export interface TigrisEuphratesState {
  players: { [key in string]: PlayerState };

  tileBag: Tile[];
  spaces: Spaces;
  kingdoms: Kingdom[];
  remainingMonuments: Monument[];
}

export function isSpaces(grid: readonly any[]): grid is Spaces {
  if (grid.length !== ROW_SPACE_COUNT) return false;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i].length !== COLUMN_SPACE_COUNT) return false;
      if (!isSpace(grid[i][j])) return false;
      //if ((grid[i][j] as Space).tile === undefined) return false;
    }
  }

  return true;
}

export function isSpace(space: unknown): space is Space {
  const hasTile = (space as Space).tile !== undefined;
  return hasTile;
}

export function isKingdom(kingdom: unknown): kingdom is Kingdom {
  const hasId = typeof (kingdom as Kingdom).id === "string";
  const hasSpaces = isArray((kingdom as Kingdom).spaces);

  return hasId && hasSpaces;
}

export function isLeader(leader: unknown): leader is Leader {
  const hasDynasty = typeof (leader as Leader).dynasty === "string";
  const hasCivType = typeof (leader as Leader).civType === "string";

  return hasDynasty && hasCivType;
}

export function isCivilizationTile(
  tile: Tile | null,
): tile is CivilizationTile {
  if (tile === null) return false;
  if ((tile as CivilizationTile).civType === undefined) return false;
  return true;
}
