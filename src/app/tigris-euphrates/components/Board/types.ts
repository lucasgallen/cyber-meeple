import { FARM, MARKET, SETTLEMENT, TEMPLE } from "./constants";
import { Kingdom } from "./kingdom/types";
import { SpaceCoord, Spaces } from "./space/types";

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

export interface CatastropheTile extends TileInterface {
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
  revolt: {
    wagedTiles: CivilizationTile[];
    attackValue: number;
    leaderCoord: SpaceCoord;
  };
};

export type Leader = {
  dynasty: Dynasty;
  civType: CivType;
};

export interface TigrisEuphratesState {
  players: { [key in string]: PlayerState };

  tileBag: Tile[];
  spaces: Spaces;
  kingdoms: Kingdom[];
  remainingMonuments: Monument[];
  revolt: {
    attacker: string;
    defender: string;
  };
}

export function isLeader(leader: unknown): leader is Leader {
  if (leader === undefined) return false;
  if (leader === null) return false;
  const hasDynasty = (leader as Leader).dynasty !== undefined;
  const hasCivType = (leader as Leader).civType !== undefined;

  return hasDynasty && hasCivType;
}

export function isTile(tile: unknown): tile is Tile {
  if (tile === undefined) return false;
  if (tile === null) return false;

  if ((tile as Tile).facedown === undefined) return false;
  if ((tile as Tile).river === undefined) return false;

  return true;
}

export function isCivilizationTile(
  tile: Tile | null,
): tile is CivilizationTile {
  if (tile === null) return false;
  if ((tile as CivilizationTile).civType === undefined) return false;
  return true;
}
