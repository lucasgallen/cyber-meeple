import { COLUMN_SPACE_COUNT, ROW_SPACE_COUNT } from "./constants";

export type SpaceId = `${number},${number}`;
export type SpaceCoord = [number, number];
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

export function isSpaces(grid: readonly any[]): grid is Spaces {
  if (grid.length !== ROW_SPACE_COUNT) return false;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i].length !== COLUMN_SPACE_COUNT) return false;
      if (!isSpace(grid[i][j])) return false;
    }
  }

  return true;
}

export function isSpace(space: unknown): space is Space {
  if (space === undefined) return false;
  const hasTile = (space as Space).tile !== undefined;
  return hasTile;
}

export function isSpaceCoord(coord: number[]): coord is SpaceCoord {
  if (coord.length !== 2) return false;

  return true;
}
