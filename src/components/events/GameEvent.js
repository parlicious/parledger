import {
    AdjustedOdds,
    EventCell,
    EventHeaderContainer,
    NotesRow,
    OddsCell, OddsContainer, OutcomeContainer, SelectableOddsCellContainer,
    TimeAndDateCell,
    TimeAndDateText
} from "./commonEventComponents";
import React from 'react';
import {useStoreState} from "easy-peasy";
import {Outcome} from "./Outcome";


const SelectableOddsCell = ({
                                eventSelected = () => {
                                }, event, market, outcome, selected, opponent
                            }) => {

    const outcomes = event?.displayGroups?.[0]?.markets?.[market]?.outcomes;
    return (
        <SelectableOddsCellContainer selected={selected} opponent={opponent}
                                     onClick={() => outcomes?.[outcome] && eventSelected({event, market, outcome})}>
            <Outcome outcome={outcome} outcomes={outcomes}/>
        </SelectableOddsCellContainer>
    )
}

const OutcomesRow = ({event, wagerMembers, selectedOutcome, selectedMarket, eventSelected, rowNum}) => {
    const auth = useStoreState(state => state.firebase.auth);
    if (!!wagerMembers) {
        const selected = wagerMembers[rowNum]?.uid === auth.uid;
        const opponent = wagerMembers[(rowNum + 1) % 2]?.uid === auth.uid;
        return (
            <React.Fragment>
                <SelectableOddsCellContainer selected={selected} opponent={opponent}>
                    {wagerMembers[rowNum]?.displayName ?? 'Anyone'}
                </SelectableOddsCellContainer>
                <SelectableOddsCell selected={selected} opponent={opponent} event={event} market={selectedMarket}
                                    outcome={rowNum}/>
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                <SelectableOddsCell
                    eventSelected={eventSelected}
                    event={event} market={0} outcome={rowNum}/>
                <SelectableOddsCell
                    eventSelected={eventSelected}
                    event={event} market={1} outcome={rowNum}/>
                <SelectableOddsCell
                    eventSelected={eventSelected}
                    event={event} market={2} outcome={rowNum}/>
            </React.Fragment>
        )
    }
}

export const GameEvent = (props) => {
    const {headerComponent, footerComponent, event} = props;
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];
    return (
        <EventCell key={event.id} condensed={!!props.wagerMembers}>
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
            <OutcomesRow {...props} rowNum={first.rowNum}/>
            <OddsCell>
                {event.competitors[second.competitor]?.name}
            </OddsCell>
            <OutcomesRow {...props} rowNum={second.rowNum}/>
            {event.notes && <NotesRow>
                {event.notes}
            </NotesRow>}
            {footerComponent && <EventHeaderContainer> {footerComponent} </EventHeaderContainer>}
        </EventCell>
    )
};