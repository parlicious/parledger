import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";
import {PersonalWagers} from "./PersonalWagers";

export const Feed = () => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect(profile?.groups?.map(g => ({collection: `groups/${g}/wagers`, storeAs: 'wagers'})));
    const wagers = useStoreState(state => state.firestore.data.wagers)
    console.log(wagers);
    return (
        <div>
            <PersonalWagers/>
        </div>
    )
}