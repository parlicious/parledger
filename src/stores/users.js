import {action} from "easy-peasy";

export const usersModel = {
    joinCode: null,
    setJoinCode: action((state, payload) => {
        state.joinCode = payload;
        return state;
    }),
}