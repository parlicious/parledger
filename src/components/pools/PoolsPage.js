import {useParams} from 'react-router-dom';
import {useStoreState} from 'easy-peasy';
import {SquaresPool} from './SquaresPool';
import {useFirestoreConnect} from 'react-redux-firebase';
import {LoadingImage} from '../SplashScreen';

export const PoolsPage = (props) => {
    let { poolId } = useParams();
    const profile = useStoreState(state => state.firebase.profile);
    useFirestoreConnect([{collection: `groups/${profile.groups[0]}/pools`, storeAs: 'pools'}]);
    const pools = useStoreState(state => state.firestore.data.pools);

    if(!pools){
        return <LoadingImage/>
    }

    const pool = pools[poolId];


    if(pool.optionsType === 'squares'){
        return <SquaresPool pool={pool}/>
    } else {
        return <div>
            Whoops, I don't know how to handle this pool.
        </div>
    }
}