import React, {useState} from "react";
import {useForm} from "react-hook-form";
import styled, {css} from "styled-components";
import {useStoreState} from "easy-peasy";
import {generateWagerFromSelection, useSaveWager} from "../stores/wagers";
import {Redirect} from 'react-router-dom';
import {ProposeCustomWager} from "./ProposeCustomWager";
import {TitleRow} from "./events/commonEventComponents";
import {GameEvent} from "./events/GameEvent";
import {ProposedEvent} from "./wagers/ProposedEvent";
import {BovadaWager} from "./wagers/BovadaWager";


const OutcomeDescription = ({outcome}) => {
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
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
`

const ErrorMessage = styled.div`
  color: #FF4040;
`

const SuccessMessage = styled.div`
  color: #00C781;
`

export const membersFromWager = (selection, profile, opponent) => {
    return {
        [selection.outcome]: profile,
        [(selection.outcome + 1) % 2]: opponent
    }
}

const CustomAmountButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const CustomAmountForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 2.5rem;
  --border-color: white;

  :focus-within {
    --border-color: #afafaf;
  }
`

const customAmountInputCss = css`
  color: white;
  font-size: 1.2em;
  background: none;
  height: 100%;
  padding: 0.3em;
  box-sizing: border-box;
`

const CustomAmountInput = styled.input`
  ${customAmountInputCss};
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  border-left: none;
  border-right: none;

  border-radius: 0;

  :focus {
    outline: none;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    border-left: none;
    border-right: none;
  }
`

const CustomAmountInputCurrency = styled.div`
  ${customAmountInputCss};
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  border-right: none;

  border-radius: 0.3em 0 0 0.3em;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const CustomAmountInputButton = styled.button`
  ${customAmountInputCss};
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-left: none;
  padding: 0.3em;
  border-radius: 0 0.3em 0.3em 0;

  :hover {
    cursor: pointer;
    color: #FFFFFFaF;
  }
`

const CustomAmountButton = ({saveWager}) => {
    const [selected, setSelected] = useState(false);
    const {register, handleSubmit, watch, errors} = useForm();
    const onSubmit = (data) => {
        saveWager(data.betAmount);
    }
    return (
        <CustomAmountButtonContainer>
            {!selected
                ? <BetAmountButton
                    onClick={() => setSelected(true)}>
                    Custom
                </BetAmountButton>
                : <React.Fragment>
                    <CustomAmountForm onSubmit={handleSubmit(onSubmit)}>
                        <CustomAmountInputCurrency>$</CustomAmountInputCurrency>
                        <CustomAmountInput
                            ref={register()}
                            placeholder={0}
                            name='betAmount'
                            type='number'/>

                        <CustomAmountInputButton
                            onClick={() => setSelected(true)}>
                            Submit
                        </CustomAmountInputButton>
                    </CustomAmountForm>
                </React.Fragment>}
        </CustomAmountButtonContainer>
    )
}

export const SubmittingImageContainer = styled.div`
  width: 30%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ConfirmWagerProposal = () => {
    const selection = useStoreState(state => state.wagers.new.details);
    const opponent = useStoreState(state => state.wagers.new.opponent);
    const profile = useStoreState(state => state.firebase.profile);

    const potentialWager = generateWagerFromSelection(
        {risk: null,
            toWin: null,
            self: profile,
            opponent,
            details: selection,
            type: 'BOVADA'
        })

    if (opponent === null) {
        return <Redirect to={'/wagers/new'}/>
    }

    return (
        <div>
            <div>
                Confirm your proposed bet with {opponent.displayName}
            </div>
            <TitleRow name={selection.event.description}/>
            <BovadaWager wager={potentialWager}/>
            <ProposeCustomWager details={selection}/>
        </div>
    )
}