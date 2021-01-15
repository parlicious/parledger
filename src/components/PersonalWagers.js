import {useStoreActions, useStoreState} from "easy-peasy";
import {Event, EventCell} from "./SelectEvent";
import styled from 'styled-components';
import {buttonCss, ButtonLink, InlineLink} from "../styles";
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

  @media (max-width: 600px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
`

const WagerDescriptionText = styled.div`

`

const WagerAmountContainer = styled.div`
`

const WagerAmount = ({risk, toWin}) => {
    return (
        <WagerAmountContainer>
            ${risk}
        </WagerAmountContainer>
    );
}

const WagerDescriptionIcon = styled.i`
  padding-right: 0.5em;
`

const MemberAndAmountContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const MemberAndAmount = ({wager, risk, toWin}) => {
    const auth = useStoreState(state => state.firebase.auth);
    const proposedBy = wager.proposedBy.uid === auth.uid ? "You" : wager.proposedBy.displayName;
    const proposedTo = wager.proposedTo?.uid === auth.uid ? "You" : wager.proposedTo?.displayName;

    if (wager.status === 'open') {
        return <WagerMembersContainer>
            {proposedBy} risked ${risk} to win ${toWin || risk} from anyone who would accept the bet
        </WagerMembersContainer>
    }
    if (risk === toWin) {
        return <MemberAndAmountContainer>
            <WagerMembers wager={wager}/>
            <WagerAmount risk={risk} toWin={toWin}/>
        </MemberAndAmountContainer>
    } else {
        return (
            <WagerMembersContainer>
                {proposedBy} risked ${risk} to win ${toWin || risk} from {proposedTo}
            </WagerMembersContainer>
        )
    }
}

export const WagerDescriptionRow = ({eventDescription, pending, risk, toWin, wager}) => {
    const amountToWin = toWin || wager.details.toWin;
    const amountToRisk = risk || wager.details.risk;
    return (<WagerDescriptionRowContainer>
            <WagerDescriptionText>
                {pending
                    ? <span>
                    <WagerDescriptionIcon title="This wager is pending" className="fas fa-user-clock"/>
                        {'  '}
                </span>
                    : <span>
                        <WagerDescriptionIcon title="This wager was confirmed" className="fas fa-check-circle"/>
                        {'  '}
                    </span>}

                {eventDescription}
            </WagerDescriptionText>
            <MemberAndAmount {...{toWin: amountToWin, risk: amountToRisk, wager}}/>
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
  padding-right: 0.5em;
  justify-content: center;
  align-items: center;
`

const WagerMembers = ({wager}) => {
    const auth = useStoreState(state => state.firebase.auth);
    const proposedBy = wager.proposedBy.uid === auth.uid ? "You" : wager.proposedBy.displayName;
    const proposedTo = wager.proposedTo?.uid === auth.uid ? "You" : wager.proposedTo?.displayName || 'Anyone';

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
    } else if (wager.status === 'pending' && wager.proposedTo?.uid === auth.uid) {
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
    } else if (wager.status === 'open' && wager.proposedBy.uid !== auth.uid) {
        return (
            <ConfirmWagerContainer>
                <ConfirmWagerText>
                    <i className="fas fa-exclamation-circle"/> {wager.proposedBy.displayName} offered this bet to anyone.
                </ConfirmWagerText>
                <WagerActionsGroup>
                    <ConfirmButton onClick={confirm(true)}>
                        Accept it
                    </ConfirmButton>
                </WagerActionsGroup>
            </ConfirmWagerContainer>
        )
    } else if (wager.proposedBy.uid === auth.uid && (wager.status === 'pending' || wager.status === 'open')) {
        return (
            <ConfirmWagerContainer>
                <ConfirmWagerText> <i className="fas fa-exclamation-circle"/> You proposed this bet
                    to {wager.proposedTo?.displayName} </ConfirmWagerText>
                <WagerActionsGroup>
                    <RejectButton onClick={confirm(false)}>
                        Rescind it
                    </RejectButton>
                </WagerActionsGroup>
            </ConfirmWagerContainer>
        )
    } else if (wager.proposedBy.uid === auth.uid || wager.proposedTo?.uid === auth.uid) {
        const linkOptions = {
            pathname: '/wagers/manage',
            state: wager
        };

        // return (
        //     <ButtonLink
        //         to={linkOptions}>
        //         Manage this wager
        //     </ButtonLink>
        // )

        return null;
    } else {
        return null;
    }
}

const membersFromWager = (wager) => {
    return {
        [wager.details.outcome]: wager.proposedBy,
        [(wager.details.outcome + 1) % 2]: wager.proposedTo
    }
}

const CustomWagerContainer = styled.div`
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 0.3em;
  max-width: 800px;
  margin: 1em auto;
`

const CustomWagerDetails = styled.div`
  padding: 1em;
`

const Wager = (props) => {
    const {wager} = props;
    if (wager.type === 'BOVADA') {
        const selection = wager.details.selection || wager.details;
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
    } else if (wager.type === 'CUSTOM') {
        return (
            <CustomWagerContainer>
                <WagerDescriptionRow
                    wager={wager}
                    pending={wager.status === 'pending'}
                    eventDescription={"Custom Wager"}
                    risk={wager.details.risk}
                    toWin={wager.details.toWin}
                />
                <CustomWagerDetails>
                    {wager.details.description}
                </CustomWagerDetails>
                <ConfirmWagerRow {...props}/>
            </CustomWagerContainer>
        )
    }

    return null;
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
    const confirmWagerAction = useStoreActions(actions => actions.wagers.respondToWager);
    const wagers = Object.values(rawWagers ?? {})
        .filter(wager => wager.status !== 'rejected')
        .filter(wager => wager.proposedTo?.uid !== auth.uid && wager.proposedBy?.uid !== auth.uid)

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