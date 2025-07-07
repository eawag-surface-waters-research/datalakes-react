// Data selection store

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

export default selectionReducer;