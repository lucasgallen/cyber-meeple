import { v4 as uuidv4 } from "uuid";

import { getSpace, getSpaceId } from "../space";
import { Kingdom } from "./types";
import {
  Row,
  Space,
  SpaceCoord,
  SpaceId,
  isSpace,
} from "@/app/tigris-euphrates/components/Board/space/types";

export function getSpacesFromKingdom(
  kingdom: Kingdom,
  rows: readonly Row[],
): Space[] {
  return kingdom.spaces
    .map((space) => {
      const coord = space.split(",").map((spaceStr) => +spaceStr) as [
        number,
        number,
      ];
      return getSpace(coord, rows);
    })
    .filter(isSpace);
}

export function makeNewKingdoms(originalKingdom: Kingdom): Kingdom[] {
  let uncheckedSpaces = [...originalKingdom.spaces];
  let newKingdoms: Kingdom[] = [];
  findKingdoms();

  function findKingdoms() {
    if (uncheckedSpaces.length < 1) return;

    const newKingdom: Kingdom = {
      id: uuidv4(),
      spaces: findUncheckedNeighbors(uncheckedSpaces[0]),
    };
    newKingdoms.push(newKingdom);
    findKingdoms();
  }

  function findUncheckedNeighbors(spaceId: SpaceId): SpaceId[] {
    if (uncheckedSpaces.length < 1) return [];

    const space = spaceId.split(",").map((space) => +space);
    const deltas = [1, -1];
    const uncheckedNeighborIds: SpaceId[] = [];
    const neighborIdsInKingdom: SpaceId[] = [spaceId];

    const uncheckedSpaceIndx = uncheckedSpaces.indexOf(spaceId);
    uncheckedSpaces = [
      ...uncheckedSpaces.slice(0, uncheckedSpaceIndx),
      ...uncheckedSpaces.slice(uncheckedSpaceIndx + 1, uncheckedSpaces.length),
    ];

    deltas.forEach((delta) => {
      const neighbor: SpaceCoord = [space[0] + delta, space[1]];
      const neighborString: SpaceId = getSpaceId(neighbor);
      if (uncheckedSpaces.includes(neighborString))
        uncheckedNeighborIds.push(neighborString);
    });
    deltas.forEach((delta) => {
      const neighbor: SpaceCoord = [space[0], space[1] + delta];
      const neighborString: SpaceId = getSpaceId(neighbor);
      if (uncheckedSpaces.includes(neighborString))
        uncheckedNeighborIds.push(neighborString);
    });

    uncheckedNeighborIds.forEach((neighbor) => {
      neighborIdsInKingdom.push(...findUncheckedNeighbors(neighbor));
    });

    return neighborIdsInKingdom;
  }

  return newKingdoms;
}
