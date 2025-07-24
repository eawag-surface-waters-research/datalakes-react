// Authentication token management and user state handling for Renku, GitLab, and GitHub.

// Initial authentication state
const initialUserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
};
const initialAuthState = {
  renku: initialUserState,
  gitlab: initialUserState,
  github: initialUserState,
};

// Reducer for authentication
function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case 'SET_AUTH_RENKU':
      return {
        ...state,
        renku: {
          ...state.renku,
          user: action.payload.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          expiresIn: action.payload.expiresIn,
          tokenFetchedAt: Math.floor(Date.now() / 1000)
        }
      };
    case 'SET_AUTH_GITLAB':
      return {
        ...state,
        gitlab: {
          ...state.gitlab,
          user: action.payload.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          expiresIn: action.payload.expiresIn,
          tokenFetchedAt: Math.floor(Date.now() / 1000)
        }
      };
    case 'SET_AUTH_GITHUB':
      return {
        ...state,
        github: {
          ...state.github,
          user: action.payload.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          expiresIn: action.payload.expiresIn,
          tokenFetchedAt: Math.floor(Date.now() / 1000)
        }
      };
    case 'LOGOUT_RENKU':
      return {
        ...state,
        renku: initialUserState
      };
    case 'LOGOUT_GITLAB':
      return {
        ...state,
        gitlab: initialUserState
      };
    case 'LOGOUT_GITHUB':
      return {
        ...state,
        github: initialUserState
      };
    case 'LOGOUT':
      return initialAuthState;
    default:
      return state;
  }
}

export default authReducer;
