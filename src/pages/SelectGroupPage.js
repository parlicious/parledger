import {AppCell} from './NewWagerPage';
import {useStoreActions, useStoreState} from 'easy-peasy';
import {useFirestoreConnect} from 'react-redux-firebase';
import firebase from 'firebase';
import styled from 'styled-components';
import {PrimaryButton} from '../styles';
import {useEffect, useState} from 'react';

const GroupInfoContainer = styled.div`
  border-radius: 0.3em;
  background: ${props => props.theme.interfaceColor};
  margin: 0.5em;
  color: #0f2027;
  padding: 0.5em;
  
  cursor: pointer;
  :hover {
    background: #dddddd;
  }
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const GroupName = styled.span`
  font-size: 1.5em;
  font-weight: bold;
`

const JoinLink = styled.pre`

`

const GroupInfo = (props) => {
    const [copied, setCopied] = useState(false);
    const setGroup = useStoreActions(actions => actions.users.setActiveGroup);
    const {group} = props;

    useEffect(() => {
        if(copied){
            setTimeout(() => setCopied(false), 500);
        }
    }, [copied])

    const copyJoinCode = async () => {
        await navigator.clipboard.writeText(`https://ledger.bet/groups/join/${group.codes[0].value}`)
        setCopied(true);
    }

    const selectGroup = () => {
        setGroup(group.groupId);
    }

    return (
        <GroupInfoContainer onClick={selectGroup}>
            <GroupName>
                {group.name}
            </GroupName>
            <PrimaryButton onClick={copyJoinCode}>
                <i className="fas fa-copy"></i> &nbsp;
                {copied ? 'Copied!' : 'Copy Invite Link'}
            </PrimaryButton>
        </GroupInfoContainer>
    )
}

export const SelectGroupPage = (props) => {
    const profile = useStoreState(state => state.firebase.profile);
    useFirestoreConnect([{
        collection: `groups`,
        where: [firebase.firestore.FieldPath.documentId(), 'in', profile.groups],
        storeAs: 'groups'
    }]);

    const groups = useStoreState(state => state.firestore.data.groups)
    const groupsArray = Object.keys(groups || {}).map(k => ({...groups[k], groupId: k}));

    return (
        <AppCell>
            <h2> Select a Group </h2>
            {groupsArray.map(it => <GroupInfo group={it}/>)}
        </AppCell>
    )
}