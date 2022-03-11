
export const handleUpdateUserOnline = (listUserOnline) => {

    console.log("handleUpdateUserOnline", listUserOnline)
    return {
        type: "UPDATE_USER_ONLINE",
        listUserOnline: listUserOnline,
    };
};

export const handleUserInfor = (username) => {

    console.log("username", username)
    return {
        type: "USER_INFO",
        userInfo: username,
    };
};