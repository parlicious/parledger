import {useStoreActions, useStoreState} from "easy-peasy";
import {Event} from "./SelectEvent";
import React, {useEffect, useState} from "react";
import {AppCell} from "../pages/NewWagerPage";
import {useLocation} from 'react-router-dom';
import {Wager, WagerDescriptionRow} from "./PersonalWagers";
import styled from 'styled-components';
import {buttonCss} from "../styles";
import {useManageWager} from "../stores/wagers";
import {ErrorMessage} from "../pages/JoinGroupPage";

const BetActionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 0.5rem;
  padding: 0 3em;
`

const NormalButton = styled.button`
  ${buttonCss};
  font-size: 1em;

  background: transparent;
  color: white;
  border: 1px solid white;

  :hover {
    color: #ffffffaa;
  }
`

export const statusDescription = {
    'pending': 'Pending',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'booked': 'Booked',
    'resolutionProposed': 'Winner Proposed',
    'resolved': 'Winner Accepted',
    'paid': 'Paid',
    'cancellationProposed': 'Cancellation Proposed'
}

export const statusIcons = {
    'pending': <i className="far fa-clock"/>,
    'rejected': <i className="fas fa-times-circle"/>,
    'cancelled': <i className="fas fa-times-circle"/>,
    'booked': <i className="fas fa-check-circle"/>,
    'resolutionProposed': <i className="fas fa-question-circle"/>,
    'resolved': <i className="fas fa-hand-holding-usd"/>,
    'paid': <i className="fas fa-trophy"/>,
    'cancellationProposed': <i className="fas fa-question-circle"/>
}

const betActions = {
    'CANCEL': {
        type: 'CANCEL',
        actionableStates: ['all'],
        disallowedStates: ['paid'],
        title: 'Request to cancel',
        confirm: 'Are you sure you want to cancel?'
    },
    'CONFIRM_CANCEL': {
        type: 'CONFIRM_CANCEL',
        actionableStates: ['cancellationProposed'],
        disallowedStates: [],
        title: 'Request to cancel',
        confirm: 'Are you sure you want to cancel?'
    },
    'WIN': {
        type: 'WIN',
        actionableStates: ['booked'],
        disallowedStates: [],
        betInPast: true,
        title: 'I won the bet and have been paid',
        confirm: 'Confirm you have been paid for winning the bet?',
    },
    'LOSS': {
        type: 'LOSS',
        actionableStates: ['booked'],
        disallowedStates: [],
        betInPast: true,
        title: 'I lost the bet and paid out',
        confirm: 'Confirm you lost the bet and paid the winner?'
    },
    'PUSH': {
        type: 'PUSH',
        actionableStates: ['booked'],
        disallowedStates: [],
        betInPast: true,
        title: 'No one won the bet',
        confirm: 'Request to close the bet as a push (no one wins) ?'
    },
    'PAID': {
        type: 'PAID',
        actionableStates: ['resolutionProposed'],
        disallowedStates: [],
        title: 'The bet has been paid out',
        resolutionNotProposedByMe: true,
        confirm: 'Confirm the bet was paid'
    }
}

const ConfirmBetActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const ManageWager = ({}) => {
    const auth = useStoreState(state => state.firebase.auth);
    const savedWager = useStoreState(state => state.wagers.activeWager);
    const setActiveWager = useStoreActions(actions => actions.wagers.setActiveWager);
    let location = useLocation();
    const activeWager = location.state || savedWager;
    const [selectedAction, setSelectedAction] = useState(null);

    const status = activeWager.status;
    const isWinner = activeWager.winner?.uid === auth.uid;

    const actions = Object.values(betActions)
        .filter(it => it.actionableStates.includes(status) || it.actionableStates.includes('all'))
        .filter(it => !it.disallowedStates.includes(status))
        .filter(it => it.resolutionNotProposedByMe ? activeWager.resolutionProposedBy.uid !== auth.uid : true)

    const {submitting, apiError, apiSuccess, save} = useManageWager();

    useEffect(() => {
        setActiveWager(activeWager);
    }, [activeWager])

    const event = activeWager.details.event;
    return (
        <AppCell>
            <Wager wager={activeWager}/>
            <h3> Manage your bet</h3>
            <p> Status: {statusDescription[activeWager.status]}</p>


            {!selectedAction
                ? <React.Fragment>
                    <BetActionsContainer>
                        {actions.map(it => <NormalButton onClick={() => setSelectedAction(it)}>
                            {it.title}
                        </NormalButton>)}
                    </BetActionsContainer>
                    {actions.length > 0
                        ? <small> Actions will need to be confirmed by the other member(s) of the bet </small>
                        : <span> You can't do anything with this bet</span>}
                </React.Fragment>
                : submitting
                    ? <div>Loading</div>
                    : apiSuccess
                        ? <p>{apiSuccess}</p>
                        : apiError
                            ? <ErrorMessage> {apiError}</ErrorMessage>
                            : <ConfirmBetActionContainer>
                                {selectedAction.type === 'CONFIRM_WINNER'
                                    ? <div>Confirm that {activeWager.winner?.displayName} won the bet?</div>
                                    : selectedAction?.confirm ?? 'Are you sure?'}
                                <NormalButton
                                    onClick={() => save({
                                        wager: activeWager,
                                        action: selectedAction
                                    })}> Yes </NormalButton>
                            </ConfirmBetActionContainer>
            }
        </AppCell>
    )

}