import { projectFromSsh, idProviderFromSsh } from "./functions";
import { auth } from "./config.json";
import store from "./store/index";
import { use } from "react";

const TOKEN_EXPIRY_BUFFER = 60; // seconds before actual expiry to refresh

/**
 * Refreshes the GitLab access token if it is expiring soon.
 * @param {string} idProvider - The ID provider, either "renku" or "gitlab".
 * @returns {Promise<string>} - A promise that resolves to the refreshed access token.
 * @throws {Error} - Throws an error if the token refresh fails.
 */
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
    console.error("Error fetching Gitlab project members:", err);
    return [];
  }
}

/**
 * Checks if the user is a maintainer of a GitLab project.
 * 
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {Object} user - The user object containing user information.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
 */
async function isGitlabProjectMaintainer(ssh, user) {
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
    const response = await fetch(`${host}/api/v4/projects/${projectId}/members/all/${user.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return false; // Case private repo or user not found
    }

    const member = await response.json();
    return member.access_level >= 30; // Gitlab Developer access level
  } catch (err) {
    console.error("Error fetching Gitlab project member:", err);
    return false;
  }
}

/**
 * Fetches project members from a GitHub project using its SSH URL.
 * @param {string} ssh - The SSH URL of the Git project.
 * @returns {Promise<Array>} - A promise that resolves to an array of project members.
 * @throws {Error} - Throws an error if the GitHub access token is not available or if the API request fails.
 */
async function projectMembersFromGithub(ssh) {
  const { group, repository } = projectFromSsh(ssh);

  const accessToken = store.getState().auth.github?.accessToken;
  if (!accessToken) {
    throw new Error("GitHub access token is not available");
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${group}/${repository}/collaborators`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const collaborators = await response.json();
    return collaborators;
  } catch (err) {
    console.error("Error fetching Github project collaborators:", err);
    return [];
  }
}

/**
 * Checks if the user is a maintainer of a GitHub project.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {Object} user - The user object containing user information.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
 */
async function isGithubProjectMaintainer(ssh, user) {
  const { group, repository } = projectFromSsh(ssh);

  const accessToken = store.getState().auth.github?.accessToken;
  if (!accessToken) {
    throw new Error("GitHub access token is not available");
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${group}/${repository}/collaborators/${user.login}/permission`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      return false; // Case private repo or user not found
    }
    const permission = await response.json();
    return permission.user?.permissions?.push === true; // GitHub Write access level
  } catch (err) {
    console.error("Error fetching Github project collaborator permission:", err);
    return false;
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
    return await isGitlabProjectMaintainer(ssh, user);
  } else if (idProvider === "github") {
    return await isGithubProjectMaintainer(ssh, user);
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