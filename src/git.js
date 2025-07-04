import { projectFromSsh, idProviderFromSsh } from "./functions";
import { auth } from "./config.json";

async function refreshGitlabAccessToken(host, clientId, refreshToken) {
  const response = await fetch(`${host}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  });

  if (!response.ok) throw new Error('Failed to refresh token');

  const result = await response.json(); // { access_token, refresh_token, expires_in, ... }
  console.debug("GitLab access token refreshed:", result);
  // TODO Update redux state with new access token
  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token || refreshToken, // Use the new refresh token if provided
  };
}

/**
 * Fetches project members from a GitLab project using its SSH URL.
 * 
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {string} authState - The authentication object of the GitLab project.
 * @returns {Promise<Array>} - A promise that resolves to an array of project members.
 */
async function projectMembersFromGitlab(ssh, authState) {
  const idProvider = idProviderFromSsh(ssh);
  const { group, repository } = projectFromSsh(ssh);

  let host = null;
  let gitlabAuthState = null;
  let clientId = null;
  if (idProvider === "renku") {
    host = 'https://gitlab.renkulab.io';
    gitlabAuthState = authState.renku;
    clientId = auth.renku.clientId;
  } else if (idProvider === "gitlab") {
    host = 'https://gitlab.com';
    gitlabAuthState = authState.gitlab;
    clientId = auth.gitlab.clientId;
  } else {
    throw new Error("Unsupported ID provider. Only 'renku' and 'gitlab' are supported.");
  }
  const projectId = encodeURIComponent(`${group}/${repository}`);
  
  if (!gitlabAuthState || !gitlabAuthState.accessToken || !gitlabAuthState.refreshToken) {
    throw new Error("Not authenticated for " + idProvider + ". Please provide a valid authentication object.");
  }
  //const result = await refreshGitlabAccessToken(host, clientId, gitlabAuthState.refreshToken);
  //if (result.access_token) {
  //  // Update the access token in the authState
  //  gitlabAuthState.accessToken = result.access_token;
  //  gitlabAuthState.refreshToken = result.refresh_token || gitlabAuthState.refreshToken;
  //}

  try {
    const response = await fetch(`${host}/api/v4/projects/${projectId}/members/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${gitlabAuthState.accessToken}`,
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
 * @param {Object} authState - The authentication object containing user information.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
 */
export async function isGitProjectMaintainer(ssh, authState) {
  // get user for this dataset
  var idProvider = idProviderFromSsh(ssh);
  if (idProvider === "renku" || idProvider === "gitlab") {
    const members = await projectMembersFromGitlab(ssh, authState);
    console.debug("Members:", members);
    const user = authState.renku.user;
    return members.some(member => member.id === user.id && member.access_level >= 30); // Gitlab Developper access level
  } else if (idProvider === "github" && authState.github?.user) {
    // TODO
    return false;
  }
  throw new Error("Unsupported ID provider: " + idProvider);
}

/**
 * Gets the user information from the authentication object based on the SSH URL.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {Object} authState - The authentication object containing user information.
 * @returns {Object|null} - The user object if found, otherwise null.
 */
export function getGitUser(ssh, authState) {
  // get user for this dataset
  var idProvider = idProviderFromSsh(ssh);
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