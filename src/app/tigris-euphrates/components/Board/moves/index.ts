import { ActivePlayersArg } from "boardgame.io";
import { v4 as uuidv4 } from "uuid";
import {
  CivType,
  CivilizationTile,
  Leader,
  Monument,
  PlayerState,
  TigrisEuphratesState,
  Tile,
  isLeader,
} from "@teboard/types";
import {
  getAdjacentSpaces,
  getKingdomFromSpace,
  getSpace,
  getSpaceId,
  isSpaceEmpty,
} from "@teboard/space";
import {
  getSpacesFromKingdom,
  makeNewKingdoms,
  removeSpaceFromKingdom,
} from "@teboard/kingdom";
import { SETTLEMENT } from "@teboard/constants";
import { Space, SpaceCoord, SpaceId, isSpace } from "@teboard/space/types";
import { Kingdom, isKingdom } from "@teboard/kingdom/types";
import { updatedKingdoms } from "../helpers";

export function swapTiles({
  G,
  currentPlayer,
  endGame,
  shuffle,
  tileIndices,
}: {
  G: TigrisEuphratesState;
  currentPlayer: string;
  endGame: () => void;
  shuffle: <T>(deck: T[]) => T[];
  tileIndices: number[];
}) {
  if (G.tileBag.length < tileIndices.length) endGame();

  let playerTiles: Tile[] = [];

  // discard
  for (let i = 0; i < G.players[currentPlayer].tiles.length; i++) {
    if (!tileIndices.includes(i))
      playerTiles.push(G.players[currentPlayer].tiles[i]);
  }
  G.players[currentPlayer].tiles = playerTiles;

  // draw
  shuffle(G.tileBag);
  for (let i = 0; i < G.players[currentPlayer].tiles.length; i++) {
    giveTileToPlayer(G, currentPlayer);
  }
}

// Assumes tileBag is shuffled
function giveTileToPlayer(state: TigrisEuphratesState, playerId: string) {
  if (state.tileBag.length < 1) return;
  if (state.players[playerId] === undefined) return;

  const tile = state.tileBag.pop();
  state.players[playerId]!.tiles.push(tile!);
}

// place catastrophe tile on any empty space that does not have treasure or a monument
// If this leaves a leader no longer next to a red temple, move the leader off the board.
export function placeCatastropheTile({
  G,
  toSpace,
  currentPlayer,
  tileIndex,
}: {
  G: TigrisEuphratesState;
  toSpace: SpaceCoord;
  currentPlayer: string;
  tileIndex: number;
}) {
  const player: PlayerState = G.players[currentPlayer];
  const catastropheTile = player.tiles[tileIndex];
  player.tiles = [
    ...player.tiles.slice(0, tileIndex),
    ...player.tiles.slice(tileIndex + 1),
  ];
  G.spaces[toSpace[0]][toSpace[1]].tile = catastropheTile;
  const toSpaceId = G.spaces[toSpace[0]][toSpace[1]].id;
  const targetKingdom = getKingdomFromSpace(toSpaceId, G.kingdoms);
  if (targetKingdom === undefined) return;

  const spaceKingdomIndex = targetKingdom.spaces.findIndex(
    (spaceId: SpaceId) => spaceId === toSpaceId,
  );
  targetKingdom.spaces = [
    ...targetKingdom.spaces.slice(0, spaceKingdomIndex),
    ...targetKingdom.spaces.slice(spaceKingdomIndex + 1),
  ];
  const targetKingdomIndex = G.kingdoms.findIndex(
    ({ id }) => id === targetKingdom.id,
  );
  const newKingdoms = makeNewKingdoms(targetKingdom);
  G.kingdoms = [
    ...G.kingdoms.slice(0, targetKingdomIndex),
    ...newKingdoms,
    ...G.kingdoms.slice(targetKingdomIndex + 1),
  ];
}

// TODO: validate move in UI
// - does not join three or more kingdoms
// - river tiles and spaces must match
export function placeCivilizationTile({
  G,
  setActivePlayers,
  tile,
  toSpace,
}: {
  G: TigrisEuphratesState;
  setActivePlayers: (arg: ActivePlayersArg) => void;
  tile: CivilizationTile;
  toSpace: SpaceCoord;
}) {
  const boardSpace = getSpace(toSpace, G.spaces);
  boardSpace.tile = tile;

  // if the tile joins two kingdoms, then put a unification tile on it and resolve the conflict in the UnificationConflict Stage
  const adjacentSpaces = getAdjacentSpaces(toSpace, G.spaces);
  const adjacentKingdomIds = getAdjacentKingdomIds(adjacentSpaces, G.kingdoms);
  if (adjacentKingdomIds.length > 1) {
    setActivePlayers({
      currentPlayer: "UnificationConflict",
    });

    return;
  } else if (adjacentKingdomIds.length === 0) {
    return;
  }

  // if the tile matches the civilization of a leader in the kingdom, then give one victory point
  // of that color to the leader's player
  const kingdom = G.kingdoms.find(({ id }) => id === adjacentKingdomIds[0]);
  if (!isKingdom(kingdom)) return;

  kingdom.spaces.push(boardSpace.id);
  giveVictoryPointForLeader(kingdom, tile, G);
}

