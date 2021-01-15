import {action} from "easy-peasy";

export const usersModel = {
    joinCode: null,
    setJoinCode: action((state, payload) => {
        return {...state, joinCode: payload}
    }),
}