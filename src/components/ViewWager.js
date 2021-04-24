import {useStoreActions, useStoreState} from 'easy-peasy';
import {useLocation} from 'react-router-dom';
import {Wager} from './wagers/Wager';

export const ViewWager = (props) => {
    const savedWager = useStoreState(state => state.wagers.activeWager);
    let location = useLocation();
    const activeWager = location.state || savedWager;


    return (
        <Wager wager={activeWager}/>
    )
}