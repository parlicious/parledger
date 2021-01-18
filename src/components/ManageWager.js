import {useStoreActions, useStoreState} from "easy-peasy";
import {Event, TitleRow} from "./SelectEvent";
import React, {useEffect} from "react";
import {AppCell} from "../pages/NewWagerPage";
import {useLocation} from 'react-router-dom';
import {WagerDescriptionRow} from "./PersonalWagers";
import styled from 'styled-components';
import {buttonCss, ButtonLink, InlineLink} from "../styles";

const BetActionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 0.5rem;
  padding: 0 3em;
`

const NormalButton = styled.button`
  ${buttonCss};
  color: #0f2027;
  
  :hover {
    color: #0f2027aa;
  }
`

export const ManageWager = ({}) => {
    const profile = useStoreState(state => state.firebase.profile);
    const savedWager = useStoreState(state => state.wagers.activeWager);
    const setActiveWager = useStoreActions(actions => actions.wagers.setActiveWager);
    let location = useLocation();
    const activeWager = location.state || savedWager;

    useEffect(() => {
        setActiveWager(activeWager);
    }, [activeWager])

    if (activeWager?.type === 'BOVADA') {
        const event = activeWager.details.event;
        return (
            <AppCell>
                <h3> Manage your {activeWager.details.event.description} bet</h3>
                <Event
                    headerComponent={
                        <WagerDescriptionRow
                            wager={activeWager}
                            pending={activeWager.status === 'pending'}
                            eventDescription={activeWager.details.event.description}
                            risk={activeWager.details.risk}/>
                    }
                    wagerMembers={{1: activeWager.proposedTo, 0: activeWager.proposedBy}}
                    selectedMarket={activeWager.details.market}
                    selectedOutcome={activeWager.details.outcome}
                    event={event}/>

                <BetActionsContainer>
                    <NormalButton>Request to Cancel</NormalButton>
                    {Date.now() > activeWager.details.event.startTime &&
                    <React.Fragment>
                        <NormalButton>I won this bet</NormalButton>
                        <NormalButton>I lost this bet</NormalButton>
                        <NormalButton>This bet was a push</NormalButton>
                    </React.Fragment>
                    }
                </BetActionsContainer>
            </AppCell>
        )
    }


    return null;
}