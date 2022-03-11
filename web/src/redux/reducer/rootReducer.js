import { combineReducers } from "redux";

import ListOnlineUserReducer from "./ListOnlineUserReducer"

export const rootReducer = combineReducers({
    stateListUserOnline: ListOnlineUserReducer,
});
