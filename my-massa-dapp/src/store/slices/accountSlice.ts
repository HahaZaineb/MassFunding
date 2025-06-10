import { Provider } from '@massalabs/massa-web3';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  connectedAccount: Provider | null;
}

const initialState: AccountState = {
  connectedAccount: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setConnectedAccount(state, action: PayloadAction<Provider | null>) {
      state.connectedAccount = action.payload;
    },
  },
});

export const { setConnectedAccount } = accountSlice.actions;
export default accountSlice.reducer;