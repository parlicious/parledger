import {
    EventHeaderContainer,
    GridBasedEventCell, NotesRow, OddsCell,
    TimeAndDateCell,
    TimeAndDateText
} from "../events/commonEventComponents";
import React from 'react';

const TwoWayWagerRow = (props) => {
    const {name, choice, odds} = props;
    return (
        <React.Fragment>
            {name}
            {choice}
            {odds}
        </React.Fragment>
    )
}

export const TwoWayWager = (props) => {
    const {header, footer, wagerTime} = props;
    const {proposedToDetails, proposedByDetails} = props;

    return (
        <GridBasedEventCell condensed>
            {header && <EventHeaderContainer>{header}</EventHeaderContainer>}
            <TimeAndDateCell>
                <TimeAndDateText>
                    <div>{wagerTime.toLocaleDateString(undefined, {dateStyle: 'short'})}</div>
                    <div>{wagerTime.toLocaleTimeString(undefined, {timeStyle: 'short'})}</div>
                </TimeAndDateText>
            </TimeAndDateCell>
            <TwoWayWagerRow {...proposedToDetails}/>
            <TwoWayWagerRow {...proposedByDetails}/>
            {footer && <EventHeaderContainer> {footer} </EventHeaderContainer>}
        </GridBasedEventCell>
    )
}