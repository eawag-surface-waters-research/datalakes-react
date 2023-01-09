export const urlFromSsh = (ssh, renku = false) => {
  var url;
  var group = ssh.replace(".git", "").split(":")[1].split("/")[0];
  var repository = ssh.replace(".git", "").split(":")[1].split("/")[1];
  if (ssh.includes("renkulab.io")) {
    if (renku) {
      url = `https://renkulab.io/projects/${group}/${repository}`;
    } else {
      url = `https://renkulab.io/gitlab/${group}/${repository}`;
    }
  } else if (ssh.includes("github.com")) {
    url = `https://github.com/${group}/${repository}`;
  } else if (ssh.includes("gitlab.com")) {
    url = `https://gitlab.com/${group}/${repository}`;
  }
  return url;
};
