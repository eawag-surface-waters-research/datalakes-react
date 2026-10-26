const isNetworkError = (e) =>
  e instanceof TypeError &&
  /failed to fetch|networkerror|load failed/i.test(e.message);

/**
 * Turns an error from the report issue modal into a message for the user.
 * @param {string} step - Where the error happened: "git" (issue provider), "save" (Datalakes API) or "cleanup" (removing replaced reports).
 * @param {Error} e - The error that was thrown.
 * @param {Object} [options]
 * @param {string} [options.provider] - Name of the issue provider, e.g. "Gitlab".
 * @param {Object} [options.person] - Dataset contact with name and email.
 * @param {number|string} [options.issue] - The issue being commented on (git) or already created (save).
 * @param {string} [options.action] - Row action that failed, e.g. "confirm".
 * @returns {{title: string, hint: string, detail: string}}
 */
export const describeError = (
  step,
  e,
  { provider = "Git", person, issue, action } = {}
) => {
  const status = e?.status;
  const detail = e?.message || String(e);
  const contact = person?.name
    ? person.name + (person.email ? ` (${person.email})` : "")
    : "the dataset maintainer";
  var title = action ? `Could not ${action} the report` : null;
  var hint = "Something went wrong. Please try again.";

  if (step === "git") {
    if (!title)
      title = issue
        ? `Could not comment on issue #${issue}`
        : `Could not create the ${provider} issue`;
    if (status === 401) {
      hint = `Your ${provider} login has expired. Log out, log back in, then try again.`;
    } else if ((status === 403 || status === 404) && issue) {
      hint = `Issue #${issue} could not be found or you can't comment on it. Duplicate the report to open a new issue.`;
    } else if (status === 403 || status === 404 || status === 410) {
      hint = `Your ${provider} account doesn't have permission to manage issues in this dataset's repository, or issues are turned off. Contact ${contact}.`;
    } else if (status === 400 || status === 422) {
      hint = `${provider} rejected the issue. Try a shorter title (under 240 characters).`;
    } else if (status === 429) {
      hint = `Too many requests to ${provider}. Wait a few minutes and try again.`;
    } else if (isNetworkError(e)) {
      hint = `Could not reach ${provider}. Check your connection, or whether a browser extension is blocking it.`;
    }
  } else if (step === "save") {
    if (!title) title = "Could not save the report";
    if (!e?.response) {
      hint = "Could not reach the Datalakes server. Check your connection and try again.";
    } else if (e.response.status >= 500) {
      hint = "The Datalakes server failed to save the report.";
    }
    if (issue && !action) {
      hint += ` Issue #${issue} was already created on ${provider}. Submitting again will create a second issue, so contact ${contact} if this keeps happening.`;
    }
  } else if (step === "cleanup") {
    if (!title) title = "Report saved with a problem";
    hint =
      "Your updated report was saved, but the previous version could not be removed. Delete it from the table above.";
  }

  return { title: title || "Something went wrong", hint, detail };
};
