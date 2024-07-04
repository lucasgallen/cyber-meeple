import {
  FARM,
  FARM_TILE_COUNT,
  MARKET,
  MARKET_TILE_COUNT,
  PLAYER_TILE_CAPACITY,
  SETTLEMENT,
  SETTLEMENT_TILE_COUNT,
  TEMPLE,
  TEMPLE_TILE_COUNT,
} from "@teboard/constants";
import { giveTileToPlayer } from "@teboard/helpers";
import { initialSpaces } from "@teboard/space";
import { TEMPLE_TREASURE_SPACES } from "@teboard/space/constants";
import {
  CatastropheTile,
  Dynasty,
  Leader,
  Monument,
  PlayerState,
  TigrisEuphratesState,
  Tile,
} from "@teboard/types";

export function initialPlayerState(
  dynasty: Dynasty,
  tiles: Tile[],
): PlayerState {
  const leaders: Leader[] = [
    { dynasty, civType: FARM },
    { dynasty, civType: MARKET },
    { dynasty, civType: SETTLEMENT },
    { dynasty, civType: TEMPLE },
  ];

  return {
    dynasty,
    tiles,
    leaders,
    points: { [FARM]: 0, [MARKET]: 0, [SETTLEMENT]: 0, [TEMPLE]: 0 },
    treasures: 0,
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
  const monuments = Object.values(Monument) as Monument[];
  if (playerCount === 3)
    return {
      spaces: initialSpaces(),
      kingdoms: [],
      tileBag: initialTileBag(),
      players: {
        "0": initialPlayerState(Dynasty.ARCHER, []),
        "1": initialPlayerState(Dynasty.BULL, []),
        "2": initialPlayerState(Dynasty.LION, []),
      },
      remainingMonuments: monuments,
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
    remainingMonuments: monuments,
  };
}

export function setup({
  initialState,
  shuffle,
}: {
  initialState: TigrisEuphratesState;
  shuffle: <T>(deck: T[]) => T[];
}) {
  const playerKeys = Object.keys(initialState.players);
  playerKeys.forEach((id) => {
    const catastropheTiles: CatastropheTile[] = [
      { catastrophe: true, river: false, facedown: false },
      { catastrophe: true, river: false, facedown: false },
    ];
    initialState.players[id].tiles = [
      ...initialState.players[id].tiles,
      ...catastropheTiles,
    ];
    shuffle(initialState.tileBag);
    for (let tileCount = 0; tileCount < PLAYER_TILE_CAPACITY - 2; tileCount++) {
      giveTileToPlayer(initialState, id);
    }
  });

  return initialState;
}
