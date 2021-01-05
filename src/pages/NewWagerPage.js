import {useStoreActions, useStoreState} from "easy-peasy";
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {SelectOpponent} from "../components/SelectOpponent";
import {SelectEvent} from "../components/SelectEvent";
import {ConfirmWagerProposal} from "../components/ConfirmWagerProposal";
import {useHistory} from 'react-router-dom';

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
    const setOpponent = useStoreActions(actions => actions.wagers.new.setOpponent);
    const history = useHistory();
    const opponentSelected = (opponent) => {
        setOpponent(opponent);
        history.push('/wagers/new/type')
    }

    return (
        <SelectOpponent opponentSelected={opponentSelected}/>
    )
}