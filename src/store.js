// store.js
import { createStore, combineReducers } from 'redux';

// Initial state
const initialSelectionState = {
  selectedData: null
};

// Reducer
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

// Root reducer
const rootReducer = combineReducers({
  selection: selectionReducer
});

// Create store
const store = createStore(rootReducer);

export default store;
