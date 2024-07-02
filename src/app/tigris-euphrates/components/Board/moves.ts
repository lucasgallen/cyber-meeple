import { Ctx, DefaultPluginAPIs } from "boardgame.io";
import { v4 as uuidv4 } from "uuid";
import {
  CivType,
  CivilizationTile,
  Kingdom,
  Leader,
  Monument,
  Space,
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
import { SETTLEMENT } from "./constants";

// TODO: validate move in UI
// - does not join three or more kingdoms
// - river tiles and spaces must match
export function placeCivilizationTile(
  {
    G,
    events,
  }: Record<string, unknown> &
    DefaultPluginAPIs & { ctx: Ctx; G: TigrisEuphratesState },
  tile: CivilizationTile,
  toSpace: [number, number],
) {
  const boardSpace = getSpace(toSpace, G.spaces);
  boardSpace.tile = tile;

  // if the tile joins two kingdoms, then put a unification tile on it and resolve the conflict in the UnificationConflict Stage
  const adjacentSpaces = getAdjacentSpaces(toSpace, G.spaces);
  const adjacentKingdomIds = getAdjacentKingdomIds(adjacentSpaces, G.kingdoms);
  if (adjacentKingdomIds.length > 1) {
    events.setActivePlayers({
      currentPlayer: "UnificationConflict",
    });

    return;
  }

  // if the tile matches the civilization of a leader in the kingdom, then give one victory point
  // of that color to the leader's player
  const kingdom = getKingdomFromSpace(boardSpace.id, G.kingdoms);
  if (kingdom !== undefined) giveVictoryPointForLeader(kingdom, tile, G);
}

export function formMonument(
  _: Record<string, unknown> & DefaultPluginAPIs & { ctx: Ctx },
  spaces: [Space, Space, Space, Space],
  monument: Monument,
) {
  // if the tile forms a square of four like-colored tiles, the player may form a monument
  spaces.forEach((space) => {
    space.monument = monument;
  });
}

function getAdjacentKingdomIds(spaces: Space[], kingdoms: Kingdom[]) {
  return spaces
    .map((toSpace) => {
      const kingdom = getKingdomFromSpace(toSpace.id, kingdoms);
      return kingdom?.id;
    })
    .reduce((current: string[], kingdomId) => {
      if (kingdomId === undefined) return current;
      if (current.some((id) => id === kingdomId)) return current;
      return [...current, kingdomId];
    }, []);
}

function giveVictoryPointForLeader(
  kingdom: Kingdom,
  tile: CivilizationTile,
  G: TigrisEuphratesState,
) {
  let playerId: string | undefined;
  const kingdomLeaders: Leader[] = getSpacesFromKingdom(kingdom, G.spaces)
    .map(({ leader }) => leader)
    .filter(isLeader);
  const leaderMatchingCiv =
    kingdomLeaders.find((leader) => {
      return leader.civType === tile.civType;
    }) ??
    // else if the kingdom has a black leader, give the point to the black leader's player
    kingdomLeaders.find((leader) => {
      return leader.civType === SETTLEMENT;
    });

  Object.keys(G.players).forEach((key) => {
    if (G.players[key].dynasty === leaderMatchingCiv?.dynasty) {
      playerId = key;
      return;
    }
  });

  if (playerId) G.players[playerId].points[tile.civType] += 1;
  // else no points given
}

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
