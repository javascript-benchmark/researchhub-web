import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
//import * as shims from "./shims";
import * as types from "./types";
import * as actions from "./actions";
import * as discussionShim from "../discussion/shims";
import * as paperShim from "../paper/shims";
import { handleCatch } from "../utils";
import { logFetchError } from "~/config/utils/misc";
import { MessageActions } from "~/redux/message";

export const AuthorActions = {
  getAuthor: ({ authorId }) => {
    return (dispatch) => {
      return fetch(API.AUTHOR({ authorId }), API.GET_CONFIG())
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((resp) => {
          return dispatch({
            type: types.GET_AUTHOR,
            payload: {
              ...resp,
              doneFetching: true,
            },
          });
        });
    };
  },

  getAuthoredPapers: ({ authorId, page = 1 }) => {
    return async (dispatch) => {
      const response = await fetch(
        API.AUTHORED_PAPER({ authorId, page }),
        API.GET_CONFIG()
      ).catch(handleCatch);

      let action = actions.getAuthoredPapersFailure();
      if (response.ok) {
        const body = await response.json();
        let results = {
          count: body.count,
          has_next: body.has_next,
          next: body.next,
          papers: body.results,
        };
        action = actions.getAuthoredPapersSuccess(results);
      } else {
        logFetchError(response);
      }
      return dispatch(action);
    };
  },

  getUserDiscussions: ({ authorId, page = 1 }) => {
    return async (dispatch) => {
      const response = await fetch(
        API.USER_DISCUSSION({ authorId, page }),
        API.GET_CONFIG()
      ).catch(handleCatch);

      let action = actions.getUserDiscussionsFailure();
      if (response.ok) {
        const body = await response.json();
        let discussions = [];

        for (let i = 0; i < body.results.length; i++) {
          discussions.push(discussionShim.thread(body.results[i]));
        }
        let results = {
          count: body.count,
          has_next: body.has_next,
          next: body.next,
          discussions,
        };
        action = actions.getUserDiscussionsSuccess(results);
      } else {
        logFetchError(response);
      }
      return dispatch(action);
    };
  },

  getUserContributions: ({ authorId, next = null }) => {
    return async (dispatch, getState) => {
      dispatch({
        contributionsDoneFetching: false,
        type: types.GET_USER_CONTRIBUTIONS_PENDING,
      });

      let ENDPOINT = next
        ? next
        : API.USER_CONTRIBUTION({
            authorId,
          });

      const response = await fetch(ENDPOINT, API.GET_CONFIG()).catch(
        handleCatch
      );

      let action = actions.getUserContributionsFailure();
      if (response.ok) {
        const body = await response.json();

        let contributions = next
          ? [...getState().author.userContributions.contributions]
          : [];
        for (let i = 0; i < body.results.length; i++) {
          let contribution = body.results[i];
          if (contribution.type === "reply") {
            let formatted = discussionShim.transformReply(body.results[i]);
            // formatted.type = contribution.type;
            contributions.push(formatted);
          } else if (contribution.type === "comment") {
            let formatted = discussionShim.transformComment(body.results[i]);
            // formatted.type = contribution.type;
            contributions.push(formatted);
          } else if (contribution.type === "paper") {
            let formatted = paperShim.paper(body.results[i]);
            // formatted.type = contribution.type;
            contributions.push(formatted);
          } else {
            let formatted = paperShim.paper(body.results[i]);
            // formatted.type = contribution.type;
            contributions.push(formatted);
          }
        }
        let results = {
          count: body.count,
          has_next: body.has_next,
          next: body.next,
          offsets: body.offsets,
          contributions,
        };
        action = actions.getUserContributionsSuccess(results);
      } else {
        logFetchError(response);
      }
      return dispatch(action);
    };
  },

  getNextUserContributions: ({ authorId }) => {
    return async (dispatch) => {
      dispatch({
        contributionsDoneFetching: false,
        type: types.GET_USER_CONTRIBUTIONS_PENDING,
      });
    };
  },

  saveAuthorChanges: ({ changes, authorId, file }) => {
    return (dispatch) => {
      let config = API.PATCH_CONFIG(changes);
      if (file) {
        config = API.PATCH_FILE_CONFIG(changes);
      }
      return fetch(API.AUTHOR({ authorId }), config)
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((resp) => {
          dispatch(MessageActions.setMessage("Profile updated"));
          dispatch(MessageActions.showMessage({ show: true }));

          return dispatch({
            type: types.SAVE_AUTHOR_CHANGES,
            payload: {
              ...resp,
              doneFetching: true,
            },
          });
        })
        .catch((err) => {
          handleCatch(err, dispatch);
        });
    };
  },
  updateAuthorByKey: ({ key, value }) => {
    return (dispatch, getState) => {
      let updatedState = { ...getState().author };
      updatedState[key] = value;
      return dispatch({
        type: types.UPDATE_AUTHOR_BY_KEY,
        payload: {
          ...updatedState,
        },
      });
    };
  },
  updateAuthor: (newState) => {
    return (dispatch) => {
      return dispatch({
        type: types.UPDATE_AUTHOR,
        payload: {
          ...newState,
        },
      });
    };
  },
};
