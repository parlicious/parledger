import styled, {css} from 'styled-components';
import {isEmpty, isLoaded, useFirestoreConnect} from 'react-redux-firebase';
import {useStoreActions, useStoreState} from 'easy-peasy';
import {AppCell} from '../pages/NewWagerPage';
import {MemberAndAmount} from './wagers/WagerDescription';
import {useHistory} from 'react-router-dom';
import {useEffect} from 'react';

const ActiveWagersContainer = styled.div`
  display: flex;
  margin-bottom: 1em;
  flex-direction: column;
  width: 100%;
`

export const WagerCardContainer = styled.div`
  background-color: ${props => props.theme.interfaceColor};
  color: ${props => props.theme.backgroundColor};
  padding: 1em;
  border-radius: 0.8em;
  max-width: 50em;
  margin: 0 1em 1em 0.5em;

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

export const MembersAndAmountGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

export const CardMember = styled.span`
  color: ${props => props.theme.invertedTextColor};
  align-self: center;
  grid-column: 1;
  line-height: 1.7;
`

export const CardOpponent = styled.span`
  color: ${props => props.theme.invertedTextColor};
  align-self: center;
  grid-column: 1;
  line-height: 1.7;
  font-size: .8em;
`

export const CardDate = styled.span`
  color: ${props => props.theme.invertedTextColor};
  align-self: center;
  line-height: 1;
  font-size: .8em;
  text-align: end;
  grid-column: 2;
`

export const CardAmount = styled.span`
  font-size: 1.4em;
  margin-left: 0.4em;
  font-weight: bold;
  grid-column: 2;
  grid-row-start: ${props => props.singleAmount ? 'span 2' : 'span 1'};
  display: flex;
  justify-content: flex-end;
  align-items: center;

  color: ${props => {
    if (props.winner === true) {
      return props.theme.successColor;
    } else if (props.winner === false) {
      return props.theme.dangerColor;
    } else {
      return props.theme.backgroundColor;
    }
  }}
`;

export const CardDescription = styled.summary`
  font-size: 0.6em;
  overflow: hidden;
  white-space: normal;
  display: -webkit-inline-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
  color: ${props => props.theme.invertedLowerContrastTextColor};
  max-width: 40em;
`

export const WagerCard = (props) => {
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
                <CardAmount singleAmount={wagersEqual}> ${wager.details.risk}</CardAmount>
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

const ActiveWagersComponent = styled.div`
  width: 100%;
`

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
        <ActiveWagersComponent>
            <h3> Active Wagers </h3>
            <ActiveWagersContainer>
                {bookedWagers?.map(it => <WagerCard wager={it}/>)}
            </ActiveWagersContainer>
        </ActiveWagersComponent>
    )
}