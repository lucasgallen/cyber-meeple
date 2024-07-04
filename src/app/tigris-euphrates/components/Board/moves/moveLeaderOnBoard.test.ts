import { describe, expect, it, vi } from "vitest";
import { initialGameState } from "../init";
import { Dynasty, Leader, Tile } from "../types";
import { FARM, TEMPLE } from "../constants";
import { Kingdom } from "../kingdom/types";
import { moveLeaderOnBoard } from ".";

describe("moveLeaderOnBoard", () => {
  it("creates two kingdoms when separating tiles", () => {
    const G = initialGameState(3);
    const setActivePlayers = vi.fn();
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,0", "0,1", "0,2", "0,3", "0,4"] },
    ];
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[0][2];
    space.leader = leader;
    G.kingdoms = kingdoms;

    expect(G.kingdoms).toHaveLength(1);
    moveLeaderOnBoard({
      G,
      space: { from: [0, 2], to: [7, 7] },
      leader,
      setActivePlayers,
    });
    expect(G.kingdoms).toHaveLength(2);

    const spacesOfKingdoms = G.kingdoms.map(({ spaces }) => spaces);
    expect(spacesOfKingdoms).toMatchObject([
      ["0,0", "0,1"],
      ["0,3", "0,4"],
    ]);
  });

  it("creates three kingdoms when separating tiles", () => {
    const G = initialGameState(3);
    const setActivePlayers = vi.fn();
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["2,0", "2,1", "2,2", "2,3", "2,4", "1,2", "0,2"] },
    ];
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[2][2];
    space.leader = leader;
    const playerKey = "1";
    G.kingdoms = kingdoms;

    expect(G.kingdoms).toHaveLength(1);
    moveLeaderOnBoard({
      G,
      space: { from: [2, 2], to: [7, 7] },
      leader,
      setActivePlayers,
    });
    expect(G.kingdoms).toHaveLength(3);

    const spacesOfKingdoms = G.kingdoms.map(({ spaces }) => spaces);
    expect(spacesOfKingdoms).toMatchObject([
      ["2,0", "2,1"],
      ["2,3", "2,4"],
      ["1,2", "0,2"],
    ]);
  });

  it("creates four kingdoms when separating tiles", () => {
    const G = initialGameState(3);
    const setActivePlayers = vi.fn();
    const kingdoms: Kingdom[] = [
      {
        id: "one",
        spaces: ["2,0", "2,1", "2,2", "2,3", "2,4", "1,2", "0,2", "3,2", "4,2"],
      },
    ];
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[2][2];
    space.leader = leader;
    G.kingdoms = kingdoms;

    expect(G.kingdoms).toHaveLength(1);
    moveLeaderOnBoard({
      G,
      space: { from: [2, 2], to: [7, 7] },
      leader,
      setActivePlayers,
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

  it("causes conflict when there is an opposing leader", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,1", "0,2", "0,3", "0,4"] },
    ];
    G.kingdoms = kingdoms;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const opposingleader: Leader = { dynasty: Dynasty.ARCHER, civType: FARM };
    G.spaces[0][3].leader = opposingleader;
    const setActivePlayers = vi.fn();

    moveLeaderOnBoard({
      G,
      space: { from: [0, 7], to: [0, 0] },
      leader,
      setActivePlayers,
    });

    expect(setActivePlayers).toHaveBeenCalledOnce();
    expect(setActivePlayers).toBeCalledWith({
      currentPlayer: "AttackLeader",
      value: { "0": "AttackLeader" },
    });
  });

  it("does not cause conflict when opposing leader does not exist", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,1", "0,2", "0,3", "0,4"] },
    ];
    G.kingdoms = kingdoms;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const setActivePlayers = vi.fn();

    moveLeaderOnBoard({
      G,
      space: { from: [0, 7], to: [0, 0] },
      leader,
      setActivePlayers,
    });

    expect(setActivePlayers).not.toHaveBeenCalled();
  });

  it("does not cause conflict when it creates a new kingdom", () => {
    const G = initialGameState(3);
    const tile: Tile = { facedown: false, river: false, civType: TEMPLE };
    G.spaces[0][1].tile = tile;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const setActivePlayers = vi.fn();

    moveLeaderOnBoard({
      G,
      space: { from: [0, 7], to: [0, 0] },
      leader,
      setActivePlayers,
    });

    expect(setActivePlayers).not.toHaveBeenCalled();
    expect(G.kingdoms).toHaveLength(1);
    expect(G.kingdoms[0].spaces).toMatchObject(["0,0", "0,1"]);
  });
});
