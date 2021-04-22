import styled from "styled-components";
import {useStoreState} from "easy-peasy";
import {useState} from 'react';
import {ButtonLink, ConfirmButton, RejectButton} from "../../styles";
import {statusDescription, statusIcons} from "../ManageWager";

const WagerActionsGroup = styled.div`
  font-size: 0.8em;
  button {
    font-size: 0.8em;  
  }
`

const ConfirmWagerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  border-radius: 0 0 0.3em 0.3em;
  border-top: 1px solid ${props => props.theme.interfaceColor};
  color: ${props => props.theme.textColor};
`

const ConfirmWagerText = styled.span`
  margin: 1em;
`

export const InlineWagerActions = ({onConfirm, wager}) => {
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
                        Confirm
                    </ConfirmButton>
                    <RejectButton onClick={confirm(false)}>
                        Reject
                    </RejectButton>
                </WagerActionsGroup>
            </ConfirmWagerContainer>
        )
    } else if (wager.status === 'open' && wager.proposedBy.uid !== auth.uid) {
        return (
            <ConfirmWagerContainer>
                <ConfirmWagerText>
                    <i className="fas fa-exclamation-circle"/> {wager.proposedBy.displayName} offered this bet to
                    anyone.
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
            pathname: `/wagers/manage/${wager.id}`,
            state: wager
        };

        return (
            <ConfirmWagerContainer>
                <ConfirmWagerText>
                    {statusIcons[wager.status]} {statusDescription[wager.status]}
                </ConfirmWagerText>
                <WagerActionsGroup>
                    {wager.status !== 'paid' && <ButtonLink to={linkOptions}>
                        Manage
                    </ButtonLink>}
                </WagerActionsGroup>
            </ConfirmWagerContainer>
        )

        return null;
    } else {
        return null;
    }
}