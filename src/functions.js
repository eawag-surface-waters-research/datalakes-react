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

export const parseDepths = (depths) => {
  // depths is empty/"All" (all depths), a range "1.6-18.0" or a list "1.6,4.5".
  // returns { all: true }, { range: [lower, upper] }, { list: [...] } or null
  // when it can't be read
  if (!depths || depths.trim() === "" || depths.trim() === "All") {
    return { all: true };
  }
  // either bound may be negative, e.g. "-3.3-7.26" or "-5--1"
  var num = "\\s*(-?\\d*\\.?\\d+(?:e[-+]?\\d+)?)\\s*";
  var range = depths.match(new RegExp(`^${num}-${num}$`, "i"));
  if (range) {
    return {
      range: [parseFloat(range[1]), parseFloat(range[2])].sort((a, b) => a - b),
    };
  }
  var item = new RegExp(`^${num}$`, "i");
  var list = depths.split(",");
  if (list.every((d) => item.test(d))) {
    return { list: list.map((d) => parseFloat(d)) };
  }
  return null;
};

export const depthMatches = (depths, depth) => {
  var parsed = parseDepths(depths);
  if (parsed?.all) return true;
  if (!parsed || depth === undefined || depth === null || isNaN(depth)) {
    return false;
  }
  if (parsed.range) {
    return depth >= parsed.range[0] && depth <= parsed.range[1];
  }
  var span = 0.5;
  return parsed.list.some((d) => depth >= d - span && depth <= d + span);
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
