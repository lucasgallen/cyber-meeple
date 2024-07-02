import {
  FARM,
  FARM_TILE_COUNT,
  MARKET,
  MARKET_TILE_COUNT,
  SETTLEMENT,
  SETTLEMENT_TILE_COUNT,
  TEMPLE,
  TEMPLE_TILE_COUNT,
  TEMPLE_TREASURE_SPACES,
} from "./constants";
import { initialSpaces } from "./space";
import { Dynasty, PlayerState, TigrisEuphratesState, Tile } from "./types";

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
