import { describe, expect, it } from "vitest";
import { initialSpaces } from "./space";
import { Space, Spaces } from "./types";
import { RIVER_SPACES, TEMPLE_TREASURE_SPACES } from "./constants";

describe("initSpaces", () => {
  it("does not throw an error", () => {
    initialSpaces();
  });

  it("has correct amount of the different space types", () => {
    const spaces: Spaces = initialSpaces();
    const flatSpaces: Space[] = spaces.flat();
    const riverSpaces = flatSpaces.filter((space) => space.river);
    const treasureSpaces = flatSpaces.filter((space) => space.treasure);

    expect(riverSpaces.length).toEqual(RIVER_SPACES.length);
    expect(treasureSpaces.length).toEqual(TEMPLE_TREASURE_SPACES.length);
  });
});
