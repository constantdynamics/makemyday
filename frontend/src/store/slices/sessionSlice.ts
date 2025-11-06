import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, CreateSessionDto } from '@makemyday/shared';

interface SessionState {
  currentSession: Session | null;
  configuration: CreateSessionDto | null;
  loading: boolean;
}

const initialState: SessionState = {
  currentSession: null,
  configuration: null,
  loading: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setConfiguration: (state, action: PayloadAction<CreateSessionDto>) => {
      state.configuration = action.payload;
    },
    setSession: (state, action: PayloadAction<Session>) => {
      state.currentSession = action.payload;
    },
    clearSession: (state) => {
      state.currentSession = null;
      state.configuration = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setConfiguration, setSession, clearSession, setLoading } = sessionSlice.actions;
export default sessionSlice.reducer;
