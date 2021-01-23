import styled from "styled-components";
import {BovadaWager} from "./BovadaWager";
import {CustomWager} from "./CustomWager";

const WagerStatus = styled.div`
    max-width: 70%;
`

const ManageWagerLinkContainer = styled.div`
  padding: 0.4em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  
`

export const membersFromWager = (wager) => {
    return {
        [wager.details.outcome]: wager.proposedBy,
        [(wager.details.outcome + 1) % 2]: wager.proposedTo
    }
}

export const Wager = (props) => {
    const {wager} = props;
    if (wager.type === 'BOVADA') {
        return <BovadaWager {...props}/>
    } else if (wager.type === 'CUSTOM') {
        return <CustomWager {...props}/>
    }
    return null;
}