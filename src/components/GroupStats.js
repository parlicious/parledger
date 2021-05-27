import styled from 'styled-components';
import {useStoreActions, useStoreState} from 'easy-peasy';
import {isEmpty, isLoaded, useFirestoreConnect} from 'react-redux-firebase';
import React, {useEffect} from 'react';

const GroupStatsContainer = styled.div`
`

const GroupStatsTable = styled.table`
  background-color: ${props => props.theme.interfaceColor};
  color: ${props => props.theme.backgroundColor};
  width: 100%;
  padding: 1em;
  border-radius: 0.8em;
`

const GroupMemberTableRow = styled.tr`

`

const EarningsData = styled.td`
  text-align: end;
`


const formatCurrency = (num) => {
    const truncated = num?.toFixed(2);
    if(truncated < 0){
        return `-$${Math.abs(truncated)}`
    } else {
        return `$${truncated}`
    }
}

const GroupMemberRow = (props) => {
    const {member} = props;
    return (
        <GroupMemberTableRow>
            <td>{member.displayName}</td>
            <EarningsData>{formatCurrency(member.stats.pnl)}</EarningsData>
            <EarningsData>{formatCurrency(member.stats.committedAmount)}</EarningsData>
            <EarningsData>{formatCurrency(member.stats.lifetimeWagerAmount)}</EarningsData>
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
            <HeaderData number> Lifetime </HeaderData>
        </GroupStatsHeader>
    )
}

export const GroupStats = (props) => {
    const activeGroup = useStoreState(state => state.users.activeGroup);
    const profile =
    useFirestoreConnect([{
        collection: `groups/${activeGroup}/users`,
        storeAs: 'groupMembersWithStats',
        where: ['stats.pnl', '!=', 0],
        orderBy: ['stats.pnl', 'desc']
    }]);

    const groupMembersWithStats = useStoreState(state => state.firestore.ordered.groupMembersWithStats)

    const initGroup = useStoreActions(actions => actions.users.loadActiveGroup);

    useEffect(() => {
        if(isLoaded(profile) && !isEmpty(profile)){
            initGroup();
        }
    }, [profile])


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