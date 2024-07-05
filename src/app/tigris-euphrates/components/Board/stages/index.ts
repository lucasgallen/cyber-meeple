import { TEMPLE } from "@teboard/constants";
import {
  CivilizationTile,
  PlayerState,
  TigrisEuphratesState,
  isCivilizationTile,
} from "@teboard/types";
import { SpaceCoord } from "../space/types";
import { getAdjacentSpaces } from "../space";

export function wageTempleTiles({
  G,
  coordOfPlacedLeader,
  currentPlayer,
  numberOfTiles,
  isOpposing,
}: {
  G: TigrisEuphratesState;
  coordOfPlacedLeader: SpaceCoord;
  currentPlayer: string;
  numberOfTiles: number;
  isOpposing: boolean;
}) {
  const player = G.players[currentPlayer];
  const templeTiles: CivilizationTile[] = player.tiles
    .filter(isCivilizationTile)
    .filter(({ civType }) => civType === TEMPLE)
    .splice(0, numberOfTiles);

  if (templeTiles.length > numberOfTiles)
    throw new Error("not enough temple tiles");

  const adjacentTemples = getAdjacentSpaces(coordOfPlacedLeader, G.spaces)
    .map((space) => space.tile)
    .filter(isCivilizationTile)
    .filter(({ civType }) => civType === TEMPLE);

  if (isOpposing) {
    G.revolt.defender = currentPlayer;
  } else {
    G.revolt.attacker = currentPlayer;
  }
  player.revolt.wagedTiles = [...templeTiles];
  player.revolt.attackValue = templeTiles.length + adjacentTemples.length;
  player.revolt.leaderCoord = coordOfPlacedLeader;

  if (!isOpposing) return;

  resolveAttack({ G });
}

export function resolveAttack({ G }: { G: TigrisEuphratesState }) {
  const attacker = G.players[G.revolt.attacker];
  const defender = G.players[G.revolt.defender];

  const attackerStrength = attacker.revolt.attackValue;
  const defenderStrength = defender.revolt.attackValue;

  if (attackerStrength <= defenderStrength) {
    awardPlayerInRevolt({ G, winner: defender, loser: attacker });
  } else {
    awardPlayerInRevolt({ G, winner: attacker, loser: defender });
  }

  G.revolt.attacker = "";
  G.revolt.defender = "";
}

export function awardPlayerInRevolt({
  G,
  winner,
  loser,
}: {
  G: TigrisEuphratesState;
  winner: PlayerState;
  loser: PlayerState;
}) {
  const loserLeaderCoord = loser.revolt.leaderCoord;
  const loserLeaderSpace = G.spaces[loserLeaderCoord[0]][loserLeaderCoord[1]];
  const loserLeader = loserLeaderSpace.leader;
  loserLeaderSpace.leader = null;
  loser.leaders.push(loserLeader);

  winner.points.temple = +1;

  winner.revolt.wagedTiles = [];
  winner.revolt.attackValue = 0;
  loser.revolt.wagedTiles = [];
  loser.revolt.attackValue = 0;
}

export function unityConflict() {}
