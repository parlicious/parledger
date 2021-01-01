import styled from "styled-components";
import {useForm} from "react-hook-form";
import {useState} from 'react';
import {useStoreActions, useStoreState} from "easy-peasy";

const WagerAmountInput = styled.input`
  font-size: 1em;
  padding: 0.3em;
`

const WagerDescriptionTextArea = styled.textarea`
  width: 100%;
  font-size: 1em;
  font-family: "Avenir", sans-serif;
`

const OpenWagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const BetAmountRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 1em;
  width: 100%;
  justify-content: center;
`

const BetAmountSpan = styled.span`
  margin-left: 2em;
`

const SubmitBetButton = styled.button`
  border-radius: 3em;
  color: white;
  font-size: 1.2em;
  padding: 0.3em;
  width: 50%;
  border: 1px solid white;
  background: none;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

export const ProposeCustomWager = ({}) => {
    const profile = useStoreState(state => state.firebase.profile);
    const {handleSubmit, control, errors, register} = useForm();
    const [submitting, setSubmitting] = useState(false);
    const createWager = useStoreActions(actions => actions.wagers.createWager);

    const onSubmit = async (data) => {
        const wager = {
            proposedTo: data.uid,
            groupId: profile.groups[0],
            details: {
                description: data.wagerDescription,
                risk: data.proposedByWagerAmount,
                win: data.proposedToWagerAmount
            }
        }
        await createWager(wager);
        setSubmitting(!submitting);
    }

    const getFormErrorMessage = (errors) => {
        const messages = {
            proposedTo: "Must select someone to propose the bet to",
            wagerDescription: "Must provide a wager description",
            proposedByWagerAmount: "Must enter an amount to risk",
            proposedToWagerAmount: "Must enter an amount to win",
        }

        return messages[Object.keys(errors)[0]]
    }
}