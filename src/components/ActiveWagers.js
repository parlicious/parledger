import styled, {css} from 'styled-components';
import {useFirestoreConnect} from 'react-redux-firebase';
import {useStoreState} from 'easy-peasy';
import {AppCell} from '../pages/NewWagerPage';
import {MemberAndAmount} from './wagers/WagerDescription';
import {useHistory} from 'react-router-dom';

const horizontalActiveWagersContainerStyles = css`
  flex-direction: row;
  justify-content: space-between;
  overflow-x: scroll;
  white-space: nowrap;
`;

const verticalActiveWagersContainerStyles = css`
  flex-direction: column;
  justify-content: space-between;
  overflow-x: scroll;
  white-space: nowrap;
`;

const ActiveWagersContainer = styled.div`
  display: flex;
  margin-bottom: 1em;
  ${props => props.direction === 'horizontal'
          ? horizontalActiveWagersContainerStyles
          : verticalActiveWagersContainerStyles};
`

const WagerCardContainer = styled.div`
  background-color: ${props => props.theme.interfaceColor};
  color: ${props => props.theme.backgroundColor};
  padding: 1em;
  border-radius: 0.8em;
  max-width: 50em;
  margin: 0.5em;

  //width: calc(30% - 3em);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  :hover {
    background-color: ${props => props.theme.interfaceColor + 'cf'};
    color: ${props => props.theme.invertedLowerContrastTextColor};
    cursor: pointer;
  }
`

const MembersAndAmountGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const CardMember = styled.span`
  color: ${props => props.theme.invertedTextColor};
  align-self: center;
  grid-column: 1;
  line-height: 1.7;
`

const CardAmount = styled.span`
  font-size: 1.4em;
  margin-left: 0.4em;
  font-weight: bold;
  grid-column: 2;
  grid-row-start: ${props => props.wagersEqual ? 'span 2' : 'span 1'};
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

const CardDescription = styled.article`
  font-size: 0.6em;
  overflow: hidden;
  white-space: normal;
  display: -webkit-inline-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
  color: ${props => props.theme.invertedLowerContrastTextColor};
  max-width: 40em;
`

const WagerCard = (props) => {
    const {wager} = props;
    const wagersEqual = wager.details.risk === wager.details.toWin;
    const history = useHistory();

    const linkOptions = {
        pathname: `/wagers/view/${wager.id}`,
        state: wager
    };

    return (
        <WagerCardContainer onClick={() => history.push(linkOptions.pathname, linkOptions.state)}>
            <MembersAndAmountGrid>
                <CardMember> {wager.proposedBy.displayName} </CardMember>
                <CardAmount wagersEqual={wagersEqual}> ${wager.details.risk}</CardAmount>
                <CardMember> {wager.proposedTo.displayName} </CardMember>
                {!wagersEqual
                    ? <CardAmount> ${wager.details.toWin}</CardAmount>
                    : null}
            </MembersAndAmountGrid>
            <CardDescription>
                {wager.details.description || 'No Description'}
            </CardDescription>
        </WagerCardContainer>
    )
}

export const ActiveWagers = (props) => {
    const profile = useStoreState(state => state.firebase.profile)
    const activeGroup = useStoreState(state => state.users.activeGroup);
    useFirestoreConnect({collection: `groups/${activeGroup}/users`, storeAs: 'groupMembers'});

    useFirestoreConnect([{
        collection: `groups/${activeGroup}/wagers`,
        storeAs: 'bookedWagers',
        where: ['status', '==', 'booked'],
        orderBy: ['lastUpdatedAt', 'desc']
    }]);

    const bookedWagers = useStoreState(state => state.firestore.ordered.bookedWagers)


    return (
        <div>
            <h3> Active Wagers </h3>
            <ActiveWagersContainer direction='vertical'>
                {bookedWagers?.map(it => <WagerCard wager={it}/>)}
            </ActiveWagersContainer>
        </div>
    )
}