export function formMonument({
  G,
  spaceCoords,
  monument,
}: {
  G: TigrisEuphratesState;
  spaceCoords: [SpaceCoord, SpaceCoord, SpaceCoord, SpaceCoord];
  monument: Monument;
}) {
  // if the tile forms a square of four like-colored tiles, the player may form a monument
  const spaces = spaceCoords
    .map((coord) => G.spaces[coord[0]][coord[1]])
    .filter(isSpace);

  spaces.forEach((space) => {
    space.monument = monument;
    if (space.tile !== null) space.tile.facedown = true;
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

export function moveLeaderToHand({
  G,
  fromSpace,
  currentPlayer,
}: {
  G: TigrisEuphratesState;
  fromSpace: SpaceCoord;
  currentPlayer: string;
}) {
  const player = G.players[currentPlayer];
  const boardSpace = getSpace(fromSpace, G.spaces);
  const leader = boardSpace.leader;
  const kingdom = getKingdomFromSpace(boardSpace.id, G.kingdoms);

  boardSpace.leader = null;
  player.leaders.push(leader);

  if (isKingdom(kingdom)) {
    removeSpaceFromKingdom(kingdom, boardSpace.id);
    G.kingdoms = updatedKingdoms({
      dirtyKingdom: kingdom,
      kingdoms: G.kingdoms,
    });
  }
}

export function moveLeaderFromHand({
  G,
  toSpace,
  leader,
  currentPlayer,
  setActivePlayers,
}: {
  G: TigrisEuphratesState;
  toSpace: SpaceCoord;
  leader: Leader;
  currentPlayer: string;
  setActivePlayers: (arg: ActivePlayersArg) => void;
}) {
  const player = G.players[currentPlayer];
  const adjacentSpaces = getAdjacentSpaces(toSpace, G.spaces);
  const boardSpace = getSpace(toSpace, G.spaces);
  let spaceIdWithKingdom = "";
  boardSpace.leader = leader;

  if (!isLeader(leader)) return;

  const leaderIndex = player.leaders.findIndex(
    ({ civType }) => civType === leader.civType,
  );
  player.leaders = [
    ...player.leaders.slice(0, leaderIndex),
    ...player.leaders.slice(leaderIndex + 1),
  ];

  const adjacentKingdom = adjacentSpaces
    .map(({ id }) => {
      const kingdom = getKingdomFromSpace(id, G.kingdoms);
      if (kingdom !== undefined) spaceIdWithKingdom = id;

      return kingdom;
    })
    .find(isKingdom);

  const adjacentNonEmptySpaces = adjacentSpaces.filter((space) => {
    const isNonEmpty = !isSpaceEmpty(space);
    const isNotInKingdom = space.id !== spaceIdWithKingdom;
    return isNonEmpty && isNotInKingdom;
  });

  if (adjacentKingdom !== undefined) {
    triggerAttackLeader(adjacentKingdom, leader.civType, setActivePlayers, G);
    return;
  }

  G.kingdoms.push({
    id: uuidv4(),
    spaces: [
      getSpaceId(toSpace),
      ...adjacentNonEmptySpaces.map(({ id }) => id),
    ],
  });
}

export function moveLeaderOnBoard({
  G,
  space,
  leader,
  setActivePlayers,
}: {
  G: TigrisEuphratesState;
  space: { from: SpaceCoord; to: SpaceCoord };
  leader: Leader;
  setActivePlayers: (arg: ActivePlayersArg) => void;
}) {
  const adjacentSpaces = getAdjacentSpaces(space.to, G.spaces);
  const boardSpaceTo = getSpace(space.to, G.spaces);
  const boardSpaceFrom = getSpace(space.from, G.spaces);
  let spaceIdWithKingdom = "";
  boardSpaceTo.leader = leader;

  if (!isLeader(leader)) return;

  const kingdom = getKingdomFromSpace(boardSpaceFrom.id, G.kingdoms);

  if (isKingdom(kingdom)) {
    removeSpaceFromKingdom(kingdom, boardSpaceFrom.id);
    G.kingdoms = updatedKingdoms({
      dirtyKingdom: kingdom,
      kingdoms: G.kingdoms,
    });
  }

  const adjacentKingdom = adjacentSpaces
    .map(({ id }) => {
      const kingdom = getKingdomFromSpace(id, G.kingdoms);
      if (kingdom !== undefined) spaceIdWithKingdom = id;

      return kingdom;
    })
    .find(isKingdom);

  const adjacentNonEmptySpaces = adjacentSpaces.filter((space) => {
    const isNonEmpty = !isSpaceEmpty(space);
    const isNotInKingdom = space.id !== spaceIdWithKingdom;
    return isNonEmpty && isNotInKingdom;
  });

  if (adjacentKingdom !== undefined) {
    triggerAttackLeader(adjacentKingdom, leader.civType, setActivePlayers, G);
    return;
  }

  if (adjacentNonEmptySpaces.length > 0) {
    G.kingdoms.push({
      id: uuidv4(),
      spaces: [
        getSpaceId(space.to),
        ...adjacentNonEmptySpaces.map(({ id }) => id),
      ],
    });
  }
}

function triggerAttackLeader(
  kingdom: Kingdom,
  leaderCiv: CivType,
  setActivePlayers: (arg: ActivePlayersArg) => void,
  G: TigrisEuphratesState,
) {
  // if leader was added to a kingdom, search that kingdom for a leader that has the same leaderCiv
  // if that exists, get the dynasty of that opposing leader
  const opposingDynasty = getSpacesFromKingdom(kingdom, G.spaces)
    .map(({ leader }) => leader)
    .filter(isLeader)
    .find(({ civType }) => civType === leaderCiv)?.dynasty;
  if (opposingDynasty === undefined) return;

  let opposingPlayerId = "";
  Object.keys(G.players).forEach((key) => {
    if (G.players[key].dynasty === opposingDynasty) {
      opposingPlayerId = key;
      return;
    }
  });

  setActivePlayers({
    currentPlayer: "AttackLeader",
    next: {
      value: { [opposingPlayerId]: "DefendLeader" },
    },
  });
}
