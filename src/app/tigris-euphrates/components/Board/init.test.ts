import { describe, expect, it } from "vitest";
import { initialGameState, initialPlayerState } from "./init";
import { Dynasty } from "./types";

describe("init player", () => {
  it("does not throw an error", () => {
    initialPlayerState(Dynasty.URN, []);
  });
});

describe("initialGameState", () => {
  it("does not throw an error", () => {
    initialGameState(4);
  });

  it("initializes with correct number of players", () => {
    let G = initialGameState(4);
    expect(Object.keys(G.players)).toHaveLength(4);

    G = initialGameState(3);
    expect(Object.keys(G.players)).toHaveLength(3);
  });
});
