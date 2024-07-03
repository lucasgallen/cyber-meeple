import { describe, expect, it, vi } from "vitest";
import { placeCivilizationTile, swapTiles } from "./moves";
import { initialGameState } from "./init";
import { FARM, MARKET, SETTLEMENT } from "./constants";
import { CivilizationTile, Dynasty, Kingdom } from "./types";

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

describe("placeCivilizationTile", () => {
  it("does not throw an error", () => {
    const G = initialGameState(3);
    const tile: CivilizationTile = {
      civType: FARM,
      facedown: false,
      river: false,
    };
    const setActivePlayers = vi.fn();
    const toSpace = G.spaces[0][0].id.split(",").map((coord) => +coord) as [
      number,
      number,
    ];

    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });
  });

  it("awards no points if there is no neighboring kingdom", () => {
    const G = initialGameState(3);
    const tile: CivilizationTile = {
      civType: FARM,
      facedown: false,
      river: false,
    };
    const setActivePlayers = vi.fn();
    const toSpace = G.spaces[0][0].id.split(",").map((coord) => +coord) as [
      number,
      number,
    ];

    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });

    expect(
      Object.values(G.players).reduce((current, { points }) => {
        const totalPoints = Object.values(points).reduce(
          (curr, point) => curr + point,
          0,
        );
        return current + totalPoints;
      }, 0),
    ).toEqual(0);
  });

  it("triggers unification conflict when joining two kingdoms", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,0", "0,1", "0,2"] },
      { id: "two", spaces: ["0,4", "0,5", "0,6"] },
    ];
    G.kingdoms = kingdoms;

    const tile: CivilizationTile = {
      civType: FARM,
      facedown: false,
      river: false,
    };
    const setActivePlayers = vi.fn();
    const toSpace = G.spaces[0][3].id.split(",").map((coord) => +coord) as [
      number,
      number,
    ];

    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });
    expect(setActivePlayers).toHaveBeenCalledOnce();
    expect(setActivePlayers).toHaveBeenCalledWith({
      currentPlayer: "UnificationConflict",
    });
  });

  it("awards points to the player of the leader matching the tile's civilization", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [{ id: "two", spaces: ["0,4", "0,5", "0,6"] }];
    G.kingdoms = kingdoms;
    G.spaces[0][5].leader = { dynasty: Dynasty.BULL, civType: FARM };

    const tile: CivilizationTile = {
      civType: FARM,
      facedown: false,
      river: false,
    };
    const setActivePlayers = vi.fn();
    const toSpace = G.spaces[0][3].id.split(",").map((coord) => +coord) as [
      number,
      number,
    ];

    expect(G.players["1"].points.farm).toEqual(0);
    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });

    expect(G.players["1"].points.farm).toEqual(1);
  });

  it("awards points to the player of the leader of the settlement", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [{ id: "two", spaces: ["0,4", "0,5", "0,6"] }];
    G.kingdoms = kingdoms;
    G.spaces[0][5].leader = { dynasty: Dynasty.BULL, civType: SETTLEMENT };

    const tile: CivilizationTile = {
      civType: FARM,
      facedown: false,
      river: false,
    };
    const setActivePlayers = vi.fn();
    const toSpace = G.spaces[0][3].id.split(",").map((coord) => +coord) as [
      number,
      number,
    ];

    expect(G.players["1"].points.farm).toEqual(0);
    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });

    expect(G.players["1"].points.farm).toEqual(1);
  });

  it("awards no points if no settlement leader or matching leader is in the adjacent kingdom", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [{ id: "two", spaces: ["0,4", "0,5", "0,6"] }];
    G.kingdoms = kingdoms;
    G.spaces[0][5].leader = { dynasty: Dynasty.BULL, civType: MARKET };

    const tile: CivilizationTile = {
      civType: FARM,
      facedown: false,
      river: false,
    };
    const setActivePlayers = vi.fn();
    const toSpace = G.spaces[0][3].id.split(",").map((coord) => +coord) as [
      number,
      number,
    ];

    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });

    expect(
      Object.values(G.players).reduce((current, { points }) => {
        const totalPoints = Object.values(points).reduce(
          (curr, point) => curr + point,
          0,
        );
        return current + totalPoints;
      }, 0),
    ).toEqual(0);
  });
});
