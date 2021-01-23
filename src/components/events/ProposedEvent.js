import {
    EventCell,
    EventHeaderContainer,
    NotesRow,
    OddsCell, SelectableOddsCellContainer,
    TimeAndDateCell,
    TimeAndDateText
} from "./commonEventComponents";
import React from 'react';
import {useStoreState} from "easy-peasy";
import {Outcome} from "./Outcome";

const OutcomesRow = (props) => {
    const {event, members, displayGroup = 0, market, outcome, rowNum} = props;
    const auth = useStoreState(state => state.firebase.auth);

    const selected = members[rowNum]?.uid === auth.uid;
    const opponent = members[(rowNum + 1) % 2]?.uid === auth.uid;
    return (
        <React.Fragment>
            <SelectableOddsCellContainer selected={selected} opponent={opponent}>
                {members[rowNum]?.displayName ?? 'Anyone'}
            </SelectableOddsCellContainer>
            <SelectableOddsCellContainer>
                <Outcome outcomes={event.displayGroups[displayGroup].markets[market].outcomes} outcome={outcome}/>
            </SelectableOddsCellContainer>
        </React.Fragment>
    )
}

export const ProposedEvent = (props) => {
    const {members, event, market, outcome, displayGroup, header, footer} = props
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];

    return (
        <EventCell key={event.id} condensed={members}>
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
        </EventCell>
    )
}