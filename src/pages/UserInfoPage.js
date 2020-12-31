import {useStoreState} from "easy-peasy";
import {useFirestoreConnect} from "react-redux-firebase";

export const UserInfoPage = () => {
    useFirestoreConnect([{collectionGroup: "wagers"}]);
    const profile = useStoreState(state => state.firebase.profile)
    const results = useStoreState(state => state.firestore.data.wagers)

    return <pre>{JSON.stringify(profile, null, 2)}</pre>
}