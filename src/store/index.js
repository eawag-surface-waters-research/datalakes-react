// Stores
import { createStore, combineReducers } from 'redux';
import { persistStore, autoRehydrate, createTransform } from 'redux-persist';
import { encrypt, decrypt } from '../crypto';
import selectionReducer from './selection';
import authReducer from './auth';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  selection: selectionReducer
});

// Create store with persisted state
const store = createStore(
  rootReducer,
  undefined,
  autoRehydrate()
);

const encryptTransform = createTransform(
  (inbound) => encrypt(inbound),
  (outbound) => decrypt(outbound)
);

// Then pass it to persistStore
persistStore(store, {
  transforms: [encryptTransform],
});

export default store;
