import { describe, expect, it, vi } from "vitest";
import { swapTiles } from "./moves";
import { initialGameState } from "./init";
import { FARM, MARKET, SETTLEMENT } from "./constants";

describe("swapTiles", () => {
  it("ends the game when the tile bag is empty", () => {
    const G = initialGameState(3);
    G.tileBag = G.tileBag.slice(0, 2);
    const tileIndices = [0, 2, 3];
    const endGame = vi.fn();
    const shuffle = vi.fn();

    swapTiles({ G, currentPlayer: "0", endGame, shuffle, tileIndices });

    expect(endGame).toHaveBeenCalledOnce();
  });

  it("does not end the game when the tile bag has enough", () => {
    const G = initialGameState(3);
    G.tileBag = G.tileBag.slice(0, 3);
    const tileIndices = [0, 2, 3];
    const endGame = vi.fn();
    const shuffle = vi.fn();

    swapTiles({ G, currentPlayer: "0", endGame, shuffle, tileIndices });

    expect(endGame).not.toHaveBeenCalled();
  });

  it("discards correct tiles", () => {
    const G = initialGameState(3);
    const endGame = vi.fn();
    const shuffle = vi.fn();
    G.tileBag = G.tileBag.slice(-3);
    G.players["0"].tiles = [
      { civType: FARM, facedown: false, river: false },
      { catastrophe: true, facedown: false, river: false },
      { civType: SETTLEMENT, facedown: false, river: false },
      { civType: MARKET, facedown: false, river: false },
      { civType: FARM, facedown: false, river: false },
    ];
    const remainingTiles = [
      { catastrophe: true, facedown: false, river: false },
      { civType: MARKET, facedown: false, river: false },
      { civType: FARM, facedown: false, river: false },
      { civType: SETTLEMENT, facedown: false, river: false },
      { civType: SETTLEMENT, facedown: false, river: false },
      { civType: SETTLEMENT, facedown: false, river: false },
    ];
    const tileIndices = [0, 2];

    swapTiles({ G, currentPlayer: "0", endGame, shuffle, tileIndices });
    expect(G.players["0"].tiles).toMatchObject(remainingTiles);
  });
});
