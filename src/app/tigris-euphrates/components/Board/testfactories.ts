import { TEMPLE } from "./constants";
import { CivType, CivilizationTile, Dynasty, Leader } from "./types";

export function makeTempleTile(): CivilizationTile {
  return { civType: TEMPLE, facedown: false, river: false };
}

export function makeLeader(
  dynasty: Dynasty,
  civType: CivType = TEMPLE,
): Leader {
  return { dynasty, civType };
}
