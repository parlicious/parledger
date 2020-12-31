import {useStoreActions, useStoreState} from "easy-peasy";
import {useFirestoreConnect} from "react-redux-firebase";
import {Controller, useForm} from "react-hook-form";
import {PulseSpinner} from "../components/PulseSpinner";
import {useState, useEffect} from 'react';
import styled from 'styled-components';
import {SelectOpponent} from "../components/SelectOpponent";
import {SelectEvent} from "../components/SelectEvent";
import React from 'react';
import {ConfirmWager} from "../components/ConfirmWager";

export const AppCell = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  margin: 1em;
  padding: 1em;
  border-radius: 0.3em;

  max-width: 800px;
  margin: auto;
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

export const NewWagerPage = () => {
    const [submitting, setSubmitting] = useState(false);
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect([{collectionGroup: 'users', storeAs: 'members'}]);
    const members = useStoreState(state => state.firestore.data.members)
    const {handleSubmit, control, errors, register} = useForm();
    const createWager = useStoreActions(actions => actions.wagers.createWager);
    const updateEvents = useStoreActions(actions => actions.wagers.loadEvents);

    const [opponent, setOpponent] = useState(null)
    const [event, setEvent] = useState(null);

    useEffect(() => (async () => {
        await updateEvents().catch(console.error);
    })(), [profile]);

    const options = Object.keys(members || {}).map(k => members[k])
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

    if(opponent === null){
        return (
            <AppCell>
                <SelectOpponent opponentSelected={setOpponent}/>
            </AppCell>
        )
    } else if(event === null){
        return (
            <SelectEvent eventSelected={setEvent}/>
        )
    } else {
        return (
            <ConfirmWager selection={event} opponent={opponent}/>
        )
    }
}