import {useStoreActions, useStoreState} from 'easy-peasy';
import {useLocation, useParams} from 'react-router-dom';
import {Wager} from './wagers/Wager';
import {useState} from 'react';
import {LoadingImage, SplashScreen} from './SplashScreen';
import {useFirestoreConnect} from 'react-redux-firebase';

export const ViewWager = (props) => {
    let {wagerId} = useParams();
    const activeGroup = useStoreState(state => state.users.activeGroup);
    const activeWager = useStoreState(state => state.firestore.data.activeWager);

    const state = useStoreState(state => state.firestore);

    useFirestoreConnect([{
        collection: `groups/${activeGroup}/wagers`,
        doc: wagerId,
        storeAs: 'activeWager',
    }]);

    if(activeWager){
        return <Wager wager={activeWager}/>
    } else {
        return <SplashScreen/>
    }
}