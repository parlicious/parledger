import styled from 'styled-components';
import {useFirestoreConnect} from 'react-redux-firebase';
import {useStoreState} from 'easy-peasy';
import {
    CardAmount, CardDate,
    CardDescription,
    CardMember, CardOpponent,
    MembersAndAmountGrid,
    WagerCard,
    WagerCardContainer
} from '../ActiveWagers';
import {getLedgerItems} from '../services/wager.service'
import {useHistory} from 'react-router-dom';


const GroupLedgerContainer = styled.div`
  grid-column: span 2;
  
  @media(max-width: 768px){
    grid-column: span 1;
  }
`

const LedgerTable = styled.table`

`

const LedgerTableHeader = styled.thead`
`

const LedgerTableRow = styled.tr`

`

const getLedgerAmountSign = winner => {
    if (winner === true) {
        return "+";
    } else if (winner === false) {
        return "-";
    } else {
        return "";
    }
};

const getLedgerOpponentPreposition = winner => {
    if (winner === true) {
        return "from";
    } else if (winner === false) {
        return "to";
    } else {
        return "pending with";
    }
};

const LedgerItem = (props) => {
    const {ledgerItem} = props;

    const history = useHistory();

    const linkOptions = {
        pathname: `/wagers/view/${ledgerItem.wager.id}`,
        state: ledgerItem.wager
    };

    return (
        <WagerCardContainer onClick={() => history.push(linkOptions.pathname, linkOptions.state)}>
            <MembersAndAmountGrid>
                <CardMember singleMember> {ledgerItem.displayName} </CardMember>
                <CardAmount singleAmount winner={ledgerItem.winner}>
                    {getLedgerAmountSign(ledgerItem.winner)}${ledgerItem.amount}
                </CardAmount>
                <CardOpponent> {getLedgerOpponentPreposition(ledgerItem.winner)} {ledgerItem.opponentName} </CardOpponent>
                <CardDate>
                    {ledgerItem.lastUpdatedAt.toLocaleDateString()}
                </CardDate>
            </MembersAndAmountGrid>
            <CardDescription>
                {ledgerItem.wager.details.description || ledgerItem.wager?.details?.event?.description || 'No Description'}
            </CardDescription>
        </WagerCardContainer>
    )
}

export const GroupLedger = (props) => {
    const activeGroup = useStoreState(state => state.users.activeGroup);

    useFirestoreConnect([{
        collection: `groups/${activeGroup}/wagers`,
        storeAs: 'allWagers',
        where: ['status', '!=', 'rejected'],
        orderBy: [
            ['status'],
            ['lastUpdatedAt', 'desc'],
        ]
    }]);

    useFirestoreConnect({
        collection: `groups/${activeGroup}/users`,
        storeAs: 'groupMembers'
    });

    const allWagers = useStoreState(state => state.firestore.ordered.allWagers) ?? [];
    const sortedWagers = [...allWagers].sort(
        (a, b) => b.lastUpdatedAt.seconds - a.lastUpdatedAt.seconds);
    const groupMembers = useStoreState(state => state.firestore.data.groupMembers)

    return (
        <GroupLedgerContainer>
            <h3> Ledger </h3>
            {sortedWagers?.flatMap(getLedgerItems).map(it =>
                <LedgerItem key={it.id} ledgerItem={it}/>
            )}
        </GroupLedgerContainer>
    )
}