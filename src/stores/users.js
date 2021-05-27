import {action, computed, thunk} from "easy-peasy";

export const usersModel = {
    joinCode: null,
    setJoinCode: action((state, payload) => {
        return {...state, joinCode: payload}
    }),
    avatarUrlsByUid: computed([(state, storeState) => {
        return storeState.firestore?.data.groupMembers;
    }], (members) => members),
    activeGroup: null,
    setActiveGroup: action((state, payload) => {
        return {...state, activeGroup: payload};
    }),
    loadActiveGroup: thunk((actions, payload, helpers) => {
        const storeState = helpers.getStoreState();
        const state = helpers.getState();
        if(!state.activeGroup){
            actions.setActiveGroup(storeState.firebase?.profile?.groups?.[0]);
        }
    })
}