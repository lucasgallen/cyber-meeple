import { Ctx, DefaultPluginAPIs } from "boardgame.io";
import { v4 as uuidv4 } from "uuid";
import {
  CivType,
  Kingdom,
  Leader,
  Row,
  SpaceId,
  TigrisEuphratesState,
  isKingdom,
  isLeader,
} from "./types";
import {
  getAdjacentSpaces,
  getKingdomFromSpace,
  getSpace,
  getSpaceId,
  isSpaceEmpty,
} from "./space";
import { getSpacesFromKingdom } from "./kingdom";
import { EventsAPI } from "boardgame.io/dist/types/src/plugins/plugin-events";

// TODO: assumes the placement is legal -- UI needs to validate the move
export function moveLeader(
  {
    G,
    events,
  }: Record<string, unknown> &
    DefaultPluginAPIs & { ctx: Ctx; G: TigrisEuphratesState },
  leader: Leader,
  space: { from?: [number, number]; to: [number, number] },
) {
  // select leader from the board or from supply
  // place leader into any empty, non-river space that does not join two kingdoms
  // a leader cannot separate two kingdoms and then join the same two kingdoms

  const leaderCiv = leader.civType;
  const toSpace = getSpace(space.to, G.spaces);
  const adjacentSpaces = getAdjacentSpaces(space.to, G.spaces);
  let spaceWithKingdom: SpaceId | undefined;

  // if space.from is defined, remove leader
  if (space.from !== undefined) {
    getSpace(space.from, G.spaces).leader = null;
  }

  // place leader on space.to
  toSpace.leader = leader;

  // search adjacent spaces for a kingdom (there can only be one)
  //  TODO: UI must guarentee this is valid
  const adjacentKingdom = adjacentSpaces
    .map(({ id }) => {
      const kingdom = getKingdomFromSpace(id, G.kingdoms);
      if (kingdom !== undefined) spaceWithKingdom = id;

      return kingdom;
    })
    .find(isKingdom);

  // check adjacent spaces for red temple and other tiles
  const adjacentNonEmptySpaces = adjacentSpaces.filter((space) => {
    const isNonEmpty = !isSpaceEmpty(space);
    const isNotInKingdom = space.id !== spaceWithKingdom;
    return isNonEmpty && isNotInKingdom;
  });

  // create a new kingdom with other adjcent tiles
  if (adjacentKingdom === undefined) {
    G.kingdoms.push({
      id: uuidv4(),
      spaces: [
        getSpaceId(space.to),
        ...adjacentNonEmptySpaces.map(({ id }) => id),
      ],
    });
    // if they aren't in the same kingdom, then add them along with the leader to the kingdom
  } else {
    adjacentKingdom.spaces = [
      getSpaceId(space.to),
      ...adjacentKingdom.spaces,
      ...adjacentNonEmptySpaces.map(({ id }) => id),
    ];

    triggerAttackLeader(adjacentKingdom, leaderCiv, events, G);
  }
}

function triggerAttackLeader(
  kingdom: Kingdom,
  leaderCiv: CivType,
  events: EventsAPI,
  G: TigrisEuphratesState,
) {
  // if leader was added to a kingdom, search that kingdom for a leader that has the same leaderCiv
  // if that exists, get the dynasty of that opposing leader
  const opposingDynasty = getSpacesFromKingdom(kingdom, G.spaces)
    .map(({ leader }) => leader)
    .filter(isLeader)
    .find(({ civType }) => civType === leaderCiv)?.dynasty;
  if (opposingDynasty !== undefined) {
    let opposingPlayerId = "0";
    Object.keys(G.players).forEach((key) => {
      if (G.players[key].dynasty === opposingDynasty) {
        opposingPlayerId = key;
        return;
      }
    });

    events.setActivePlayers({
      currentPlayer: "AttackLeader",
      value: { [opposingPlayerId]: "AttackLeader" },
    });
  }
}
