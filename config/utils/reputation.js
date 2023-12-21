import { doesNotExist } from "./nullchecks";
import { getCurrentUserLegacy } from "./user";
import { getNestedValue } from "./misc";
import { userVoteToConstant } from "~/config/constants";

export function currentUserHasMinimumReputation(stateObject, minimum) {
  let reputation = getCurrentUserReputation(stateObject);
  return reputation >= minimum;
}

export const checkVoteTypeChanged = (prev, next) => {
  const prevVoteType = getNestedValue(prev, ["userVote", "voteType"]);
  const nextVoteType = getNestedValue(next, ["userVote", "voteType"]);
  if (prevVoteType !== nextVoteType) {
    return nextVoteType;
  }
};

export function getCurrentUserReputation(storeState) {
  const currentUser = getCurrentUserLegacy(storeState);
  if (!doesNotExist(currentUser)) {
    return currentUser.reputation;
  }
  return null;
}

export function getMinimumReputation(storeState, key) {
  return (
    storeState.permission.success &&
    storeState.permission.data[key].minimumReputation
  );
}

export function getVoteType(vote) {
  return vote && vote.voteType;
}
