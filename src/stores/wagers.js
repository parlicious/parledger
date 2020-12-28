import {thunk} from "easy-peasy"

export const wagersModel = {
    createWager: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase()
        await firebase.functions().httpsCallable('createWager')(payload);
    })
}