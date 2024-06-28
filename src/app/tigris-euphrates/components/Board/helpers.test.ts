import { describe, expect, it } from "vitest";
import { Kingdom, SpaceId } from "./types";
import { makeNewKingdoms } from "./helpers";

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
