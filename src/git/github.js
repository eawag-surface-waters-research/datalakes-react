import { projectFromSsh } from "../functions";
import store from "../store/index";

/**
 * Fetches project members from a GitHub project using its SSH URL.
 * @param {string} ssh - The SSH URL of the Git project.
 * @returns {Promise<Array>} - A promise that resolves to an array of project members.
 * @throws {Error} - Throws an error if the GitHub access token is not available or if the API request fails.
 */
export async function projectMembersFromGithub(ssh) {
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
        "Accept": "application/vnd.github+json",
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
export async function isGithubProjectMaintainer(ssh, user) {
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
        "Accept": "application/vnd.github+json",
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
 * Generates a web link to a GitHub issue based on the SSH URL and issue ID.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} id - The ID of the issue.
 * @returns {string} - The issue web link.
 */
export function makeGithubIssueLink(ssh, id) {
  const { group, repository } = projectFromSsh(ssh);
  return `https://github.com/${group}/${repository}/issues/${id}`;
}

/**
 * Creates a new issue in a Git project.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {string} title - The title of the issue.
 * @param {string} body - The body of the issue.
 * @returns {Promise<number>} - A promise that resolves to the issue number.
 */
export async function createGithubIssue(ssh, title, body) {
  const { group, repository } = projectFromSsh(ssh);

  const accessToken = store.getState().auth.github?.accessToken;
  if (!accessToken) {
    throw new Error("GitHub access token is not available");
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${group}/${repository}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const issue = await response.json();
    return issue.number; // Return the issue number
  } catch (err) {
    console.error("Error creating GitHub issue:", err);
    throw err;
  }
}

/**
 * Applies labels to a GitHub issue.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} issue_id - The ID of the issue to apply labels to.
 * @param {string|Array} labels - The label(s) to apply to the issue.
 * @returns {Promise<void>} - A promise that resolves when the labels are applied.
 * @throws {Error} - Throws an error if the GitHub API request fails.
 */
export async function applyGithubIssueLabels(ssh, issue_id, labels) {
  const { group, repository } = projectFromSsh(ssh);

  const accessToken = store.getState().auth.github?.accessToken;
  if (!accessToken) {
    throw new Error("GitHub access token is not available");
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${group}/${repository}/issues/${issue_id}/labels`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ labels: Array.isArray(labels) ? labels : [labels] }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error while applying labels: ${response.status}`);
    }
  } catch (err) {
    console.error("Error applying GitHub issue labels:", err);
    throw err;
  }
}

/**
 * Closes a GitHub issue by its ID and optionally adds a comment.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} issue_id - The ID of the issue to close.
 * @param {string} [comment] - Optional comment to add before closing the issue.
 * @returns {Promise<void>} - A promise that resolves when the issue is closed.
 * @throws {Error} - Throws an error if the GitHub API request fails.
 */
export async function closeGithubIssue(ssh, issue_id, comment) {
  if (!issue_id) return;

  const { group, repository } = projectFromSsh(ssh);

  const accessToken = store.getState().auth.github?.accessToken;
  if (!accessToken) {
    throw new Error("GitHub access token is not available");
  }

  try {
    // Optionally add a comment before closing the issue
    if (comment) {
      await fetch(`https://api.github.com/repos/${group}/${repository}/issues/${issue_id}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: comment }),
      });
    }

    // Close the issue
    await fetch(`https://api.github.com/repos/${group}/${repository}/issues/${issue_id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: "closed" }),
    });
  } catch (err) {
    console.error("Error closing GitHub issue:", err);
    throw err;
  }
}