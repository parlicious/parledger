import {ButtonLink, InlineLink} from '../styles';
import {useFirestoreConnect} from 'react-redux-firebase';
import {useStoreState} from 'easy-peasy';
import styled from 'styled-components';


const PoolOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const PoolsLink = styled(ButtonLink)`
  font-size: 2em;
  font-weight: bold;
`

export const SelectPoolsPage = (props) => {
    const profile = useStoreState(state => state.firebase.profile)
    const activeGroup = useStoreState(state => state.users.activeGroup);
    useFirestoreConnect([{collection: `groups/${activeGroup}/pools`, storeAs: 'pools'}]);
    const pools = useStoreState(state => state.firestore.data.pools) ?? {};

    return (
        <PoolOptionsContainer>
            {Object.values(pools).map(it => <PoolsLink to={`/pools/${it.id}`}> {it.name} </PoolsLink>)}
        </PoolOptionsContainer>
    )
}