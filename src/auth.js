const auth = {
  renku: {
    clientId: process.env.REACT_APP_RENKU_CLIENT_ID,
  },
  gitlab: {
    clientId: process.env.REACT_APP_GITLAB_CLIENT_ID,
  },
  github: {
    clientId: process.env.REACT_APP_GITHUB_CLIENT_ID,
  },
  eawag: {
    clientId: process.env.REACT_APP_EAWAG_CLIENT_ID,
  },
};

export { auth };
