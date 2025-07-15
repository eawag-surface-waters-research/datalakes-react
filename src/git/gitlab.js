import { projectFromSsh, idProviderFromSsh } from "../functions";
import { auth } from "../config.json";
import store from "../store/index";

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

  const host = idProviderHost(idProvider);
  const clientId = auth[idProvider].clientId;
  const redirectUri = auth[idProvider].redirectUri || window.location.origin + `/${idProvider}`;

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

function idProviderHost(idProvider) {
  if (idProvider === "renku") {
    return "https://gitlab.renkulab.io";
  } else if (idProvider === "gitlab") {
    return "https://gitlab.com";
  } else if (idProvider === "github") {
    return "https://api.github.com";
  } else {
    throw new Error("Unsupported ID provider. Only 'renku', 'gitlab', and 'github' are supported.");
  }
}

/**
 * Fetches project members from a GitLab project using its SSH URL.
 * 
 * @param {string} ssh - The SSH URL of the Git project.
 * @returns {Promise<Array>} - A promise that resolves to an array of project members.
 */
export async function projectMembersFromGitlab(ssh) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);
  const host = idProviderHost(idProvider);

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
export async function isGitlabProjectMaintainer(ssh, user) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);
  const host = idProviderHost(idProvider);

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
 * Applies labels to a GitLab issue.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} issue_id - The ID of the issue to apply labels to.
 * @param {string|Array} labels - The label(s) to apply to the issue
 * @returns {Promise<void>} - A promise that resolves when the labels are applied.
 * @throws {Error} - Throws an error if the GitLab API request fails.
 */
export async function applyGitlabIssueLabels(ssh, issue_id, labels) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);
  const host = idProviderHost(idProvider);

  try {
    const accessToken = await refreshGitlabAccessToken(idProvider);
    const projectId = encodeURIComponent(`${group}/${repository}`);
    const response = await fetch(`${host}/api/v4/projects/${projectId}/issues/${issue_id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        labels: Array.isArray(labels) ? labels : [labels],
      }),
    });

    if (!response.ok) {
      throw new Error(`GitLab API error while applying labels: ${response.status}`);
    }
  } catch (err) {
    console.error("Error applying GitLab issue labels:", err);
    throw err;
  }
}

/**
 * Creates a new issue in a GitLab project.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {string} title - The title of the issue.
 * @param {string} body - The body of the issue.
 * @returns {Promise<number>} - A promise that resolves to the issue ID.
 */
export async function createGitlabIssue(ssh, title, body) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);
  const host = idProviderHost(idProvider);

  try {
    const accessToken = await refreshGitlabAccessToken(idProvider);
    const projectId = encodeURIComponent(`${group}/${repository}`);
    const response = await fetch(`${host}/api/v4/projects/${projectId}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: body,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status}`);
    }

    const issue = await response.json();
    //console.debug("GitLab issue created:", issue);
    return issue.iid;
  } catch (err) {
    console.error("Error creating GitLab issue:", err);
    throw err;
  }
}

/**
 * Closes a GitLab issue by its ID and optionally adds a comment.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} issue_id - The ID of the issue to close.
 * @param {string} [comment] - Optional comment to add before closing the issue.
 * @returns {Promise<void>} - A promise that resolves when the issue is closed.
 * @throws {Error} - Throws an error if the GitLab API request fails.
 */
export async function closeGitlabIssue(ssh, issue_id, comment) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);
  const host = idProviderHost(idProvider);

  try {
    const accessToken = await refreshGitlabAccessToken(idProvider);
    const projectId = encodeURIComponent(`${group}/${repository}`);
    // Add a comment to the issue before closing it
    if (comment) {
      const commentResponse = await fetch(`${host}/api/v4/projects/${projectId}/issues/${issue_id}/notes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: comment,
        }),
      });
      if (!commentResponse.ok) {
        console.error(`GitLab API error while adding comment: ${commentResponse.status}`);
      }
    }
    const response = await fetch(`${host}/api/v4/projects/${projectId}/issues/${issue_id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state_event: "close",
        labels: ["wontfix"],
      }),
    });
    if (!response.ok) {
      throw new Error(`GitLab API error while closing issue: ${response.status}`);
    }
  } catch (err) {
    console.error("Error closing GitLab issue:", err);
    throw err;
  }
}

/**
 * Generates a web link to a GitLab issue based on the SSH URL and issue ID.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} id - The ID of the issue.
 * @returns {string} - The issue web link.
 * @throws {Error} - Throws an error if the ID provider is unsupported.
 */
export function makeGitlabIssueLink(ssh, id) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);
  let host = null;
  if (idProvider === "renku") {
    host = "https://gitlab.renkulab.io";
  }
  else if (idProvider === "gitlab") {
    host = "https://gitlab.com";
  }
  else {
    throw new Error("Unsupported ID provider. Only 'renku' and 'gitlab' are supported.");
  }
  return `${host}/${group}/${repository}/-/issues/${id}`;
}