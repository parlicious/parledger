import {
    AdjustedOdds,
    EventHeaderContainer, GridBasedEventCell,
    NotesRow,
    OddsCell, OddsContainer, OutcomeContainer, SelectableOddsCellContainer,
    TimeAndDateCell,
    TimeAndDateText
} from "./commonEventComponents";
import React from 'react';
import {useStoreState} from "easy-peasy";
import {Outcome} from "./Outcome";


const SelectableOddsCell = (props) => {
    const {
        eventSelected = console.log, event, market, outcome, displayGroup, selected, opponent
    } = props;

    const outcomes = event?.displayGroups?.[displayGroup]?.markets?.[market]?.outcomes;
    return (
        <SelectableOddsCellContainer selected={selected} opponent={opponent}
                                     onClick={() => outcomes?.[outcome] && eventSelected({
                                         event,
                                         market,
                                         outcome,
                                         displayGroup
                                     })}>
            <Outcome outcome={outcome} outcomes={outcomes}/>
        </SelectableOddsCellContainer>
    )
}

const OutcomesRow = ({event, eventSelected, rowNum, displayGroup}) => {
    return (
        <React.Fragment>
            <SelectableOddsCell
                eventSelected={eventSelected}
                displayGroup={displayGroup}
                event={event} market={0} outcome={rowNum}/>
            <SelectableOddsCell
                eventSelected={eventSelected}
                displayGroup={displayGroup}
                event={event} market={1} outcome={rowNum}/>
            <SelectableOddsCell
                eventSelected={eventSelected}
                displayGroup={displayGroup}
                event={event} market={2} outcome={rowNum}/>
        </React.Fragment>
    )
}

export const GameEvent = (props) => {
    const {headerComponent, footerComponent, event, displayGroup = 0} = props;
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];
    return (
        <GridBasedEventCell key={event.id} condensed={!!props.wagerMembers}>
            {headerComponent && <EventHeaderContainer>{headerComponent}</EventHeaderContainer>}
            <TimeAndDateCell>
                <TimeAndDateText>
                    <div>{eventTime.toLocaleDateString(undefined, {dateStyle: 'short'})}</div>
                    <div>{eventTime.toLocaleTimeString(undefined, {timeStyle: 'short'})}</div>
                </TimeAndDateText>
            </TimeAndDateCell>
            <OddsCell>
                {event.competitors[first.competitor]?.name}
            </OddsCell>
            <OutcomesRow {...props} displayGroup={displayGroup} rowNum={first.rowNum}/>
            <OddsCell>
                {event.competitors[second.competitor]?.name}
            </OddsCell>
            <OutcomesRow {...props} displayGroup={displayGroup} rowNum={second.rowNum}/>
            {event.notes && <NotesRow>
                {event.notes}
            </NotesRow>}
            {footerComponent && <EventHeaderContainer> {footerComponent} </EventHeaderContainer>}
        </GridBasedEventCell>
    )
};