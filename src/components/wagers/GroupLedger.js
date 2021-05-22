import styled from 'styled-components';
import {useFirestoreConnect} from 'react-redux-firebase';
import {useStoreState} from 'easy-peasy';


const GroupLedgerContainer = styled.div`
    grid-column: span 2;
`

const LedgerTable = styled.table`

`

const LedgerTableHeader = styled.thead`
`

const LedgerTableRow = styled.tr`
    
`

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

    const allWagers = useStoreState(state => state.firestore.ordered.allWagers)

    return (
        <GroupLedgerContainer>
            <LedgerTable>
                <LedgerTableHeader>
                    <td> Desc </td>
                </LedgerTableHeader>
                <tbody>
                    {allWagers?.map(it =>
                        <LedgerTableRow>
                            <td>{it.details.description}</td>
                        </LedgerTableRow>
                    )}
                </tbody>
            </LedgerTable>
        </GroupLedgerContainer>
    )
}