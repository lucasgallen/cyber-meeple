import type { Game } from "boardgame.io";
import { TurnOrder } from "boardgame.io/core";
import { giveTileToPlayer, initialGameState } from "./helpers";
import { TigrisEuphratesState } from "./types";
import { PLAYER_TILE_CAPACITY } from "./constants";

// Player Victory points:
//  - Red, Blue, Green, Black, Treasure (wild)
//  - publicly gained, but total is hidden
export const TigrisEuphrates: Game<TigrisEuphratesState> = {
  // The name of the game.
  name: "tigris-euphrates",

  // Function that returns the initial value of G.
  // setupData is an optional custom object that is
  // passed through the Game Creation API.
  setup: ({ ctx, random }) => {
    const players = ["0", "1", "2", "3"] as const;
    let initialState = initialGameState(ctx.numPlayers);

    players.forEach((id) => {
      random.Shuffle(initialState.tileBag);
      for (let tileCount = 0; tileCount < PLAYER_TILE_CAPACITY; tileCount++) {
        giveTileToPlayer(initialState, id);
      }
    });

    return initialState;
  },

  moves: {
    MoveLeader: () => {
      // select leader from the board or from supply
      // place leader into any empty, non-river space that does not join two kingdoms
      // a leader cannot separate two kingdoms and then join the same two kingdoms
      //
      // if leader is placed into another kingdom with a leader of the same color, then start the AttackLeader Stage with the defending player
    },
    PlaceCivilizationTile: () => {
      // place civilization tile onto any empty space that does not join three or more kingdoms
      // river tiles and spaces must match
      //
      // if the tile matches the color of a leader in the kingdom, then give one victory point
      // of that color to the leader's player
      // else if the kingdom has a black leader, give the point to the black leader's player
      // else no points given
      //
      // if the tile joins two kingdoms, then put a unification tile on it and resolve the conflict in the UnificationConflict Stage
      //
      // if the tile forms a square of four like-colored tiles, the player may form a monument
    },
    PlaceCatastropheTile: () => {
      // place catastrophe tile on any empty space that does not have treasure or a monument
      // If this leaves a leader no longer next to a red temple, move the leader off the board.
    },
    SwapTiles: () => {
      // discard up to six tiles from player's supply and give player that many new tiles
    },

    // short-form move.
    // A: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => {},

    // long-form move.
    /*
    B: {
      // The move function.
      move: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => {},
      // Prevents undoing the move.
      // Can also be a function: ({ G, ctx }) => true/false
      undoable: false,
      // Prevents the move arguments from showing up in the log.
      redact: true,
      // Prevents the move from running on the client.
      client: false,
      // Prevents the move counting towards a player’s number of moves.
      noLimit: true,
      // Processes the move even if it was dispatched from an out-of-date client.
      // This can be risky; check the validity of the state update in your move.
      ignoreStaleStateID: true,
    },
    */
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
  endIf: ({ G, ctx }) => {
    // if there are less than three treasures on the board, then the game ends
    //
    // if a player tries to draw a tile, and the tile bag is empty, then the game ends
  },

  // Called at the end of the game.
  // `ctx.gameover` is available at this point.
  onEnd: ({ G, ctx, events, random, ...plugins }) => G,

  // Disable undo feature for all the moves in the game
  disableUndo: true,

  // Transfer delta state with JSON Patch in multiplayer
  deltaState: true,
};
