import { describe, expect, it, vi } from "vitest";
import {
  formMonument,
  placeCatastropheTile,
  placeCivilizationTile,
  swapTiles,
} from ".";
import { initialGameState, setup } from "@teboard/init/";
import { FARM, MARKET, SETTLEMENT } from "@teboard/constants";
import {
  CatastropheTile,
  CivilizationTile,
  Dynasty,
  Monument,
} from "@teboard/types";
import { Kingdom } from "@teboard/kingdom/types";
import { SpaceCoord, isSpace } from "@teboard/space/types";

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
    const bullPlayer = G.players["1"];
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

    expect(bullPlayer.dynasty).toEqual(Dynasty.BULL);
    expect(bullPlayer.points.farm).toEqual(0);
    placeCivilizationTile({ G, setActivePlayers, tile, toSpace });

    expect(bullPlayer.points.farm).toEqual(1);
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

describe("formMonument", () => {
  it("turns a grid of four tiles into a monument", () => {
    const G = initialGameState(3);
    const spaceCoords: [SpaceCoord, SpaceCoord, SpaceCoord, SpaceCoord] = [
      [3, 3],
      [4, 3],
      [4, 2],
      [3, 2],
    ];
    const spaces = spaceCoords
      .map((coord) => G.spaces[coord[0]][coord[1]])
      .filter(isSpace);
    const monument = Monument.RED_BLUE;

    formMonument({ G, spaceCoords, monument });

    const monuments = spaces.map(({ monument }) => monument);
    monuments.forEach((mon) => expect(mon).toEqual(monument));
  });

  it("turns a grid of four tiles facedown", () => {
    const G = initialGameState(3);
    const spaceCoords: [SpaceCoord, SpaceCoord, SpaceCoord, SpaceCoord] = [
      [3, 3],
      [4, 3],
      [4, 2],
      [3, 2],
    ];
    const spaces = spaceCoords
      .map((coord) => G.spaces[coord[0]][coord[1]])
      .filter(isSpace);
    const monument = Monument.RED_BLUE;
    spaces.forEach((space) => {
      const tile: CivilizationTile = {
        river: false,
        facedown: false,
        civType: FARM,
      };

      space.tile = tile;
    });

    formMonument({ G, spaceCoords, monument });

    spaces.forEach(({ tile }) => expect(tile.facedown).toBe(true));
  });
});

describe("placeCatastropheTile", () => {
  it("does not throw an error", () => {
    const G = initialGameState(3);
    const shuffle = vi.fn();
    setup({ initialState: G, shuffle });

    placeCatastropheTile({
      G,
      toSpace: [0, 4],
      currentPlayer: "0",
      tileIndex: 0,
    });
  });

  it("updates the board with the catastrophe at the target space", () => {
    const G = initialGameState(3);
    const catastrophe: CatastropheTile = {
      facedown: false,
      river: false,
      catastrophe: true,
    };
    setup({ initialState: G, shuffle: vi.fn() });

    placeCatastropheTile({
      G,
      toSpace: [0, 4],
      currentPlayer: "0",
      tileIndex: 0,
    });

    expect(G.spaces[0][4].tile).toMatchObject(catastrophe);
  });

  it("can separate two kingdoms", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,0", "0,1", "0,2", "0,3", "0,4"] },
    ];
    G.kingdoms = kingdoms;
    setup({ initialState: G, shuffle: vi.fn() });

    expect(G.kingdoms).toHaveLength(1);
    placeCatastropheTile({
      G,
      toSpace: [0, 2],
      currentPlayer: "0",
      tileIndex: 0,
    });
    expect(G.kingdoms).toHaveLength(2);
    const spacesOfKingdoms = G.kingdoms.map(({ spaces }) => spaces);
    expect(spacesOfKingdoms).toMatchObject([
      ["0,0", "0,1"],
      ["0,3", "0,4"],
    ]);
  });

  it("can separate three kingdoms", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["2,0", "2,1", "2,2", "2,3", "2,4", "1,2", "0,2"] },
    ];
    G.kingdoms = kingdoms;
    setup({ initialState: G, shuffle: vi.fn() });

    expect(G.kingdoms).toHaveLength(1);
    placeCatastropheTile({
      G,
      toSpace: [2, 2],
      currentPlayer: "0",
      tileIndex: 0,
    });
    expect(G.kingdoms).toHaveLength(3);
    const spacesOfKingdoms = G.kingdoms.map(({ spaces }) => spaces);
    expect(spacesOfKingdoms).toMatchObject([
      ["2,0", "2,1"],
      ["2,3", "2,4"],
      ["1,2", "0,2"],
    ]);
  });

  it("can separate four kingdoms", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      {
        id: "one",
        spaces: ["2,0", "2,1", "2,2", "2,3", "2,4", "1,2", "0,2", "3,2", "4,2"],
      },
    ];
    G.kingdoms = kingdoms;
    setup({ initialState: G, shuffle: vi.fn() });

    expect(G.kingdoms).toHaveLength(1);
    placeCatastropheTile({
      G,
      toSpace: [2, 2],
      currentPlayer: "0",
      tileIndex: 0,
    });
    expect(G.kingdoms).toHaveLength(4);
    const spacesOfKingdoms = G.kingdoms.map(({ spaces }) => spaces);
    expect(spacesOfKingdoms).toMatchObject([
      ["2,0", "2,1"],
      ["2,3", "2,4"],
      ["1,2", "0,2"],
      ["3,2", "4,2"],
    ]);
  });
});
