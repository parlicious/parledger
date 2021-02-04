import {InlineLink} from '../styles';
import {useFirestoreConnect} from 'react-redux-firebase';
import {useStoreState} from 'easy-peasy';


export const SelectPoolsPage = (props) => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect([{collection: `groups/${profile.groups[0]}/pools`, storeAs: 'pools'}]);
    const pools = useStoreState(state => state.firestore.data.pools) ?? {};

    return (
        <div>
            {Object.values(pools).map(it => <InlineLink to={`/pools/${it.id}`}> {it.name} </InlineLink>)}
        </div>
    )
}