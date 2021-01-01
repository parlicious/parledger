import {useStoreActions, useStoreState} from "easy-peasy";
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {SelectOpponent} from "../components/SelectOpponent";
import {SelectEvent} from "../components/SelectEvent";
import {ConfirmWager} from "../components/ConfirmWager";

export const AppCell = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  padding: 1em;
  border-radius: 0.3em;

  max-width: 800px;
  margin: auto;
`

export const NewWagerPage = () => {
    const profile = useStoreState(state => state.firebase.profile)
    const updateEvents = useStoreActions(actions => actions.wagers.loadEvents);

    const [opponent, setOpponent] = useState(null)
    const [event, setEvent] = useState(null);

    useEffect(() => (async () => {
        await updateEvents().catch(console.error);
    })(), [profile]);

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