import { projectFromSsh } from "../functions";
import store from "../store/index";
import { GitServiceInterface } from "./commons";

export class GithubService extends GitServiceInterface {

  constructor(ssh = "") {
    super(ssh);
    const { group, repository } = projectFromSsh(this.ssh);
    this.projectPath = `${group}/${repository}`;
    this.host = "https://api.github.com";
    this.contentHost = "https://raw.githubusercontent.com";
  }

  /**
   * Checks if the user is a maintainer of a GitHub project.
   * @param {Object} user - The user object containing user information.
   * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
   */
  async isGitProjectMaintainer(user) {
    const accessToken = this.getAccessToken();
    try {
      const response = await fetch(`${this.host}/repos/${this.projectPath}/collaborators/${user.login}/permission`, {
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
   * Creates a new issue in a Git project.
   * @param {string} title - The title of the issue.
   * @param {string} body - The body of the issue.
   * @returns {Promise<number>} - A promise that resolves to the issue number.
   */
  async createGitIssue(title, body) {
    const accessToken = this.getAccessToken();
    try {
      const response = await fetch(`${this.host}/repos/${this.projectPath}/issues`, {
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
   * Closes a GitHub issue by its ID and optionally adds a comment.
   * @param {number} issue_id - The ID of the issue to close.
   * @param {string} [comment] - Optional comment to add before closing the issue.
   * @returns {Promise<void>} - A promise that resolves when the issue is closed.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async closeGitIssue(issue_id, comment) {
    if (!issue_id) return;
    const accessToken = this.getAccessToken();
    try {
      // Optionally add a comment before closing the issue
      if (comment) {
        await fetch(`${this.host}/repos/${this.projectPath}/issues/${issue_id}/comments`, {
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
      await fetch(`${this.host}/repos/${this.projectPath}/issues/${issue_id}`, {
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

  /**
   * Applies labels to a GitHub issue.
   * @param {number} issue_id - The ID of the issue to apply labels to.
   * @param {string|Array} labels - The label(s) to apply to the issue.
   * @returns {Promise<void>} - A promise that resolves when the labels are applied.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async applyGitIssueLabels(issue_id, labels) {
    const accessToken = this.getAccessToken();
    try {
      const response = await fetch(`${this.host}/repos/${this.projectPath}/issues/${issue_id}/labels`, {
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
   * Comments on a GitHub issue.
   * @param {number} issue_id - The ID of the issue to comment on.
   * @param {string} comment - The comment to add to the issue.
   * @returns {Promise<void>} - A promise that resolves when the comment is added.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async commentGitIssue(issue_id, comment) {
    const accessToken = this.getAccessToken();
    try {
      const response = await fetch(`${this.host}/repos/${this.projectPath}/issues/${issue_id}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: comment }),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error while commenting: ${response.status}`);
      }
    } catch (err) {
      console.error("Error commenting on GitHub issue:", err);
      throw err;
    }
  }

  /**
   * Generates a web link to a GitHub issue based on the SSH URL and issue ID.
   * @param {number} issue_id - The ID of the issue.
   * @returns {string} - The issue web link.
   */
  makeGitIssueLink(issue_id) {
    return `https://github.com/${this.projectPath}/issues/${issue_id}`;
  }

  /**
   * Creates a new branch for a GitHub issue.
   * @param {number} issue_id - The ID of the issue to create a branch for.
   * @returns {Promise<void>} - A promise that resolves when the branch is created.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async createGitIssueBranch(issue_id) {
    const accessToken = this.getAccessToken();
    try {
      const project = await this.getProject();
      const defaultBranch = project.default_branch;
      const branchName = `issue-${issue_id}`;

      // Get last sha from default branch
      const response = await fetch(`${this.host}/repos/${this.projectPath}/git/refs/heads/${defaultBranch}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github+json",
        },
      });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const defaultBranchData = await response.json();

      // Create a new branch from the default branch
      await fetch(`${this.host}/repos/${this.projectPath}/git/refs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: defaultBranchData.object.sha,
        }),
      });
    } catch (err) {
      console.error("Error creating GitHub issue branch:", err);
      throw err;
    }
  }

  /**
   * Downloads a raw file from a GitHub issue branch.
   * @param {number} issue_id - The ID of the issue associated with the file.
   * @param {string} file_path - The path to the file in the repository.
   * @returns {Promise<string>} - A promise that resolves to the raw file content.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async downloadRawFile(issue_id, file_path) {
    const accessToken = this.getAccessToken();
    try {
      const branchName = `issue-${issue_id}`;
      const response = await fetch(`${this.contentHost}/${this.projectPath}/${branchName}/${file_path}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github+json",
        },
      });
      if (response.status === 404) {
        return ''; // File not found, return empty string
      }
      if (!response.ok) {
        throw new Error(`GitHub API error while downloading file: ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.error("Error downloading raw file from GitHub:", err);
      throw err;
    }
  }

  /**
   * Get the project object from GitHub.
   * @returns {Promise<Object>} - A promise that resolves to the project details.
   * @throws {Error} - Throws an error if the GitHub access token is not available or if the API request fails.
   */
  async getProject() {
    const accessToken = this.getAccessToken();
    try {
      const response = await fetch(`${this.host}/repos/${this.projectPath}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github+json",
        },
      });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Error fetching GitHub project:", err);
      throw err;
    }
  }

  /**
   * Gets the access token from the store.
   * @returns {string} - The GitHub access token.
   * @throws {Error} - Throws an error if the access token is not available.
   */
  getAccessToken() {
    const accessToken = store.getState().auth.github?.accessToken;
    if (!accessToken) {
      throw new Error("GitHub access token is not available");
    }
    return accessToken;
  }

  /**
   * Fetches project members from a GitHub project using its SSH URL.
   * @param {string} ssh - The SSH URL of the Git project.
   * @returns {Promise<Array>} - A promise that resolves to an array of project members.
   * @throws {Error} - Throws an error if the GitHub access token is not available or if the API request fails.
   */
  async projectMembersFromGit(ssh) {
    const { group, repository } = projectFromSsh(ssh);
    const accessToken = this.getAccessToken();
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
}