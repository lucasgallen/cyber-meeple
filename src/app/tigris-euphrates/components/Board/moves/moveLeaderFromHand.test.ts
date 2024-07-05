import { describe, expect, it, vi } from "vitest";
import { initialGameState } from "../init";
import { Dynasty, Leader, Tile } from "../types";
import { FARM, TEMPLE } from "../constants";
import { moveLeaderFromHand } from ".";
import { Kingdom } from "../kingdom/types";

describe("moveLeaderFromHand", () => {
  it("removes the leader from the player's hand and puts the leader on the board", () => {
    const G = initialGameState(3);
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[0][0];
    const playerKey = "1";
    const player = G.players[playerKey];
    const setActivePlayers = vi.fn();
    moveLeaderFromHand({
      G,
      toSpace: [0, 0],
      leader,
      currentPlayer: playerKey,
      setActivePlayers,
    });

    player.leaders.forEach((playerLeader) => {
      expect(playerLeader).not.toMatchObject(leader);
    });
    expect(space.leader).toBe(leader);
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
    const playerKey = "1";
    const setActivePlayers = vi.fn();

    moveLeaderFromHand({
      G,
      toSpace: [0, 0],
      leader,
      currentPlayer: playerKey,
      setActivePlayers,
    });

    expect(setActivePlayers).toHaveBeenCalledOnce();
    expect(setActivePlayers).toBeCalledWith({
      currentPlayer: "AttackLeader",
      next: { value: { "0": "DefendLeader" } },
    });
  });

  it("does not cause conflict when opposing leader does not exist", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,1", "0,2", "0,3", "0,4"] },
    ];
    G.kingdoms = kingdoms;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const playerKey = "1";
    const setActivePlayers = vi.fn();

    moveLeaderFromHand({
      G,
      toSpace: [0, 0],
      leader,
      currentPlayer: playerKey,
      setActivePlayers,
    });

    expect(setActivePlayers).not.toHaveBeenCalled();
  });

  it("does not cause conflict when it creates a new kingdom", () => {
    const G = initialGameState(3);
    const tile: Tile = { facedown: false, river: false, civType: TEMPLE };
    G.spaces[0][1].tile = tile;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const playerKey = "1";
    const setActivePlayers = vi.fn();

    moveLeaderFromHand({
      G,
      toSpace: [0, 0],
      leader,
      currentPlayer: playerKey,
      setActivePlayers,
    });

    expect(setActivePlayers).not.toHaveBeenCalled();
    expect(G.kingdoms).toHaveLength(1);
    expect(G.kingdoms[0].spaces).toMatchObject(["0,0", "0,1"]);
  });
});
