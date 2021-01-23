import {
    EventHeaderContainer,
    GridBasedEventCell,
    NotesRow,
    OddsCell,
    SelectableOddsCellContainer,
    TimeAndDateCell,
    TimeAndDateText
} from "../events/commonEventComponents";
import React from 'react';
import {useStoreState} from "easy-peasy";
import {Outcome} from "../events/Outcome";

const OutcomesRow = (props) => {
    const {event, members, displayGroup = 0, market, outcome, rowNum} = props;
    const auth = useStoreState(state => state.firebase.auth);

    const selected = members[rowNum]?.uid === auth.uid;
    const opponent = members[(rowNum + 1) % 2]?.uid === auth.uid;
    const outcomes = event.displayGroups[displayGroup].markets[market]?.outcomes ?? event.displayGroups[displayGroup].originalMarkets[market]?.outcomes;

    return (
        <React.Fragment>
            <SelectableOddsCellContainer selected={selected} opponent={opponent}>
                {members[rowNum]?.displayName ?? 'Anyone'}
            </SelectableOddsCellContainer>
            <SelectableOddsCellContainer>
                <Outcome outcomes={outcomes} outcome={outcome}/>
            </SelectableOddsCellContainer>
        </React.Fragment>
    )
}

export const ProposedEvent = (props) => {
    const {members, event, header, footer} = props
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];

    return (
        <GridBasedEventCell key={event.id} condensed={members}>
            {header && <EventHeaderContainer>{header}</EventHeaderContainer>}
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
            {footer && <EventHeaderContainer> {footer} </EventHeaderContainer>}
        </GridBasedEventCell>
    )
}