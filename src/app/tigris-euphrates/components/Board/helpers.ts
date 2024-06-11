import {
  Dynasty,
  PlayerState,
  Space,
  Spaces,
  TigrisEuphratesState,
  Tile,
  isSpaces,
} from "./types";

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

function blankSpace(): Space {
  return {
    tile: null,
    river: false,
    treasure: false,
    monument: null,
  };
}

function riverSpace(): Space {
  return {
    tile: null,
    river: true,
    treasure: false,
    monument: null,
  };
}

function templeTreasureSpace(): Space {
  return {
    tile: { civType: TEMPLE, facedown: false, river: false },
    river: false,
    treasure: true,
    monument: null,
  };
}

export function initialSpaces(): Spaces {
  let nullSpaces = Array(COLUMN_SPACE_COUNT).fill(
    Array(ROW_SPACE_COUNT).fill(null),
  );
  RIVER_SPACES.forEach((tuple) => {
    nullSpaces[tuple[0]][tuple[1]] = riverSpace();
  });
  TEMPLE_TREASURE_SPACES.forEach((tuple) => {
    nullSpaces[tuple[0]][tuple[1]] = templeTreasureSpace();
  });

  for (let i = 0; i < nullSpaces.length; i++) {
    for (let j = 0; j < nullSpaces[i].length; j++) {
      if (nullSpaces[i][j] === null) {
        nullSpaces[i][j] = blankSpace();
      }
    }
  }

  if (isSpaces(nullSpaces)) return nullSpaces;

  throw Error("Failed to initialize board spaces");
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
  playerId: "0" | "1" | "2" | "3",
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
