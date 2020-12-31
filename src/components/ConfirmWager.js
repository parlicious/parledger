import {Event, Outcome, TitleRow} from "./SelectEvent";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import styled from "styled-components";
import {useStoreActions, useStoreState} from "easy-peasy";


const OutcomeDescription = ({outcome}) => {
    console.log(outcome);
    if (outcome) {
        return (
            <span>
                {outcome.description}
                {outcome.price.handicap && <span>
                    {' ' + outcome.price.handicap + ' '}
                </span>}
                {!outcome.price.handicap && <span>
                    {' ' + outcome.price.american + ' '}
                </span>}
            </span>
        )
    } else {
        return <span/>
    }
}

const EventDescription = ({event, market, outcome}) => {
    const selectedMarket = event.displayGroups[0].markets[market];
    const selectedOutcome = selectedMarket.outcomes[outcome];
    const eventTime = new Date(event.startTime)
    return (
        <div>
            <div> For {event.description} on {eventTime.toLocaleDateString()} at {eventTime.toLocaleTimeString()}</div>
            <div>you picked <OutcomeDescription outcome={selectedOutcome}/> in a {selectedMarket.description} bet.</div>
        </div>
    )
};

const BetAmountButton = styled.button`
  border-radius: 0.3em;
  color: white;
  font-size: 1.2em;
  padding: 0.3em;
  border: 1px solid white;
  background: none;

  width: 100px;
  margin: 1em;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

const BetAmountRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const ErrorMessage = styled.div`
  color: #FF4040;
`

const SuccessMessage = styled.div`
  color: #00C781;
`

export const ConfirmWager = ({selection, opponent}) => {
    const {handleSubmit, control, errors, register} = useForm();
    const profile = useStoreState(state => state.firebase.profile);
    const createWager = useStoreActions(actions => actions.wagers.createWager);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    const saveWager = async (betAmount) => {
        const wager = {
            proposedTo: opponent.uid,
            groupId: profile.groups[0],
            details: {
                selection,
                risk: betAmount,
                win: betAmount
            }
        }

        try {
            await createWager(wager);
            setApiSuccess("Wager was proposed!")
        } catch (error) {
            setApiError(error.message);
        }
    }

    return (
        <div>
            <div>
                Confirm your proposed bet with {opponent.displayName}
            </div>
            <TitleRow name={selection.event.description}/>
            <Event eventSelected={() => {
            }} event={selection.event} selectedMarket={selection.market} selectedOutcome={selection.outcome}/>
            {apiSuccess
                ? <SuccessMessage>{apiSuccess}</SuccessMessage>
                : <div>
                    How much to bet?
                    <BetAmountRow>
                        {[10, 20, 50, 100].map(it => <BetAmountButton
                            onClick={() => saveWager(it)}>${it}</BetAmountButton>)}
                    </BetAmountRow>
                </div>}
            {apiError && <ErrorMessage>
                {apiError}
            </ErrorMessage>}
        </div>
    )
}