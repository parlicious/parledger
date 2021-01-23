import {action, computed} from "easy-peasy";

export const usersModel = {
    joinCode: null,
    setJoinCode: action((state, payload) => {
        return {...state, joinCode: payload}
    }),
    avatarUrlsByUid: computed([(state, storeState) => {
        return storeState.firestore?.data.groupMembers;
    }], (members) => members)
}