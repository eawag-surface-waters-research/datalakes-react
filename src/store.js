// store.js
import { createStore, combineReducers } from 'redux';

// Initial authentication state
const initialUserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
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
      case 'LOGOUT':
        return initialAuthState;
    default:
      return state;
  }
}

// Initial data selection state
const initialSelectionState = {
  selectedData: null
};

// Reducer for data selection
function selectionReducer(state = initialSelectionState, action) {
  switch (action.type) {
    case 'SET_SELECTION':
      return {
        ...state,
        selectedData: action.payload
      };
    default:
      return state;
  }
}

// Persist state to local storage
function saveState(state) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (e) {
    console.error("Could not save state to local storage", e);
  }
}
// Load state from local storage
function loadState() {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Could not load state from local storage", e);
    return undefined;
  }
}
// Load initial state from local storage
const persistedState = loadState();

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  selection: selectionReducer
});

// Create store with persisted state
const store = createStore(rootReducer, persistedState);
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
