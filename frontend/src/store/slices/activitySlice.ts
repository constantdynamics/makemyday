import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivitySuggestion } from '@makemyday/shared';

interface ActivityState {
  currentActivity: ActivitySuggestion | null;
  loading: boolean;
}

const initialState: ActivityState = {
  currentActivity: null,
  loading: false,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivity: (state, action: PayloadAction<ActivitySuggestion>) => {
      state.currentActivity = action.payload;
    },
    clearActivity: (state) => {
      state.currentActivity = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setActivity, clearActivity, setLoading } = activitySlice.actions;
export default activitySlice.reducer;
