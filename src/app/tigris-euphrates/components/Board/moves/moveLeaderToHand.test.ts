import { describe, expect, it } from "vitest";
import { initialGameState } from "@teboard/init";
import { Dynasty, Leader } from "@teboard/types";
import { FARM } from "@teboard/constants";
import { moveLeaderToHand } from ".";
import { Kingdom } from "@teboard/kingdom/types";

describe("moveLeaderToHand", () => {
  it("removes the leader from the board and back into players hand", () => {
    const G = initialGameState(3);
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[0][0];
    const playerKey = "1";
    const player = G.players[playerKey];
    space.leader = leader;
    moveLeaderToHand({ G, fromSpace: [0, 0], currentPlayer: playerKey });

    expect(space.leader).toBeNull();
    expect(player.leaders).toContain(leader);
  });

  it("creates two kingdoms when separating tiles", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["0,0", "0,1", "0,2", "0,3", "0,4"] },
    ];
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[0][2];
    space.leader = leader;
    const playerKey = "1";
    G.kingdoms = kingdoms;

    expect(G.kingdoms).toHaveLength(1);
    moveLeaderToHand({ G, fromSpace: [0, 2], currentPlayer: playerKey });
    expect(G.kingdoms).toHaveLength(2);

    const spacesOfKingdoms = G.kingdoms.map(({ spaces }) => spaces);
    expect(spacesOfKingdoms).toMatchObject([
      ["0,0", "0,1"],
      ["0,3", "0,4"],
    ]);
  });

  it("creates three kingdoms when separating tiles", () => {
    const G = initialGameState(3);
    const kingdoms: Kingdom[] = [
      { id: "one", spaces: ["2,0", "2,1", "2,2", "2,3", "2,4", "1,2", "0,2"] },
    ];
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[2][2];
    space.leader = leader;
    const playerKey = "1";
    G.kingdoms = kingdoms;

    expect(G.kingdoms).toHaveLength(1);
    moveLeaderToHand({ G, fromSpace: [2, 2], currentPlayer: playerKey });
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
    const kingdoms: Kingdom[] = [
      {
        id: "one",
        spaces: ["2,0", "2,1", "2,2", "2,3", "2,4", "1,2", "0,2", "3,2", "4,2"],
      },
    ];
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const space = G.spaces[2][2];
    space.leader = leader;
    const playerKey = "1";
    G.kingdoms = kingdoms;

    expect(G.kingdoms).toHaveLength(1);
    moveLeaderToHand({ G, fromSpace: [2, 2], currentPlayer: playerKey });
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
