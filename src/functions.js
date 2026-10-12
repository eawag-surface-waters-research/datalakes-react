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
  if (ssh.includes("gitlab.eawag.ch")) {
    return "eawag";
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

export const isActiveMaintenance = (m) => {
  // reported periods are not yet confirmed, so their data stays visible
  return m.state !== "reported";
};

export const depthMatches = (depths, depth) => {
  // depths is empty/"All" (all depths), a range "1.6-18.0" or a list "1.6,4.5"
  if (!depths || depths.trim() === "" || depths.trim() === "All") return true;
  if (depth === undefined || depth === null || isNaN(depth)) return false;
  var range = depths.split("-").map((d) => parseFloat(d));
  if (range.length > 1) {
    return depth >= range[0] && depth <= range[1];
  }
  var span = 0.5;
  return depths
    .split(",")
    .map((d) => parseFloat(d))
    .some((d) => depth >= d - span && depth <= d + span);
};

export const groupMaintenance = (maintenance) => {
  // group maintenance rows of the same issue (or same period) together
  var dict = {};
  for (let i = 0; i < maintenance.length; i++) {
    let m = maintenance[i];
    let key = m.issue
      ? m.issue
      : m.starttime.toString() + m.endtime.toString();
    let parameter = m.name + (m.detail !== "none" ? ` (${m.detail})` : "");
    if (key in dict) {
      dict[key].parameters.push(parameter);
      dict[key].id.push(m.id);
    } else {
      dict[key] = {
        start: m.starttime,
        end: m.endtime,
        parameters: [parameter],
        depths: m.depths,
        description: m.description,
        id: [m.id],
        state: m.state,
        issue: m.issue,
        request: m.request,
        reporter: m.reporter,
      };
    }
  }
  return dict;
};

export const formatLocalTime = (value) => {
  // show an ISO string or Date in the user's local time: YYYY-MM-DD HH:mm
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
