const projectFromSsh = (ssh) => {
  var group = ssh.replace(".git", "").split(":")[1].split("/")[0];
  var repository = ssh.replace(".git", "").split(":")[1].split("/")[1];
  return { group, repository };
}

export const idProviderFromSsh = (ssh) => {
  if (ssh.includes("renkulab.io")) {
    return "renku";
  }
  if (ssh.includes("gitlab.com")) {
    return "gitlab";
  }
  if (ssh.includes("github.com")) {
    return "github";
  }
  return null;
}

export const urlFromSsh = (ssh, renku = false) => {
  var url;
  var { group, repository } = projectFromSsh(ssh);

  if (ssh.includes("git@renkulab.io")) {
    if (renku) {
      url = `https://renkulab.io/projects/${group}/${repository}`;
    } else {
      url = `https://renkulab.io/gitlab/${group}/${repository}`;
    }
  } else if (ssh.includes("git@gitlab.renkulab.io")) {
    url = `https://gitlab.renkulab.io/${group}/${repository}`;
  } else if (ssh.includes("github.com")) {
    url = `https://github.com/${group}/${repository}`;
  } else if (ssh.includes("gitlab.com")) {
    url = `https://gitlab.com/${group}/${repository}`;
  }
  return url;
};
