// create stores for the application using redux toolkit . it have function ,action ,reducer and slice . we can create slice for each feature of the application and then combine them in the store . we can also use thunk for async actions .
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slice/user/user.slice'
export const store = configureStore({
  reducer: {
    userReducer,
  },
});