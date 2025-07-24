import { projectFromSsh, idProviderFromSsh } from "../functions";
import { auth } from "../config.json";
import store from "../store/index";
import { GitServiceInterface } from "./commons";


const TOKEN_EXPIRY_BUFFER = 60; // seconds before actual expiry to refresh

export class GitlabService extends GitServiceInterface {

  constructor(ssh = "") {
    super(ssh);
    this.idProvider = idProviderFromSsh(this.ssh);
    if (!this.idProvider) {
      throw new Error("Unsupported ID provider for GitLab service");
    }
    this.host = this.idProviderHost();
    const { group, repository } = projectFromSsh(this.ssh);
    this.projectPath = `${group}/${repository}`;
  }
    
  /**
   * Refreshes the GitLab access token if it is expiring soon.
   * @returns {Promise<string>} - A promise that resolves to the refreshed access token.
   * @throws {Error} - Throws an error if the token refresh fails.
   */
  async refreshGitlabAccessToken() {
    const state = store.getState();
    const { accessToken, refreshToken, expiresIn, tokenFetchedAt } = state.auth[this.idProvider] || {};

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

    const clientId = auth[this.idProvider].clientId;
    const redirectUri = auth[this.idProvider].redirectUri || window.location.origin + `/${this.idProvider}`;

    const response = await fetch(`${this.host}/oauth/token`, {
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
      user: auth[this.idProvider].user || null,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };

    const actionType = this.idProvider === "renku" ? "SET_AUTH_RENKU" : "SET_AUTH_GITLAB";
    store.dispatch({ type: actionType, payload: updatedToken });

    return updatedToken.accessToken;
  }

  /**
   * Returns the host URL for the GitLab service based on the ID provider.
   * @returns {string} - The host URL for the GitLab service.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  idProviderHost() {
    if (this.idProvider === "renku") {
      return "https://gitlab.renkulab.io";
    } else if (this.idProvider === "gitlab") {
      return "https://gitlab.com";
    } else if (this.idProvider === "github") {
      return "https://api.github.com";
    } else {
      throw new Error("Unsupported ID provider. Only 'renku', 'gitlab', and 'github' are supported.");
    }
  }

  /**
   * Fetches project members from a GitLab project using its SSH URL.
   * @returns {Promise<Array>} - A promise that resolves to an array of project members.
   */
  async projectMembersFromGit() {

    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(`${this.host}/api/v4/projects/${projectId}/members/all`, {
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
   * @param {Object} user - The user object containing user information.
   * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
   */
  async isGitProjectMaintainer(user) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(`${this.host}/api/v4/projects/${projectId}/members/all/${user.id}`, {
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
   * @param {number} issue_id - The ID of the issue to apply labels to.
   * @param {string|Array} labels - The label(s) to apply to the issue
   * @returns {Promise<void>} - A promise that resolves when the labels are applied.
   * @throws {Error} - Throws an error if the GitLab API request fails.
   */
  async applyGitIssueLabels(issue_id, labels) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(`${this.host}/api/v4/projects/${projectId}/issues/${issue_id}`, {
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
   * @param {string} title - The title of the issue.
   * @param {string} body - The body of the issue.
   * @returns {Promise<number>} - A promise that resolves to the issue ID.
   */
  async createGitIssue(title, body) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(`${this.host}/api/v4/projects/${projectId}/issues`, {
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
   * @param {number} issue_id - The ID of the issue to close.
   * @param {string} [comment] - Optional comment to add before closing the issue.
   * @returns {Promise<void>} - A promise that resolves when the issue is closed.
   * @throws {Error} - Throws an error if the GitLab API request fails.
   */
  async closeGitIssue(issue_id, comment) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      // Add a comment to the issue before closing it
      if (comment) {
        const commentResponse = await fetch(`${this.host}/api/v4/projects/${projectId}/issues/${issue_id}/notes`, {
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
      const response = await fetch(`${this.host}/api/v4/projects/${projectId}/issues/${issue_id}`, {
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
   * Comments on a GitLab issue.
   * @param {number} issue_id - The ID of the issue to comment on.
   * @param {string} comment - The comment to add to the issue.
   * @returns {Promise<void>} - A promise that resolves when the comment is added.
   * @throws {Error} - Throws an error if the GitLab API request fails.
   */
  async commentGitIssue(issue_id, comment) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(`${this.host}/api/v4/projects/${projectId}/issues/${issue_id}/notes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: comment,
        }),
      });

      if (!response.ok) {
        throw new Error(`GitLab API error while commenting on issue: ${response.status}`);
      }
    } catch (err) {
      console.error("Error commenting on GitLab issue:", err);
      throw err;
    }
  }

  /**
   * Generates a web link to a GitLab issue based on the SSH URL and issue ID.
   * @param {number} id - The ID of the issue.
   * @returns {string} - The issue web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitIssueLink(id) {
    return `${this.host}/${this.projectPath}/-/issues/${id}`;
  }
}