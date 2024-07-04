import type { Game } from "boardgame.io";
import { TurnOrder } from "boardgame.io/core";
import { initialGameState, setup } from "./init";

import { CivilizationTile, SpaceCoord, TigrisEuphratesState } from "./types";
import { COLUMN_SPACE_COUNT, ROW_SPACE_COUNT } from "./constants";
import {
  formMonument,
  moveLeader,
  placeCatastropheTile,
  placeCivilizationTile,
  swapTiles,
} from "./moves";

// Player Victory points:
//  - Red, Blue, Green, Black, Treasure (wild)
//  - publicly gained, but total is hidden
export const TigrisEuphrates: Game<TigrisEuphratesState> = {
  // The name of the game.
  name: "tigris-euphrates",

  // Function that returns the initial value of G.
  // setupData is an optional custom object that is
  // passed through the Game Creation API.
  setup: ({ ctx, random }) =>
    setup({
      initialState: initialGameState(ctx.numPlayers),
      shuffle: random.Shuffle,
    }),

  moves: {
    MoveLeader: moveLeader,
    PlaceCivilizationTile: (
      { G, events },
      tile: CivilizationTile,
      toSpace: SpaceCoord,
    ) =>
      placeCivilizationTile({
        G,
        setActivePlayers: events.setActivePlayers,
        tile,
        toSpace,
      }),

    FormMonument: formMonument,

    PlaceCatastropheTile: (
      { G, events, ctx },
      toSpace: SpaceCoord,
      tileIndex: number,
    ) => {
      placeCatastropheTile({
        G,
        toSpace,
        currentPlayer: ctx.currentPlayer,
        tileIndex,
      });
    },

    // discard up to six tiles from player's supply and give player that many new tiles
    SwapTiles: ({ G, ctx, events, random }, tileIndices: number[]) =>
      swapTiles({
        G,
        currentPlayer: ctx.currentPlayer,
        endGame: events.endGame,
        shuffle: random.Shuffle,
        tileIndices,
      }),
  },

  // Everything below is OPTIONAL.

  turn: {
    order: TurnOrder.DEFAULT,

    // If any kingdom contains more than one treasure at the end of an action and has a green trader:
    // - The possessor of the green trader in that kingdom takes all but one of the treasures in the kingdom.
    // - They must take the treasures on the corner temples first but may freely choose after that.
    //
    // After the actions, give the active player victory points for monuments:
    //  - For each leader matching a color on a monument, give the player one point of that color for each monument.
    //  - (A monument may generate one point in each of its two colors. Black does not collect for absent leaders.) At the end of any player’s turn, each player refreshes their hand to six tiles by drawing from the bag.
    onEnd: ({ G, ctx, events, random }) => G,

    minMoves: 2,
    maxMoves: 2,

    stages: {
      // - The attacking player may move any number of red temples from behind their screen to beside the board.
      // - Then the defending player may move any number of temples from behind their screen to beside of the board.
      // - The attacker wins if the number of temples next to their leader plus the number they added beside the board exceeds the number of temples next to the defender’s leader plus the number they added.
      // - Give one red victory point to the winner.
      // - Move the losing leader off the board.
      // - Discard all temples from the sides of the board.
      AttackLeader: {
        moves: {},
      },

      // - If there are multiple colors for which both kingdoms have a leader, the active player chooses the order.
      // - The attacker is the active player if involved or the next involved player in clockwise order.
      //   - The attacker may move any number of tiles of the conflict color from behind their screen to beside the board.
      //   - Then the defender may move any number of tiles of that color from behind their screen to beside the board.
      //   - The attacker wins if the number of tiles of that color in their kingdom and that they added beside the board exceeds the number of tiles of that color in the defender’s kingdom and that the defender added.
      //   - Move the losing leader off the board and give the winner one victory point of that color.
      //   - Discard each tile of the conflict color from the losing kingdom and give the winner a point for each of them.
      //     - Except, do not remove red temples that support a treasure or have another leader next to them, and do not award victory points for them.
      //     - (Discarding tiles may split the kingdom and eliminate conflicts in other colors.)
      //   - Discard all tiles from the sides of the board.
      // - Remove the unification tile. (Do not distribute a victory point as for normal placement of a tile.)
      UnificationConflict: {},
    },
  },

  // The minimum and maximum number of players supported
  // (This is only enforced when using the Lobby server component.)
  minPlayers: 3,
  maxPlayers: 4,

  // Ends the game if this returns anything.
  // The return value is available in `ctx.gameover`.
  endIf: ({ G }) => {
    // if a player tries to draw a tile, and the tile bag is empty, then the game ends
    let treasureCount = 0;
    for (let i = 0; i < COLUMN_SPACE_COUNT; i++) {
      for (let j = 0; j < ROW_SPACE_COUNT; j++) {
        if (G.spaces[i][j].treasure) treasureCount++;
        if (treasureCount === 3) return;
      }
    }

    if (treasureCount < 3) return true;
    // if there are less than three treasures on the board, then the game ends
  },

  // Called at the end of the game.
  // `ctx.gameover` is available at this point.
  onEnd: ({ G, ctx, events, random, ...plugins }) => G,

  // Disable undo feature for all the moves in the game
  disableUndo: true,

  // Transfer delta state with JSON Patch in multiplayer
  deltaState: true,
};
