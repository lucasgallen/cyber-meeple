import { describe, expect, it } from "vitest";
import { Space, SpaceId } from "@teboard/space/types";
import { getSpacesFromKingdom, makeNewKingdoms } from ".";
import { initialGameState } from "@teboard/init";
import { FARM } from "@teboard/constants";
import { Kingdom } from "./types";
import { Dynasty, Leader } from "@teboard/types";

describe("getSpacesFromKingdom", () => {
  it("returns the correct spaces", () => {
    const G = initialGameState(3);
    const leader: Leader = { dynasty: Dynasty.BULL, civType: FARM };
    const kingdoms: Kingdom[] = [{ id: "two", spaces: ["0,4", "0,5"] }];
    G.kingdoms = kingdoms;
    const spaces: Space[] = getSpacesFromKingdom(kingdoms[0], G.spaces);
    G.spaces[0][4].leader = leader;

    const expectedSpaces: Space[] = [
      {
        id: "0,4",
        tile: null,
        leader,
        river: false,
        treasure: false,
        monument: null,
      },
      {
        id: "0,5",
        tile: null,
        leader: null,
        river: true,
        treasure: false,
        monument: null,
      },
    ];

    expect(spaces).toHaveLength(2);
    expect(spaces).toMatchObject(expectedSpaces);
  });
});

describe("makeNewKingdoms", () => {
  it("keeps a kingdom intact when still connected", () => {
    const smallCornerMissing: Kingdom = {
      id: "smallCorner",
      spaces: ["0,0", "1,0", "2,0", "0,1", "1,1", "2,1", "0,2", "1,2"],
    };
    const missingCenter: Kingdom = {
      id: "missingCenter",
      spaces: ["0,0", "1,0", "2,0", "0,1", "2,1", "0,2", "1,2", "2,2"],
    };
    const lShape: Kingdom = {
      id: "lShape",
      spaces: ["0,0", "1,0", "2,0", "1,0", "2,0"],
    };

    [smallCornerMissing, missingCenter, lShape].forEach((originalKingdom) => {
      const newKingdoms = makeNewKingdoms(originalKingdom);
      expect(newKingdoms).toHaveLength(1);
      expect(newKingdoms[0].spaces.sort()).toStrictEqual(
        originalKingdom.spaces.sort(),
      );
    });
  });

  it("makes two new kingdoms when split", () => {
    const examples: Kingdom[] = [
      { id: "zigzag", spaces: ["0,0", "0,1", "2,1", "2,2"] },
      { id: "snake", spaces: ["0,0", "0,1", "1,2", "2,0", "2,1", "2,2"] },
      { id: "topBottom", spaces: ["0,0", "0,1", "0,2", "2,0", "2,1", "2,2"] },
      { id: "singleton", spaces: ["0,0", "1,1", "1,2", "2,1", "2,2"] },
    ];

    examples.forEach((originalKingdom) => {
      const newKingdoms = makeNewKingdoms(originalKingdom);
      expect(newKingdoms).toHaveLength(2);

      if (originalKingdom.id === "zigzag") {
        const newSpaces = [newKingdoms[0].spaces, newKingdoms[1].spaces];
        expect(newSpaces).toStrictEqual([
          ["0,0", "0,1"],
          ["2,1", "2,2"],
        ]);
      }

      if (originalKingdom.id === "snake") {
        const newSpaces = [
          newKingdoms[0].spaces.sort(),
          newKingdoms[1].spaces.sort(),
        ];
        expect(newSpaces).toStrictEqual([
          ["0,0", "0,1"],
          ["1,2", "2,0", "2,1", "2,2"].sort(),
        ]);
      }

      if (originalKingdom.id === "topBottom") {
        const newSpaces = [
          newKingdoms[0].spaces.sort(),
          newKingdoms[1].spaces.sort(),
        ];
        expect(newSpaces).toStrictEqual([
          ["0,0", "0,1", "0,2"].sort(),
          ["2,0", "2,1", "2,2"].sort(),
        ]);
      }

      if (originalKingdom.id === "singleton") {
        const newSpaces = [
          newKingdoms[0].spaces.sort(),
          newKingdoms[1].spaces.sort(),
        ];
        expect(newSpaces).toStrictEqual([
          ["0,0"],
          ["1,1", "1,2", "2,1", "2,2"].sort(),
        ]);
      }
    });
  });

  it("makes three new kingdoms", () => {
    const examples: Kingdom[] = [
      { id: "starship", spaces: ["2,0", "1,1", "2,2"] },
      { id: "football", spaces: ["0,0", "0,2", "2,0", "2,1", "2,2"] },
      { id: "diagonal", spaces: ["0,0", "1,1", "2,2"] },
    ];

    examples.forEach((originalKingdom) => {
      const newKingdoms = makeNewKingdoms(originalKingdom);
      expect(newKingdoms).toHaveLength(3);

      if (originalKingdom.id === "starship") {
        const newSpaces = [
          newKingdoms[0].spaces,
          newKingdoms[1].spaces,
          newKingdoms[2].spaces,
        ];
        expect(newSpaces).toStrictEqual([["2,0"], ["1,1"], ["2,2"]]);
      }

      if (originalKingdom.id === "football") {
        const newSpaces = [
          newKingdoms[0].spaces.sort(),
          newKingdoms[1].spaces.sort(),
          newKingdoms[2].spaces.sort(),
        ];
        expect(newSpaces).toStrictEqual([
          ["0,0"],
          ["0,2"],
          ["2,1", "2,0", "2,2"].sort(),
        ]);
      }

      if (originalKingdom.id === "diagonal") {
        const newSpaces = [
          newKingdoms[0].spaces,
          newKingdoms[1].spaces,
          newKingdoms[2].spaces,
        ];
        expect(newSpaces).toStrictEqual([["0,0"], ["1,1"], ["2,2"]]);
      }
    });
  });

  it("makes four new kingdoms", () => {
    const originalKingdom: Kingdom = {
      id: "cross",
      spaces: ["0,1", "1,0", "1,2", "2,1"],
    };

    const newKingdoms = makeNewKingdoms(originalKingdom);
    expect(newKingdoms).toHaveLength(4);

    const newSpaces: SpaceId[][] = newKingdoms.map(({ spaces }) => spaces);
    expect(newSpaces).toStrictEqual([["0,1"], ["1,0"], ["1,2"], ["2,1"]]);
  });
});
