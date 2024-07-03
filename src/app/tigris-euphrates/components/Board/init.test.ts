import { describe, it } from "vitest";
import { initialGameState, initialPlayerState } from "./init";
import { Dynasty } from "./types";

describe("init player", () => {
  it("does not throw an error", () => {
    initialPlayerState(Dynasty.URN, []);
  });
});

describe("initialGameState", () => {
  it("does not throw an error", () => {
    initialGameState(3);
    initialGameState(4);
  });
});
