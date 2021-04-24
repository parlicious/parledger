import styled from 'styled-components';
import {useStoreState} from 'easy-peasy';
import {useFirestoreConnect} from 'react-redux-firebase';
import React from 'react';

const GroupStatsContainer = styled.div`
  width: 100%;
  flex-basis: 50%;
  border-collapse: separate;
`

const GroupStatsTable = styled.table`
  width: 100%;
`

const GroupMemberTableRow = styled.tr`

`

const EarningsData = styled.td`
  text-align: end;
`


const formatCurrency = (num) => {
    return `$ ${num.toFixed(2)}`
}

const GroupMemberRow = (props) => {
    const {member} = props;
    return (
        <GroupMemberTableRow>
            <td>{member.displayName}</td>
            <EarningsData>{formatCurrency(member.stats.pnl)}</EarningsData>
            <EarningsData>{formatCurrency(member.stats.committedAmount)}</EarningsData>
        </GroupMemberTableRow>
    )
}

const HeaderData = styled.td`
  font-weight: bold;
  font-size: 1em;
  text-align: ${props => props.number ? 'end' : 'inherit'};
`

const GroupStatsHeader = styled.thead`
  border-bottom: 1px solid ${props => props.theme.interfaceColor};
`

const HeaderRow = (props) => {
    return (
        <GroupStatsHeader>
            <HeaderData> Name </HeaderData>
            <HeaderData number> Earnings </HeaderData>
            <HeaderData number> Active </HeaderData>
        </GroupStatsHeader>
    )
}

export const GroupStats = (props) => {
    const activeGroup = useStoreState(state => state.users.activeGroup);

    useFirestoreConnect([{
        collection: `groups/${activeGroup}/users`,
        storeAs: 'groupMembersWithStats',
        where: ['stats.pnl', '!=', 0],
        orderBy: ['stats.pnl', 'desc']
    }]);

    const groupMembersWithStats = useStoreState(state => state.firestore.ordered.groupMembersWithStats)
    console.log(groupMembersWithStats);

    return (
        <GroupStatsContainer>
            <h3> Stats </h3>
            <GroupStatsTable>
                <HeaderRow/>
                <tbody>
                {groupMembersWithStats?.map(it => <GroupMemberRow member={it}/>)}
                </tbody>
            </GroupStatsTable>
        </GroupStatsContainer>
    )
}