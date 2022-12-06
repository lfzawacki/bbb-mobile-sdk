import { createSlice } from '@reduxjs/toolkit';
import ScreenshareManager from '../../../services/webrtc/screenshare-manager';
import { setFocusedElement, setFocusedId, setIsFocused } from './wide-app/layout';

// Slice
const screenshareSlice = createSlice({
  name: 'screenshare',
  initialState: {
    screenshareCollection: {},
  },
  reducers: {
    addScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      state.screenshareCollection[screenshareObject.id] = action.payload.screenshareObject.fields;
    },
    removeScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      delete state.screenshareCollection[screenshareObject.id];
    },
    editScreenshare: (state, action) => {
      const { screenshareObject } = action.payload;
      state.screenshareCollection[screenshareObject.id] = {
        ...state.screenshareCollection[screenshareObject.id],
        ...action.payload.screenshareObject.fields,
      };
    },
  },
});

// Selectors
const selectScreenshareByDocumentId = (state, documentId) => {
  return state.screenshareCollection.screenshareCollection[documentId];
};

const selectScreenshare = (state) => Object.values(
  state.screenshareCollection.screenshareCollection
)[0];

// Middleware effects and listeners
const screenshareCleanupListener = (action, listenerApi) => {
  const { screenshareObject } = action.payload;
  const previousState = listenerApi.getOriginalState();
  const currentState = listenerApi.getState();
  const removedScreenshareStream = selectScreenshareByDocumentId(
    previousState,
    screenshareObject.id
  );
  listenerApi.cancelActiveListeners();

  // Stop screenshare manager units (if they exist)
  if (removedScreenshareStream) {
    // Cleanup layout focus if necessary
    if (currentState.layout.focusedElement === 'screenshare') {
      listenerApi.dispatch(setIsFocused(false));
      listenerApi.dispatch(setFocusedId(''));
      listenerApi.dispatch(setFocusedElement(''));
    }

    ScreenshareManager.unsubscribe();
  }
};

export const {
  addScreenshare,
  removeScreenshare,
  editScreenshare,
} = screenshareSlice.actions;

export {
  screenshareCleanupListener,
  selectScreenshare,
  selectScreenshareByDocumentId,
};

export default screenshareSlice.reducer;
