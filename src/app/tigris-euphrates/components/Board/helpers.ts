import { makeNewKingdoms } from "./kingdom";
import { Kingdom } from "./kingdom/types";
import { TigrisEuphratesState, isTile } from "./types";

export function updatedKingdoms({
  dirtyKingdom,
  kingdoms,
}: {
  dirtyKingdom: Kingdom;
  kingdoms: Kingdom[];
}): Kingdom[] {
  const dirtyIndex = kingdoms.findIndex(({ id }) => id === dirtyKingdom.id);
  return [
    ...kingdoms.slice(0, dirtyIndex),
    ...makeNewKingdoms(dirtyKingdom),
    ...kingdoms.slice(dirtyIndex + 1),
  ];
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

// Assumes tileBag is shuffled
// Gives player tile from the bag
export function giveTileToPlayer(
  state: TigrisEuphratesState,
  playerId: string,
) {
  if (state.tileBag.length < 1) return;
  if (state.players[playerId] === undefined) return;

  const tile = state.tileBag.pop();
  isTile(tile) && state.players[playerId].tiles.push(tile);
}
