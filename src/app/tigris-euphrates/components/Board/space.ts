import {
  COLUMN_SPACE_COUNT,
  RIVER_SPACES,
  ROW_SPACE_COUNT,
  TEMPLE,
  TEMPLE_TREASURE_SPACES,
} from "./constants";
import {
  Kingdom,
  Row,
  Space,
  SpaceId,
  Spaces,
  isSpace,
  isSpaces,
} from "./types";

export function getSpaceId(coord: [number, number]): SpaceId {
  return `${coord[0]},${coord[1]}`;
}

export function initialSpaces(): Spaces {
  let nullSpaces = Array(COLUMN_SPACE_COUNT).fill(
    Array(ROW_SPACE_COUNT).fill(null),
  );
  RIVER_SPACES.forEach((tuple) => {
    nullSpaces[tuple[0]][tuple[1]] = riverSpace(`${tuple[0]},${tuple[1]}`);
  });
  TEMPLE_TREASURE_SPACES.forEach((tuple) => {
    nullSpaces[tuple[0]][tuple[1]] = templeTreasureSpace(
      `${tuple[0]},${tuple[1]}`,
    );
  });

  for (let i = 0; i < nullSpaces.length; i++) {
    for (let j = 0; j < nullSpaces[i].length; j++) {
      if (nullSpaces[i][j] === null) {
        nullSpaces[i][j] = blankSpace(`${i},${j}`);
      }
    }
  }

  if (isSpaces(nullSpaces)) return nullSpaces;

  throw Error("Failed to initialize board spaces");
}

export function isSpaceEmpty(space: Space): boolean {
  if (space.tile !== null) return false;
  if (space.monument !== null) return false;
  if (space.leader !== null) return false;

  return true;
}

export function getSpace(coord: [number, number], rows: readonly Row[]): Space {
  const id = `${coord[0]},${coord[1]}`;
  const spaces = rows.reduce(
    (current: Space[], row) => [...current, ...row],
    [],
  );
  const space = spaces.find(({ id: spaceId }) => spaceId === id);

  if (space === undefined) {
    throw Error(`Could not find space with id "${id}"`);
  }

  return space;
}

export function getAdjacentSpaces(
  coord: [number, number],
  spaces: readonly Row[],
): Space[] {
  const adjacentSpaces = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ].map((displacement) => {
    const displacedSpaceCoord: [number, number] = [
      coord[0] + displacement[0],
      coord[1] + displacement[1],
    ];
    let displacedSpace: Space | undefined;
    try {
      displacedSpace = getSpace(displacedSpaceCoord, spaces);
    } catch {}

    if (displacedSpace === undefined) return;

    return displacedSpace;
  });
  return adjacentSpaces.filter(isSpace);
}

export function getKingdomFromSpace(id: SpaceId, kingdoms: Kingdom[]) {
  return kingdoms.find(({ spaces }) => {
    return spaces.includes(id);
  });
}

function blankSpace(id: SpaceId): Space {
  return {
    id,
    tile: null,
    river: false,
    treasure: false,
    monument: null,
    leader: null,
  };
}

function riverSpace(id: SpaceId): Space {
  return {
    id,
    tile: null,
    river: true,
    treasure: false,
    monument: null,
    leader: null,
  };
}

function templeTreasureSpace(id: SpaceId): Space {
  return {
    id,
    tile: { civType: TEMPLE, facedown: false, river: false },
    river: false,
    treasure: true,
    monument: null,
    leader: null,
  };
}
