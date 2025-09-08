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
   * @throws {Error} - Throws an error if the API request fails.
   */
  async createGitIssue(title, body) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Closes a Git issue by its ID and optionally adds a comment.
   * @param {number} issue_id - The ID of the issue to close.
   * @param {string} [comment] - Optional comment to add before closing the issue.
   * @returns {Promise<void>} - A promise that resolves when the issue is closed.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async closeGitIssue(issue_id, comment) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Applies labels to a Git issue.
   * @param {number} issue_id - The ID of the issue to apply labels to.
   * @param {string|Array} labels - The label(s) to apply to the issue
   * @returns {Promise<void>} - A promise that resolves when the labels are applied.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async applyGitIssueLabels(issue_id, labels) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Comments on a Git issue.
   * @param {number} issue_id - The ID of the issue to comment on.
   * @param {string} comment - The comment to add to the issue.
   * @returns {Promise<void>} - A promise that resolves when the comment is added.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async commentGitIssue(issue_id, comment) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Generates a web link to a Git issue based on the SSH URL and issue ID.
   * @param {number} issue_id - The ID of the issue.
   * @returns {string} - The issue web link.
   * @throws {Error} - Throws an error if the API request fails.
   */
  makeGitIssueLink(issue_id) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Generates a web link to a Git request based on the SSH URL and request ID.
   * @param {number} request_id - The ID of the request.
   * @returns {string} - The request web link.
   * @throws {Error} - Throws an error if the ID provider is unsupported.
   */
  makeGitRequestLink(request_id) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Creates a new branch for a Git issue.
   * @param {number} issue_id - The ID of the issue for which to create the branch.
   * @returns {Promise<void>} - A promise that resolves when the branch is created.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async createGitIssueBranch(issue_id) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
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
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Downloads a raw file from a Git issue branch.
   * @param {number} issue_id - The ID of the issue associated with the file.
   * @param {string} file_path - The path to the file in the repository.
   * @returns {Promise<string>} - A promise that resolves to the raw file content.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async downloadRawFile(issue_id, file_path) {
    throw new Error("Not implemented. Please use a subclass that implements this method.");
  }

  /**
   * Merges an event into the provided events file and updates the file in the Git issue branch.
   * @param {number} issue_id - The ID of the issue for which a branch is defined.
   * @param {Object} event - The event object containing details for the merge request creation.
   * @param {string} file_path - The path to the events file, to be created if it does not exist.
   * @returns {Promise<void>} - A promise that resolves when the event is merged into the file.
   * @throws {Error} - Throws an error if the API request fails.
   */
  async mergeEvents(issue_id, event, file_path) {
    if (!file_path.endsWith(".csv")) {
      throw new Error("File path must end with .csv");
    }
    let content = await this.downloadRawFile(issue_id, file_path);
    const exists = content.trim() !== '';
    if (!exists) {
      // new or empty file: add csv header
      content = "start;stop;parameter;depth;comments"
    }
    content = `${content}${content.endsWith("\n") ? "" : "\r\n"}${this.eventToCSV(event)}`;
    return { exists, content };
  }

  /**
   * Converts an event object to a CSV string.
   * @param {Object} event - The event object to convert.
   * @returns {string} - The CSV representation of the event.
   */
  eventToCSV(event) {
    const start = this.formatDate(event.start);
    const end = this.formatDate(event.end);
    const parameters = event.parameters?.map(p => p.label).join(",") || "All";
    const depth = event.sensordepths || "";
    let description = event.description || "";
    if (description.includes(";")) {
      description = `"${description}"`; // escape semicolons in description
    }
    return `${start};${end};${parameters};${depth};${description}`;
  }

  /**
   * Formats a date into a string suitable for CSV.
   * @param {Date} date - The date to format.
   * @returns {string} - The formatted date string.
   */
  formatDate = (date) => {
    if (!(date instanceof Date)) {
      throw new Error("Invalid date");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day} ${hours}:${minutes}:${seconds}`;
  };
}