import {useStoreActions, useStoreState} from "easy-peasy";
import styled from 'styled-components';
import {InlineLink} from "../styles";
import {useEffect} from "react";
import {useFirestoreConnect} from "react-redux-firebase";
import {Wager} from "./wagers/Wager";

const PersonalWagersTitle = styled.div`
  max-width: 800px;
  margin: 1em auto;
`

export const PersonalWagers = ({}) => {
    const profile = useStoreState(state => state.firebase.profile);
    const confirmWagerAction = useStoreActions(actions => actions.wagers.respondToWager);
    const wagers = Object.values(profile?.wagers ?? {}).filter(wager => wager.status !== 'rejected');
    const confirmWager = async (wagerId, groupId, acceptWager) => {
        await confirmWagerAction({wagerId, groupId, accept: acceptWager})
    };

    return (
        <div>
            <PersonalWagersTitle>
                <h2>
                    Your Wagers
                </h2>
            </PersonalWagersTitle>
            {wagers.length > 0
                ? wagers.map(wager => <Wager key={wager.id} onConfirm={confirmWager} wager={wager}/>)
                : <PersonalWagersTitle>
                    You haven't made any wagers yet, maybe you should <InlineLink to={'/wagers/new'}>propose
                    one </InlineLink>
                </PersonalWagersTitle>
            }
        </div>
    )
}

export const useGroupWagers = () => {
    const profile = useStoreState(state => state.firebase.profile);
    useFirestoreConnect(profile?.groups?.map(g => ({collection: `groups/${g}/wagers`, storeAs: 'wagers'})));
    const loadGroupWagers = useStoreActions(actions => actions.wagers.loadGroupWagers);
    useEffect(() => {
        loadGroupWagers()?.catch(console.error);
    }, [loadGroupWagers])
    return useStoreState(state => state.wagers.groupWagers);
}

export const GroupWagers = ({}) => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect([{collection: `groups/${profile.groups[0]}/wagers`, storeAs: 'wagers'}]);
    const auth = useStoreState(state => state.firebase.auth)
    const rawWagers = useStoreState(state => state.firestore.data.wagers)
    const wagers = Object.values(rawWagers ?? {})
        .filter(wager => wager.status !== 'rejected')
        .filter(wager => wager.status !== 'open')

    const confirmWagerAction = useStoreActions(actions => actions.wagers.respondToWager);
    const confirmWager = async (wagerId, groupId, acceptWager) => {
        await confirmWagerAction({wagerId, groupId, accept: acceptWager})
    };

    if (wagers.length > 0) {
        return (
            <div>
                <PersonalWagersTitle>
                    <h3>
                        Group Wagers
                    </h3>
                </PersonalWagersTitle>
                {wagers.map(wager => <Wager key={wager.id} onConfirm={confirmWager} wager={wager}/>)}
            </div>
        )
    } else {
        return null;
    }
}

export const OpenWagers = ({}) => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect([{collection: `groups/${profile.groups[0]}/wagers`, storeAs: 'wagers'}]);
    const auth = useStoreState(state => state.firebase.auth)
    const rawWagers = useStoreState(state => state.firestore.data.wagers)
    const confirmWagerAction = useStoreActions(actions => actions.wagers.respondToWager);
    const wagers = Object.values(rawWagers ?? {})
        .filter(wager => wager.status === 'open')

    const confirmWager = async (wagerId, groupId, acceptWager) => {
        await confirmWagerAction({wagerId, groupId, accept: acceptWager})
    };

    if (wagers.length > 0) {
        return (
            <div>
                <PersonalWagersTitle>
                    <h3>
                        Marketplace
                    </h3>
                </PersonalWagersTitle>
                {wagers.map(wager => <Wager key={wager.id} onConfirm={confirmWager} wager={wager}/>)}
            </div>
        )
    } else {
        return (
            <div>
                <p>
                    No one has proposed an open wager, <InlineLink to={'/wagers/new'}> maybe you should?</InlineLink>
                </p>
            </div>
        )
    }
}