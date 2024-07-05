import { describe, expect, it, vi } from "vitest";
import { initialGameState, setup } from "@teboard/init";
import { resolveAttack, wageTempleTiles } from ".";
import { Kingdom } from "@teboard/kingdom/types";
import { Dynasty, Leader, TigrisEuphratesState } from "@teboard/types";
import { FARM } from "@teboard/constants";
import { makeLeader, makeTempleTile } from "@teboard/testfactories";

function setupRevolt({
  G,
  attackerValue,
  defenderValue,
  attackerKey,
  defenderKey,
}: {
  G: TigrisEuphratesState;
  attackerValue: number;
  defenderValue: number;
  attackerKey: string;
  defenderKey: string;
}) {
  G.spaces[0][0].leader = makeLeader(G.players[attackerKey].dynasty);
  G.spaces[0][3].leader = makeLeader(G.players[defenderKey].dynasty);
  G.revolt = {
    attacker: attackerKey,
    defender: defenderKey,
  };
  G.players[attackerKey].revolt = {
    attackValue: attackerValue,
    wagedTiles: Array(2).fill(makeTempleTile()),
    leaderCoord: [0, 0],
  };
  G.players[defenderKey].revolt = {
    attackValue: defenderValue,
    wagedTiles: [],
    leaderCoord: [0, 3],
  };
}
describe("wageTempleTiles", () => {
  it("updates the revolt states", () => {
    const G = initialGameState(3);
    const attackerKey = "1";
    G.players[attackerKey].tiles = Array(6).fill(makeTempleTile());
    setup({ initialState: G, shuffle: vi.fn() });
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,1", "0,2", "0,3", "0,4"] },
    ];
    G.kingdoms = kingdoms;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const opposingleader: Leader = { dynasty: Dynasty.ARCHER, civType: FARM };
    G.spaces[0][0].leader = leader;
    G.spaces[0][3].leader = opposingleader;
    G.spaces[0][1].tile = makeTempleTile();
    G.spaces[0][4].tile = makeTempleTile();

    wageTempleTiles({
      G,
      coordOfPlacedLeader: [0, 0],
      currentPlayer: attackerKey,
      numberOfTiles: 2,
      isOpposing: false,
    });

    expect(G.revolt.attacker).toMatchObject(attackerKey);
    expect(G.players[attackerKey].revolt.attackValue).toEqual(3);
    expect(G.players[attackerKey].revolt.leaderCoord).toMatchObject([0, 0]);
    expect(G.players[attackerKey].revolt.wagedTiles).toMatchObject([
      makeTempleTile(),
      makeTempleTile(),
    ]);
  });
  it("resolves the revolt after the defender makes their wage", () => {
    const G = initialGameState(3);
    const attackerKey = "1";
    const defenderKey = "0";
    G.players[attackerKey].tiles = Array(6).fill(makeTempleTile());
    setup({ initialState: G, shuffle: vi.fn() });
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,1", "0,2", "0,3", "0,4"] },
    ];
    G.kingdoms = kingdoms;
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const opposingleader: Leader = { dynasty: Dynasty.ARCHER, civType: FARM };
    G.spaces[0][0].leader = leader;
    G.spaces[0][3].leader = opposingleader;
    G.spaces[0][1].tile = makeTempleTile();
    G.spaces[0][4].tile = makeTempleTile();

    wageTempleTiles({
      G,
      coordOfPlacedLeader: [0, 0],
      currentPlayer: attackerKey,
      numberOfTiles: 2,
      isOpposing: false,
    });

    expect(G.players[attackerKey].points.temple).toEqual(0);

    wageTempleTiles({
      G,
      coordOfPlacedLeader: [0, 3],
      currentPlayer: defenderKey,
      numberOfTiles: 0,
      isOpposing: true,
    });

    expect(G.revolt.attacker).toEqual("");
    expect(G.revolt.defender).toEqual("");

    expect(G.players[attackerKey].points.temple).toEqual(1);
  });
});

describe("resolveAttack", () => {
  it("awards attacker when they have more temples", () => {
    const G = initialGameState(3);
    const attackerKey = "1";
    const defenderKey = "0";
    setupRevolt({
      G,
      defenderValue: 1,
      attackerValue: 3,
      attackerKey,
      defenderKey,
    });
    expect(G.players[attackerKey].points.temple).toEqual(0);
    expect(G.spaces[0][3].leader).not.toBeNull();
    expect(G.players[defenderKey].points.temple).toEqual(0);
    resolveAttack({ G });
    expect(G.spaces[0][3].leader).toBeNull();
    expect(G.players[attackerKey].points.temple).toEqual(1);
    expect(G.players[defenderKey].points.temple).toEqual(0);
  });

  it("awards defender when they have equal temples", () => {
    const G = initialGameState(3);
    const attackerKey = "1";
    const defenderKey = "0";
    setupRevolt({
      G,
      defenderValue: 1,
      attackerValue: 1,
      attackerKey,
      defenderKey,
    });

    expect(G.players[attackerKey].points.temple).toEqual(0);
    expect(G.players[defenderKey].points.temple).toEqual(0);
    expect(G.spaces[0][0].leader).not.toBeNull();
    expect(G.spaces[0][3].leader).not.toBeNull();

    resolveAttack({ G });

    expect(G.spaces[0][0].leader).toBeNull();
    expect(G.spaces[0][3].leader).not.toBeNull();
    expect(G.players[attackerKey].points.temple).toEqual(0);
    expect(G.players[defenderKey].points.temple).toEqual(1);
  });

  it("awards defender when they have more temples", () => {
    const G = initialGameState(3);
    const attackerKey = "1";
    const defenderKey = "0";
    setupRevolt({
      G,
      defenderValue: 2,
      attackerValue: 1,
      attackerKey,
      defenderKey,
    });

    expect(G.players[attackerKey].points.temple).toEqual(0);
    expect(G.players[defenderKey].points.temple).toEqual(0);
    expect(G.spaces[0][0].leader).not.toBeNull();
    expect(G.spaces[0][3].leader).not.toBeNull();

    resolveAttack({ G });

    expect(G.spaces[0][0].leader).toBeNull();
    expect(G.spaces[0][3].leader).not.toBeNull();
    expect(G.players[attackerKey].points.temple).toEqual(0);
    expect(G.players[defenderKey].points.temple).toEqual(1);
  });

  it("resets the game's revolt state", () => {
    const G = initialGameState(3);
    const attackerKey = "1";
    const defenderKey = "0";
    setupRevolt({
      G,
      defenderValue: 2,
      attackerValue: 1,
      attackerKey,
      defenderKey,
    });

    resolveAttack({ G });

    expect(G.revolt.attacker).toEqual("");
    expect(G.revolt.defender).toEqual("");
  });
});
