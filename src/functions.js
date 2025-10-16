export const projectFromSsh = (ssh) => {
  return ssh.replace(".git", "").split(":")[1];
};

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
};

export const urlFromSsh = (ssh, renku = false) => {
  var url;
  var project = projectFromSsh(ssh);

  if (ssh.includes("git@renkulab.io")) {
    if (renku) {
      url = `https://renkulab.io/projects/${project}`;
    } else {
      url = `https://renkulab.io/gitlab/${project}`;
    }
  } else if (ssh.includes("git@gitlab.renkulab.io")) {
    url = `https://gitlab.renkulab.io/${project}`;
  } else if (ssh.includes("gitlab.com")) {
    url = `https://gitlab.com/${project}`;
  } else if (ssh.includes("github.com")) {
    url = `https://github.com/${project}`;
  } else if (ssh.includes("gitlab.eawag.ch")) {
    url = `https://gitlab.eawag.ch/${project}`;
  }
  return url;
};
