import {useStoreActions, useStoreState} from "easy-peasy";
import {Event, TitleRow} from "./SelectEvent";
import React, {useEffect} from "react";
import {AppCell} from "../pages/NewWagerPage";
import {useLocation} from 'react-router-dom';
import {WagerDescriptionRow} from "./PersonalWagers";

export const ManageWager = ({}) => {
    const profile = useStoreState(state => state.firebase.profile);
    const savedWager = useStoreState(state => state.wagers.activeWager);
    const setActiveWager = useStoreActions(actions => actions.wagers.setActiveWager);
    let location = useLocation();
    const activeWager = location.state || savedWager;

    console.log(activeWager);

    useEffect(() => {
        setActiveWager(activeWager);
    }, [activeWager])

    if (activeWager?.type === 'BOVADA') {
        const event = activeWager.details.selection.event;
        return (
            <AppCell>
                <Event
                    headerComponent={
                        <WagerDescriptionRow
                            wager={activeWager}
                            pending={activeWager.status === 'pending'}
                            eventDescription={activeWager.details.selection.event.description}
                            risk={activeWager.details.risk}/>
                    }
                    wagerMembers={{1: activeWager.proposedTo, 0: activeWager.proposedBy}}
                    selectedMarket={activeWager.details.selection.market}
                    selectedOutcome={activeWager.details.selection.outcome}
                    event={event}/>
            </AppCell>
        )
    }


    return null;
}