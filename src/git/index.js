import { idProviderFromSsh } from "../functions";
import store from "../store/index";
import { GitlabService } from "./gitlab";
import { GithubService } from "./github";

export class GitService {
  constructor(ssh = "") {
    if (!ssh) {
      throw new Error("SSH URL is required to initialize GitService");
    }
    this.ssh = ssh;
    var idProvider = idProviderFromSsh(this.ssh);
    if (idProvider === "renku" || idProvider === "gitlab" || idProvider === "eawag") {
      this.service = new GitlabService(ssh);
    } else if (idProvider === "github") {
      this.service = new GithubService(ssh);
    } else {
      console.error("Unsupported ID provider: " + idProvider);
    }
  }

  /**
   * Gets the user information from the authentication object based on the SSH URL.
   * @returns {Object|null} - The user object if found, otherwise null.
   */
  getGitUser() {
    // get user for this dataset
    var idProvider = idProviderFromSsh(this.ssh);
    const authState = store.getState().auth;
    if (idProvider === "renku" && authState?.renku?.user) {
      return authState.renku.user;
    }
    if (idProvider === "eawag" && authState?.eawag?.user) {
      return authState.eawag.user;
    }
    if (idProvider === "gitlab" && authState?.gitlab?.user) {
      return authState.gitlab.user;
    }
    if (idProvider === "github" && authState?.github?.user) {
      return authState.github.user;
    }
    return null;
  }

  /**
   * Checks if the authenticated user is a maintainer of the project.
   * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
   */
  async isGitProjectMaintainer() {
    // get user for this dataset
    const user = this.getGitUser();
    if (!user) {
      return false;
    }
    return await this.service.isGitProjectMaintainer(user);
  }

  /**
   * Creates a new issue in a Git project.
   * @param {string} title - The title of the issue.
   * @param {string} body - The body of the issue.
   * @returns {Promise<number>} - A promise that resolves to the issue number.
   */
  async createGitIssue(title, body) {
    return await this.service.createGitIssue(title, body);
  }

  /**
   * Retrieves a Git issue by its ID.
   * @param {number} issue_id - The ID of the issue to retrieve.
   * @returns {Promise<Object>} - A promise that resolves to the issue object.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async getGitIssue(issue_id) {
    return await this.service.getGitIssue(issue_id);
  }

  /**
   * Checks if a Git issue exists by its ID.
   * @param {number} issue_id - The ID of the issue to check.
   * @returns {Promise<boolean>} - A promise that resolves to true if the issue exists, false otherwise.
   */
  async checkGitIssueExist(issue_id) {
    return await this.service.checkGitIssueExist(issue_id);
  }

  /**
   * Closes a Git issue by its ID and optionally adds a comment.
   * @param {number} issue_id - The ID of the issue to close.
   * @param {string} [comment] - Optional comment to add before closing the issue.
   * @returns {Promise<void>} - A promise that resolves when the issue is closed.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async closeGitIssue(issue_id, comment) {
    if (!issue_id) return;
    return await this.service.closeGitIssue(issue_id, comment);
  }

  /**
   * Applies labels to a Git issue.
   * @param {number} issue_id - The ID of the issue to apply labels to.
   * @param {string|Array} labels - The label(s) to apply to the issue
   * @returns {Promise<void>} - A promise that resolves when the labels are applied.
   * @throws {Error} - Throws an error if the ID provider is unsupported or if the API request fails.
   */
  async applyGitIssueLabels(issue_id, labels) {
    if (!issue_id) return;
    return await this.service.applyGitIssueLabels(issue_id, labels);
  }

  /**
   * Comments on a Git issue.
   * @param {number} issue_id - The ID of the issue to comment on.
   * @param {string} comment - The comment to add to the issue.
   * @returns {Promise<void>} - A promise that resolves when the comment is added.
   * @throws {Error} - Throws an error if the GitLab API request fails.
   */
  async commentGitIssue(issue_id, comment) {
    if (!issue_id) return;
    return await this.service.commentGitIssue(issue_id, comment);
  }

  /**
   * Generates a web link to a Git issue based on the SSH URL and issue ID.
   * @param {number} id - The ID of the issue.
   * @returns {string} - The issue web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitIssueLink(id) {
    return this.service.makeGitIssueLink(id);
  }

  /**
   * Generates a web link to a Git request based on the SSH URL and request ID.
   * @param {number} request_id - The ID of the request.
   * @returns {string} - The request web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitRequestLink(request_id) {
    return this.service.makeGitRequestLink(request_id);
  }

  /**
   * Creates a new merge request for events from a Git issue.
   * @param {number} issue_id - The ID of the issue for which to create the branch.
   * @param {Object} event - The event object containing details for the merge request creation.
   * @returns {Promise<number>} - A promise that resolves to the merge request number.
   * @throws {Error} - Throws an error if the ID provider is unsupported or if the API request fails.
   */
  async makeEventsMergeRequest(issue_id, event) {
    if (!issue_id) return;
    await this.service.createGitIssueBranch(issue_id);
    // create a merge request for the event
    return this.service.makeEventsMergeRequest(
      issue_id,
      event,
      "notes/events.csv"
    );
  }
}
