export class GitServiceInterface {

  constructor(ssh = "") {
    if (!ssh) {
      throw new Error("SSH URL is required to initialize GitService");
    }
    this.ssh = ssh;
  }

  /** 
   * Checks if the authenticated user is a maintainer of the project.
   * @returns {Promise<boolean>} - A promise that resolves to true if the user is a maintainer, false otherwise.
   */
  async isGitProjectMaintainer() {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Creates a new issue in a Git project.
   * @param {string} title - The title of the issue.
   * @param {string} body - The body of the issue.
   * @returns {Promise<number>} - A promise that resolves to the issue number.
   */
  async createGitIssue(title, body) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Closes a Git issue by its ID and optionally adds a comment.
   * @param {number} issue_id - The ID of the issue to close.
   * @param {string} [comment] - Optional comment to add before closing the issue.
   * @returns {Promise<void>} - A promise that resolves when the issue is closed.
   * @throws {Error} - Throws an error if the GitHub API request fails.
   */
  async closeGitIssue(issue_id, comment) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Applies labels to a Git issue.
   * @param {number} issue_id - The ID of the issue to apply labels to.
   * @param {string|Array} labels - The label(s) to apply to the issue
   * @returns {Promise<void>} - A promise that resolves when the labels are applied.
   * @throws {Error} - Throws an error if the ID provider is unsupported or if the API request fails.
   */
  async applyGitIssueLabels(issue_id, labels) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Comments on a Git issue.
   * @param {number} issue_id - The ID of the issue to comment on.
   * @param {string} comment - The comment to add to the issue.
   * @returns {Promise<void>} - A promise that resolves when the comment is added.
   * @throws {Error} - Throws an error if the GitLab API request fails.
   */
  async commentGitIssue(issue_id, comment) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Generates a web link to a Git issue based on the SSH URL and issue ID.
   * @param {number} issue_id - The ID of the issue.
   * @returns {string} - The issue web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitIssueLink(issue_id) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Creates a new branch for a Git issue.
   * @param {number} issue_id - The ID of the issue for which to create the branch.
   * @returns {Promise<void>} - A promise that resolves when the branch is created.
   * @throws {Error} - Throws an error if the ID provider is unsupported or if the API request fails.
   */
  async createGitIssueBranch(issue_id) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }
}