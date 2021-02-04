import {thunk} from "easy-peasy";

export const poolsModel = {
    submitPoolEntry: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase()
        await firebase.functions().httpsCallable('submitPoolEntry')(payload);
    }),
}