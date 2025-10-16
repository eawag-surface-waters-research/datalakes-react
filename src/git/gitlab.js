import { projectFromSsh, idProviderFromSsh } from "../functions";
import { auth } from "../auth";
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
    this.projectPath = projectFromSsh(this.ssh);
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
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/members/all/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

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
   * @throws {Error} - Throws an error if the API request fails.
   */
  async applyGitIssueLabels(issue_id, labels) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/issues/${issue_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            labels: Array.isArray(labels) ? labels : [labels],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitLab API error while applying labels: ${response.status}`
        );
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
   * @throws {Error} - Throws an error if the API request fails.
   */
  async createGitIssue(title, body) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            description: body,
          }),
        }
      );

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
   * @throws {Error} - Throws an error if the API request fails.
   */
  async closeGitIssue(issue_id, comment) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      // Add a comment to the issue before closing it
      if (comment) {
        const commentResponse = await fetch(
          `${this.host}/api/v4/projects/${projectId}/issues/${issue_id}/notes`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              body: comment,
            }),
          }
        );
        if (!commentResponse.ok) {
          console.error(
            `GitLab API error while adding comment: ${commentResponse.status}`
          );
        }
      }
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/issues/${issue_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state_event: "close",
            labels: ["wontfix"],
          }),
        }
      );
      if (!response.ok) {
        throw new Error(
          `GitLab API error while closing issue: ${response.status}`
        );
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
   * @throws {Error} - Throws an error if the API request fails.
   */
  async commentGitIssue(issue_id, comment) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/issues/${issue_id}/notes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitLab API error while commenting on issue: ${response.status}`
        );
      }
    } catch (err) {
      console.error("Error commenting on GitLab issue:", err);
      throw err;
    }
  }

  /**
   * Generates a web link to a GitLab issue based on the SSH URL and issue ID.
   * @param {number} issue_id - The ID of the issue.
   * @returns {string} - The issue web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitIssueLink(issue_id) {
    return `${this.host}/${this.projectPath}/-/issues/${issue_id}`;
  }

  /**
   * Generates a web link to a GitLab request based on the SSH URL and request ID.
   * @param {number} request_id - The ID of the request.
   * @returns {string} - The request web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitRequestLink(request_id) {
    return `${this.host}/${this.projectPath}/-/merge_requests/${request_id}`;
  }

  /**
   * Creates a new branch for a GitLab issue.
   * @param {number} issue_id - The ID of the issue for which to create the branch.
   * @returns {Promise<void>} - A promise that resolves when the branch is created.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async createGitIssueBranch(issue_id) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);

      const project = await this.getProject();
      const defaultBranch = project.default_branch;
      const branchName = `issue-${issue_id}`;

      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/repository/branches?branch=${branchName}&ref=${defaultBranch}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitLab API error while creating branch: ${response.status}`
        );
      }
    } catch (err) {
      console.error("Error creating GitLab issue branch:", err);
      throw err;
    }
  }

  /**
   * Merge event into the provided events file and make a merge request for this update.
   * @param {number} issue_id - The ID of the issue for which a branch is defined.
   * @param {Object} event - The event object containing details for the merge request creation.
   * @param {string} file_path - The path to the events file, to be created if it does not exist.
   * @returns {Promise<number>} - A promise that resolves to the merge request number.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async makeEventsMergeRequest(issue_id, event, file_path) {
    const { exists, content } = await this.mergeEvents(
      issue_id,
      event,
      file_path
    );
    const branchName = `issue-${issue_id}`;
    const accessToken = await this.refreshGitlabAccessToken();
    const projectId = encodeURIComponent(`${this.projectPath}`);
    // Create or update the events file in the repository
    // Use the GitLab API to create or update the file
    // If the file does not exist, it will be created; if it exists, it will be updated
    const response = await fetch(
      `${
        this.host
      }/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(
        file_path
      )}`,
      {
        method: exists ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch: branchName,
          content: content,
          commit_message: `feat: add event for issue #${issue_id}`,
          encoding: "text",
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `GitLab API error while creating events file: ${response.status}`
      );
    }
    // Create a merge request for the new branch
    const project = await this.getProject();
    const defaultBranch = project.default_branch;
    const mergeRequestResponse = await fetch(
      `${this.host}/api/v4/projects/${projectId}/merge_requests`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_branch: branchName,
          target_branch: defaultBranch,
          title: `Merge events for issue #${issue_id}`,
          description: `This merge request contains events for issue #${issue_id}.`,
          remove_source_branch: true,
        }),
      }
    );
    if (!mergeRequestResponse.ok) {
      throw new Error(
        `GitLab API error while creating merge request: ${mergeRequestResponse.status}`
      );
    }
    const mergeRequest = await mergeRequestResponse.json();
    console.debug("GitLab merge request created:", mergeRequest);
    return mergeRequest.iid; // Return the merge request ID
  }

  /**
   * Downloads a raw file from a GitLab project.
   * @param {number} issue_id - The ID of the issue associated with the file.
   * @param {string} file_path - The path to the file in the repository.
   * @returns {Promise<string>} - A promise that resolves to the raw file content.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async downloadRawFile(issue_id, file_path) {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const filePath = encodeURIComponent(file_path);
      const branchName = `issue-${issue_id}`;
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/repository/files/${filePath}/raw?ref=${branchName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 404) {
        return ""; // File not found, return empty string
      }
      if (!response.ok) {
        throw new Error(
          `GitLab API error while downloading raw file: ${response.status}`
        );
      }
      // Return the raw file content as text
      return await response.text();
    } catch (err) {
      console.error("Error downloading raw file from GitLab:", err);
      throw err;
    }
  }

  /**
   * Get the project object from GitLab.
   * @returns {Promise<Object>} - A promise that resolves to the project object.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async getProject() {
    try {
      const accessToken = await this.refreshGitlabAccessToken();
      const projectId = encodeURIComponent(`${this.projectPath}`);
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `GitLab API error while fetching project: ${response.status}`
        );
      }
      const project = await response.json();
      return project;
    } catch (err) {
      console.error("Error fetching GitLab project:", err);
      throw err;
    }
  }

  /**
   * Refreshes the GitLab access token if it is expiring soon.
   * @returns {Promise<string>} - A promise that resolves to the refreshed access token.
   * @throws {Error} - Throws an error if the token refresh fails.
   */
  async refreshGitlabAccessToken() {
    const state = store.getState();
    const { accessToken, refreshToken, expiresIn, tokenFetchedAt } =
      state.auth[this.idProvider] || {};

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
    const redirectUri =
      auth[this.idProvider].redirectUri ||
      window.location.origin + `/${this.idProvider}`;

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

    const actionType =
      this.idProvider === "renku" ? "SET_AUTH_RENKU" : "SET_AUTH_GITLAB";
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
    } else {
      throw new Error(
        "Unsupported ID provider. Only 'renku' and 'gitlab' are supported."
      );
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
      const response = await fetch(
        `${this.host}/api/v4/projects/${projectId}/members/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

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
}
