// Stores
import { createStore, combineReducers } from 'redux';
import selectionReducer from './selection';
import authReducer from './auth';

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
