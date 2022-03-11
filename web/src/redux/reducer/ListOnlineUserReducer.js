
const stateDefault = {
    listUserOnline: [],
    userInfo: ""
};

const ListOnlineUserReducer = (state = stateDefault, action) => {
    console.log("action.type", action.type)
    switch (action.type) {
        case "UPDATE_USER_ONLINE": {
            console.log("action.listUserOnline", action.listUserOnline)
            state.listUserOnline = action.listUserOnline
            return { ...state };
        }
        case "USER_INFO": {
            console.log("action.userInfo", action.userInfo)
            state.userInfo = action.userInfo
            return { ...state };
        }

        default: return { ...state };
    }
}

export default ListOnlineUserReducer;
