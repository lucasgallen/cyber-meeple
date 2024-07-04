import { SpaceId, isSpaces } from "@teboard/space/types";

export type Kingdom = {
  id: string;
  spaces: SpaceId[];
};

export function isKingdom(kingdom: unknown): kingdom is Kingdom {
  if (kingdom === undefined) return false;
  const hasId = typeof (kingdom as Kingdom).id === "string";
  const hasSpaces = (kingdom as Kingdom).spaces !== undefined;

  return hasId && hasSpaces;
}
