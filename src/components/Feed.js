import {Box} from "grommet";
import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";

export const Feed = () => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect(profile?.groups?.map(g => ({collection: `groups/${g}/wagers`, storeAs: 'wagers'})));
    const wagers = useStoreState(state => state.firestore.data.wagers)
    console.log(wagers);
    return (
        <Box>
            {wagers?.length === 0
                ? <Box> Speeds and Feeds </Box>
                : Object.values(wagers ?? {}).map(wager => <pre>{JSON.stringify(wager, null, 2)}</pre>)
            }
        </Box>
    )
}