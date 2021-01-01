import {useStoreActions, useStoreState} from "easy-peasy";
import {Event} from "./SelectEvent";
import styled from 'styled-components';
import {buttonCss, InlineLink} from "../styles";
import {useState, useEffect} from "react";
import {useFirestoreConnect} from "react-redux-firebase";
import {Link} from "react-router-dom";

const WagerDescriptionRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.5em;

  font-size: 1em;
  border-radius: 0.3em 0.3em 0 0;
  background: white;
  color: #0F2027;
`

const WagerDescriptionText = styled.div`

`

const WagerAmountContainer = styled.div`
`

const WagerAmount = ({risk, toWin}) => {
    if (toWin) {

    } else {
        return (
            <WagerAmountContainer>
                ${risk}
            </WagerAmountContainer>
        );
    }
}

const WagerDescriptionRow = ({eventDescription, pending, risk, toWin, wager}) => {
    return (<WagerDescriptionRowContainer>
            <WagerDescriptionText>
                {pending
                    ? <span>
                    <i title="This wager is pending" className="fas fa-user-clock"/>
                        {'  '}
                </span>
                    : <span>
                        <i title="This wager was confirmed" className="fas fa-check-circle"/>
                        {'  '}
                    </span>}

                {eventDescription}
            </WagerDescriptionText>
            <WagerMembers wager={wager}/>
            <WagerAmount risk={risk} toWin={toWin}/>
        </WagerDescriptionRowContainer>
    );
}


const ConfirmButton = styled.button`
  ${buttonCss};
  background: #3cc921;

  :hover {
    background: #3cc921cF;
  }
`

const RejectButton = styled.button`
  ${buttonCss};
  background: #FF4040;

  :hover {
    background: #FF4040cF;
    cursor: pointer;
  }
`

const WagerActionsGroup = styled.div`
  text-align: end;
`

const ConfirmWagerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  border-radius: 0 0 0.3em 0.3em;
  background: white;
  color: #0F2027;
`

const ConfirmWagerText = styled.span`
  margin: 1em;
`

const WagerMembersContainer = styled.span`
  display: flex;
  padding: 0 0.3em;
  justify-content: center;
  align-items: center;
`

const WagerMembers = ({wager}) => {
    const auth = useStoreState(state => state.firebase.auth);
    const proposedBy = wager.proposedBy.uid === auth.uid ? "You" : wager.proposedBy.displayName;
    const proposedTo = wager.proposedTo.uid === auth.uid ? "You" : wager.proposedTo.displayName;

    return (
        <WagerMembersContainer>
            {proposedBy} vs. {proposedTo}
        </WagerMembersContainer>
    )
}

const ConfirmWagerRow = ({onConfirm, wager}) => {
    const auth = useStoreState(state => state.firebase.auth);
    const [loading, setLoading] = useState(false);

    const confirm = (accept) => async () => {
        console.log('acting')
        setLoading(true);
        try {
            await onConfirm(wager.id, wager.groupId, accept);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <ConfirmWagerContainer>
                Loading ...
            </ConfirmWagerContainer>
        )
    } else if (wager.status === 'pending' && wager.proposedTo.uid === auth.uid) {
        return (
            <ConfirmWagerContainer>
                <ConfirmWagerText>
                    <i className="fas fa-exclamation-circle"/> {wager.proposedBy.displayName} proposed this bet to you.
                </ConfirmWagerText>
                <WagerActionsGroup>
                    <ConfirmButton onClick={confirm(true)}>
                        Confirm it
                    </ConfirmButton>
                    <RejectButton onClick={confirm(false)}>
                        Reject it
                    </RejectButton>
                </WagerActionsGroup>
            </ConfirmWagerContainer>
        )
    } else if (wager.status === 'pending' && wager.proposedBy.uid === auth.uid) {
        return (
            <ConfirmWagerContainer>
                <ConfirmWagerText> <i className="fas fa-exclamation-circle"/> You proposed this bet
                    to {wager.proposedTo.displayName} </ConfirmWagerText>
                <WagerActionsGroup>
                    <RejectButton onClick={confirm(false)}>
                        Rescind it
                    </RejectButton>
                </WagerActionsGroup>
            </ConfirmWagerContainer>
        )
    } else {
        return null;
    }
}

const membersFromWager = (wager) => {
    return {
        [wager.details.selection.outcome]: wager.proposedBy,
        [(wager.details.selection.outcome + 1) % 2]: wager.proposedTo
    }
}

const Wager = (props) => {
    const {wager} = props;
    if (wager.type === 'BOVADA') {
        const selection = wager.details.selection;
        return <Event
            wagerMembers={membersFromWager(wager)}
            eventSelected={() => {
            }}
            headerComponent={
                <WagerDescriptionRow
                    wager={wager}
                    pending={wager.status === 'pending'}
                    eventDescription={selection.event.description}
                    risk={wager.details.risk}/>
            }
            footerComponent={<ConfirmWagerRow {...props} />}
            event={selection.event}
            selectedMarket={selection.market}
            selectedOutcome={selection.outcome}
        />
    }
}

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
                <h3>
                    Your Wagers
                </h3>
            </PersonalWagersTitle>
            {wagers.length > 0
                ? wagers.map(wager => <Wager onConfirm={confirmWager} wager={wager}/>)
                : <PersonalWagersTitle>
                    You haven't made any wagers yet, maybe you should <InlineLink to={'/wagers/new'}>propose one </InlineLink>
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
    useFirestoreConnect([{collectionGroup: "wagers"}]);
    const auth = useStoreState(state => state.firebase.auth)
    const rawWagers = useStoreState(state => state.firestore.data.wagers)
    const wagers = Object.values(rawWagers ?? {})
        .filter(wager => wager.status !== 'rejected')
        .filter(wager => wager.proposedTo.uid !== auth.uid && wager.proposedBy.uid !== auth.uid)

    if (wagers.length > 0) {
        return (
            <div>
                <PersonalWagersTitle>
                    <h3>
                        Group Wagers
                    </h3>
                </PersonalWagersTitle>
                {wagers.map(wager => <Wager wager={wager}/>)}
            </div>
        )
    } else {
        return null;
    }
}