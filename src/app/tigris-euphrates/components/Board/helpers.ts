import {
  Dynasty,
  Kingdom,
  PlayerState,
  Row,
  Space,
  SpaceId,
  Spaces,
  TigrisEuphratesState,
  Tile,
  isSpace,
  isSpaces,
} from "./types";
import { v4 as uuidv4 } from "uuid";

import {
  COLUMN_SPACE_COUNT,
  FARM,
  FARM_TILE_COUNT,
  MARKET,
  MARKET_TILE_COUNT,
  RIVER_SPACES,
  ROW_SPACE_COUNT,
  SETTLEMENT,
  SETTLEMENT_TILE_COUNT,
  TEMPLE,
  TEMPLE_TILE_COUNT,
  TEMPLE_TREASURE_SPACES,
} from "./constants";

export function getSpaceId(coord: [number, number]): SpaceId {
  return `${coord[0]},${coord[1]}`;
}

export function updateKingdoms() {
  // define the current set of kingdoms
  //
  // Each kingdom has unique set of spaces (id'd by their indices)
  // when a space is changed we can check its adjacent spaces:
  //   - how many adjacent spaces are empty?
  //      - if all are empty, start new kingdom
  //      - if only one is non-empty, add current space to the adjacent space's kingdom
  //      - if more than one is non-empty, merge the three kingdoms into one
  //
  // OR
  //
  // Loop through all spaces and recreate set of kingdoms
}

export function buildMonument() {
  // puts a monument on the board
  //
  // Turn the four tiles facedown. (If a treasure is on a tile, leave it on the facedown tile.)
  // Put a monument sharing a color with the facedown tiles on the four tiles.
  // (If the monument is not built on these four tiles now, it never can be.)
  // The facedown tiles and monument are still part of the kingdom but no longer support leaders in any way.
  //   - If this leaves a leader no longer next to a red temple, move the leader off the board.
}

export function initialPlayerState(
  dynasty: Dynasty,
  tiles: Tile[],
): PlayerState {
  return {
    dynasty,
    tiles,
    leaders: 4,
    points: {
      blue: 0,
      black: 0,
      green: 0,
      red: 0,
      treasure: 0,
    },
  };
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

export function getSpacesFromKingdom(
  kingdom: Kingdom,
  rows: readonly Row[],
): Space[] {
  return kingdom.spaces
    .map((space) => {
      const coord = space.split(",").map((spaceStr) => +spaceStr) as [
        number,
        number,
      ];
      return getSpace(coord, rows);
    })
    .filter(isSpace);
}

function initialTileBag(): Tile[] {
  return [
    ...Array(TEMPLE_TILE_COUNT - TEMPLE_TREASURE_SPACES.length).fill({
      civType: TEMPLE,
      river: false,
      facedown: false,
    }),
    ...Array(FARM_TILE_COUNT).fill({
      civType: FARM,
      river: true,
      facedown: false,
    }),
    ...Array(MARKET_TILE_COUNT).fill({
      civType: MARKET,
      river: false,
      facedown: false,
    }),
    ...Array(SETTLEMENT_TILE_COUNT).fill({
      civType: SETTLEMENT,
      river: false,
      facedown: false,
    }),
  ];
}

export function initialGameState(playerCount: number): TigrisEuphratesState {
  // return intial game state
  //
  if (playerCount === 4)
    return {
      spaces: initialSpaces(),
      kingdoms: [],
      tileBag: initialTileBag(),
      players: {
        "0": initialPlayerState(Dynasty.ARCHER, []),
        "1": initialPlayerState(Dynasty.BULL, []),
        "2": initialPlayerState(Dynasty.LION, []),
      },
    };

  return {
    spaces: initialSpaces(),
    kingdoms: [],
    tileBag: initialTileBag(),
    players: {
      "0": initialPlayerState(Dynasty.ARCHER, []),
      "1": initialPlayerState(Dynasty.BULL, []),
      "2": initialPlayerState(Dynasty.LION, []),
      "3": initialPlayerState(Dynasty.URN, []),
    },
  };
}

// Assumes tileBag is shuffled
export function giveTileToPlayer(
  state: TigrisEuphratesState,
  playerId: string,
) {
  if (state.tileBag.length < 1) return;
  if (state.players[playerId] === undefined) return;

  /*
  const randomIndex = Math.floor(Math.random() * state.tileBag.length);
  const tile = state.tileBag[randomIndex];
  state.tileBag = [
    ...state.tileBag.slice(0, randomIndex),
    ...state.tileBag.slice(randomIndex + 1, state.tileBag.length - 1),
  ];
  */

  const tile = state.tileBag.pop();
  state.players[playerId]!.tiles.push(tile!);
}

export function makeNewKingdoms(originalKingdom: Kingdom): Kingdom[] {
  let uncheckedSpaces = [...originalKingdom.spaces];
  let newKingdoms: Kingdom[] = [];
  findKingdoms();

  function findKingdoms() {
    if (uncheckedSpaces.length < 1) return;

    const newKingdom: Kingdom = {
      id: uuidv4(),
      spaces: findUncheckedNeighbors(uncheckedSpaces[0]),
    };
    newKingdoms.push(newKingdom);
    findKingdoms();
  }

  function findUncheckedNeighbors(spaceId: SpaceId): SpaceId[] {
    if (uncheckedSpaces.length < 1) return [];

    const space = spaceId.split(",").map((space) => +space) as [number, number];
    const deltas = [1, -1];
    const uncheckedNeighborIds: SpaceId[] = [];
    const neighborIdsInKingdom: SpaceId[] = [spaceId];

    const uncheckedSpaceIndx = uncheckedSpaces.indexOf(spaceId);
    uncheckedSpaces = [
      ...uncheckedSpaces.slice(0, uncheckedSpaceIndx),
      ...uncheckedSpaces.slice(uncheckedSpaceIndx + 1, uncheckedSpaces.length),
    ];

    deltas.forEach((delta) => {
      const neighbor: [number, number] = [space[0] + delta, space[1]];
      const neighborString: SpaceId = getSpaceId(neighbor);
      if (uncheckedSpaces.includes(neighborString))
        uncheckedNeighborIds.push(neighborString);
    });
    deltas.forEach((delta) => {
      const neighbor: [number, number] = [space[0], space[1] + delta];
      const neighborString: SpaceId = getSpaceId(neighbor);
      if (uncheckedSpaces.includes(neighborString))
        uncheckedNeighborIds.push(neighborString);
    });

    uncheckedNeighborIds.forEach((neighbor) => {
      neighborIdsInKingdom.push(...findUncheckedNeighbors(neighbor));
    });

    return neighborIdsInKingdom;
  }

  return newKingdoms;
}
