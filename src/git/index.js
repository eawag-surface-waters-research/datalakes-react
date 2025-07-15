import { idProviderFromSsh } from "../functions";
import store from "../store/index";
import { applyGitlabIssueLabels, closeGitlabIssue, createGitlabIssue, isGitlabProjectMaintainer, makeGitlabIssueLink } from "./gitlab";
import { isGithubProjectMaintainer, createGithubIssue, makeGithubIssueLink } from "./github";

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
}

/**
 * Creates a new issue in a Git project.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {string} title - The title of the issue.
 * @param {string} body - The body of the issue.
 * @returns {Promise<number>} - A promise that resolves to the issue number.
 */
export async function createGitIssue(ssh, title, body) {
  const idProvider = idProviderFromSsh(ssh);
  if (idProvider === "renku" || idProvider === "gitlab") {
    return await createGitlabIssue(ssh, title, body);
  }
  else if (idProvider === "github") {
    return await createGithubIssue(ssh, title, body);
  }
  throw new Error("Unsupported ID provider. Only 'renku', 'gitlab', and 'github' are supported.");
}

/**
 * Closes a Git issue by its ID and optionally adds a comment.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} issue_id - The ID of the issue to close.
 * @param {string} [comment] - Optional comment to add before closing the issue.
 * @returns {Promise<void>} - A promise that resolves when the issue is closed.
 * @throws {Error} - Throws an error if the GitHub API request fails.
 */
export async function closeGitIssue(ssh, issue_id, comment) {
  if (!issue_id) return;
  const idProvider = idProviderFromSsh(ssh);
  if (idProvider === "renku" || idProvider === "gitlab") {
    return await closeGitlabIssue(ssh, issue_id, comment);
  }
  else if (idProvider === "github") {
    // TODO: implement GitHub issue closing
    // return await closeGithubIssue(ssh, issue_id, comment);
  }
  throw new Error("Unsupported ID provider. Only 'renku', 'gitlab', and 'github' are supported.");
}

/**
 * Applies labels to a Git issue.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} issue_id - The ID of the issue to apply labels to.
 * @param {string|Array} labels - The label(s) to apply to the issue
 * @returns {Promise<void>} - A promise that resolves when the labels are applied.
 * @throws {Error} - Throws an error if the ID provider is unsupported or if the API request fails.
 */
export async function applyGitIssueLabels(ssh, issue_id, labels) {
  if (!issue_id) return;
  const idProvider = idProviderFromSsh(ssh);
  if (idProvider === "renku" || idProvider === "gitlab") {
    return await applyGitlabIssueLabels(ssh, issue_id, labels);
  }
  else if (idProvider === "github") {
    // TODO: implement GitHub issue closing
    // return await applyGithubIssueLabels(ssh, issue_id, labels);
  }
  throw new Error("Unsupported ID provider. Only 'renku', 'gitlab', and 'github' are supported.");
}

/**
 * Generates a web link to a Git issue based on the SSH URL and issue ID.
 * @param {string} ssh - The SSH URL of the Git project.
 * @param {number} id - The ID of the issue.
 * @returns {string} - The issue web link.
 * @throws {Error} - Throws an error if the ID provider is unsupported.
 */
export function makeGitIssueLink(ssh, id) {
  const idProvider = idProviderFromSsh(ssh);
  if (idProvider === "renku" || idProvider === "gitlab") {
    return makeGitlabIssueLink(ssh, id);
  }
  else if (idProvider === "github") {
    return makeGithubIssueLink(ssh, id);
  }
  throw new Error("Unsupported ID provider. Only 'renku', 'gitlab', and 'github' are supported.");
}