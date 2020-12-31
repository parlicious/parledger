import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";

export const Feed = () => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect(profile?.groups?.map(g => ({collection: `groups/${g}/wagers`, storeAs: 'wagers'})));
    const wagers = useStoreState(state => state.firestore.data.wagers)
    console.log(wagers);
    return (
        <div>
            {wagers?.length === 0
                ? <div> Speeds and Feeds </div>
                : Object.values(wagers ?? {}).map(wager => <pre>{JSON.stringify(wager, null, 2)}</pre>)
            }
        </div>
    )
}