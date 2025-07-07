import { projectFromSsh, idProviderFromSsh } from "./functions";
import { auth } from "./config.json";
import store from "./store/index";
import { get } from "lodash";

const TOKEN_EXPIRY_BUFFER = 60; // seconds before actual expiry to refresh

async function refreshGitlabAccessToken(idProvider) {
  const state = store.getState();
  const { accessToken, refreshToken, expiresIn, tokenFetchedAt } = state.auth[idProvider] || {};

  const now = Math.floor(Date.now() / 1000);
  const isExpiringSoon =
    accessToken &&
    refreshToken &&
    expiresIn &&
    tokenFetchedAt &&
    now >= tokenFetchedAt + expiresIn - TOKEN_EXPIRY_BUFFER;

  if (!isExpiringSoon) {
    return accessToken; // no need to refresh
  }

  const host = idProvider === "renku" ? "https://gitlab.renkulab.io" : "https://gitlab.com";
  const clientId = auth[idProvider].clientId;
  const redirectUri = auth[idProvider].redirectUri;

  const response = await fetch(`${host}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();

  const updatedToken = {
    user: auth[idProvider].user || null,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };

  const actionType = idProvider === "renku" ? "SET_AUTH_RENKU" : "SET_AUTH_GITLAB";
  store.dispatch({ type: actionType, payload: updatedToken });

  return updatedToken.accessToken;
}

/**
 * Fetches project members from a GitLab project using its SSH URL.
 * 
 * @param {string} ssh - The SSH URL of the Git project.
 * @returns {Promise<Array>} - A promise that resolves to an array of project members.
 */
async function projectMembersFromGitlab(ssh) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);

  let host = null;
  if (idProvider === "renku") {
    host = "https://gitlab.renkulab.io";
  } else if (idProvider === "gitlab") {
    host = "https://gitlab.com";
  } else {
    throw new Error("Unsupported ID provider. Only 'renku' and 'gitlab' are supported.");
  }

  try {
    const accessToken = await refreshGitlabAccessToken(idProvider);
    const projectId = encodeURIComponent(`${group}/${repository}`);
    const response = await fetch(`${host}/api/v4/projects/${projectId}/members/all`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status}`);
    }

    const members = await response.json();
    return members;
  } catch (err) {
    console.error("Error fetching project members:", err);
    throw err;
  }
}

/** 
 * Checks if the authenticated user is a maintainer of the project.
 * @param {string} ssh - The SSH URL of the Git project.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
 */
export async function isGitProjectMaintainer(ssh) {
  // get user for this dataset
  const user = getGitUser(ssh);
  if (!user) {
    return false;
  }
  var idProvider = idProviderFromSsh(ssh);
  if (idProvider === "renku" || idProvider === "gitlab") {
    const members = await projectMembersFromGitlab(ssh);
    //console.debug("Members:", members);
    return members.some(member => member.id === user.id && member.access_level >= 30); // Gitlab Developper access level
  } else if (idProvider === "github") {
    // TODO
    return false;
  }
  throw new Error("Unsupported ID provider: " + idProvider);
}

/**
 * Gets the user information from the authentication object based on the SSH URL.
 * @param {string} ssh - The SSH URL of the Git project.
 * @returns {Object|null} - The user object if found, otherwise null.
 */
export function getGitUser(ssh) {
  // get user for this dataset
  var idProvider = idProviderFromSsh(ssh);
  const authState = store.getState().auth;
  if (idProvider === "renku" && authState?.renku?.user) {
    return authState.renku.user;
  }
  if (idProvider === "gitlab" && authState?.gitlab?.user) {
    return authState.gitlab.user;
  }
  if (idProvider === "github" && authState?.github?.user) {
    return authState.github.user;
  }
  return null;
};