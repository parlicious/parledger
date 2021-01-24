import styled from "styled-components";
import {useStoreState} from "easy-peasy";

const MemberAndAmountContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

const MemberAndAmount = ({wager, risk, toWin}) => {
    const auth = useStoreState(state => state.firebase.auth);
    const proposedBy = wager.proposedBy.uid === auth.uid ? "You" : wager.proposedBy.displayName;
    const proposedTo = wager.proposedTo?.uid === auth.uid ? "You" : wager.proposedTo?.displayName;

    if (wager.status === 'open') {
        return <WagerMembersContainer>
            {proposedBy} risked ${risk} where anyone can risk ${toWin || risk}
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
                {proposedBy} risked ${risk} and {proposedTo} risked ${toWin || risk}
            </WagerMembersContainer>
        )
    }
}

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


export const WagerDescription = ({eventDescription, pending, risk, toWin, wager}) => {
    const amountToWin = toWin || wager.details.toWin;
    const amountToRisk = risk || wager.details.risk;
    return (<WagerDescriptionRowContainer>
            <WagerDescriptionText>
                {eventDescription}
            </WagerDescriptionText>
            <MemberAndAmount {...{toWin: amountToWin, risk: amountToRisk, wager}}/>
        </WagerDescriptionRowContainer>
    );
}