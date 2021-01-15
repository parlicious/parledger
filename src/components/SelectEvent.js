import {useStoreActions, useStoreState} from "easy-peasy";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import {useHistory} from 'react-router-dom';
import {SportSelect} from "./SportSelect";

const OutcomeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const OddsContainer = styled.div`
  font-family: Monaco, SFMono-Regular, monospace;
`

export const Outcome = ({outcome}) => {
    if (outcome) {
        return (
            <OutcomeContainer>
                {outcome.price.handicap && <OddsContainer>
                    {['O', 'U'].includes(outcome.type) && outcome.type}&nbsp;{outcome.price.handicap + ' '}
                </OddsContainer>}
            </OutcomeContainer>
        )
    } else {
        return <span/>
    }
}

const MarketDescription = styled.div`
  border-bottom: 1px solid white;
  margin-bottom: 1em;
`

export const EventCell = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 0.3em;
  max-width: 800px;
  margin: 1em auto;
`

export const TitleCell = styled(EventCell)`
  background: transparent;
  box-shadow: none;
`

const TimeAndDateCell = styled.div`
  grid-column: 1;
  grid-row: span 2;

  padding: 1em;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: linear-gradient(to bottom, #FFFFFF14, #FFFFFF19);
`

const OddsCell = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5em;
`

const SelectableOddsCellContainer = styled(OddsCell)`
  color: ${props => {
    if (props.selected) {
      return '#00C781';
    } else if (props.opponent) {
      return '#FF4040';
    } else {
      return 'inherit'
    }
  }};
  display: flex;
  flex-wrap: wrap-reverse;
  flex-direction: row-reverse;
  justify-content: space-between;
  text-align: end;
  
  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

const SelectableOddsCell = ({eventSelected = () => {}, event, market, outcome, selected, opponent}) => {

    return (
        <SelectableOddsCellContainer selected={selected} opponent={opponent}
                                     onClick={() => eventSelected({event, market, outcome})}>
            <Outcome outcome={event?.displayGroups[0]?.markets[market]?.outcomes[outcome]}/>
        </SelectableOddsCellContainer>
    )
}

const SectionNameCell = styled.div`
  color: white;
  grid-column-start: 1;
  grid-column-end: 5;
`

export const TitleRow = ({name}) => {
    return (
        <TitleCell>
            <SectionNameCell>
                <h2>{name}</h2>
            </SectionNameCell>
            <div/>
            <div/>
            <OddsCell>
                Spread
            </OddsCell>
            <OddsCell>
                Total
            </OddsCell>
        </TitleCell>
    )
}

const EventHeaderContainer = styled.div`
  grid-column-start: 1;
  grid-column-end: 5;
`

const NotesRow = styled.div`
  grid-column-start: 1;
  grid-column-end: 5;

  border-top: 1px solid white;
  font-size: smaller;
  padding: 0.5em;
`

const SportSection = ({section, eventSelected}) => {
    return (
        <div>
            <TitleRow name={section.path[0].description}/>
            {section.events.map(it => <Event eventSelected={eventSelected} event={it}/>)}
        </div>
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
                    event={event} market={2} outcome={rowNum}/>
            </React.Fragment>
        )
    }
}

export const Event = (props) => {
    const {headerComponent, footerComponent, event} = props;
    const eventTime = new Date(event.startTime);
    return (
        <EventCell key={event.id}>
            {headerComponent && <EventHeaderContainer>{headerComponent}</EventHeaderContainer>}
            <TimeAndDateCell>
                <div>{eventTime.toLocaleDateString()}</div>
                <div>{eventTime.toLocaleTimeString()}</div>
            </TimeAndDateCell>
            <OddsCell>
                {event.competitors[1]?.name}
            </OddsCell>
            <OutcomesRow {...props} rowNum={0}/>
            <OddsCell>
                {event.competitors[0]?.name}
            </OddsCell>
            <OutcomesRow {...props} rowNum={1}/>
            {event.notes && <NotesRow>
                {event.notes}
            </NotesRow>}
            {footerComponent && <EventHeaderContainer> {footerComponent} </EventHeaderContainer>}
        </EventCell>
    )
};


export const SelectEvent = ({}) => {
    const events = useStoreState(state => state.wagers.filteredEvents);
    const [numSections, setNumSections] = useState(2);
    const renderedEvents = events?.slice(0, numSections) || [];
    const fetchMoreData = () => setNumSections(numSections + 1)
    const setEvent = useStoreActions(actions => actions.wagers.new.setDetails);
    const history = useHistory();

    const updateEvents = useStoreActions(actions => actions.wagers.loadEvents);
    useEffect(() => {
        updateEvents().catch(console.error);
    }, [events]);


    const eventSelected = (event) => {
        setEvent(event);
        history.push('/wagers/new/confirm')
    }

    return (
        <React.Fragment>
            <SportSelect/>
            <InfiniteScroll
                dataLength={renderedEvents.length}
                next={fetchMoreData}
                hasMore={renderedEvents?.length !== events?.length}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{textAlign: "center"}}>
                        <b>Huh, that's it.</b>
                    </p>
                }
            >
                {renderedEvents.map(section => <SportSection key={section.id} eventSelected={eventSelected}
                                                             section={section}/>)}
            </InfiniteScroll>
        </React.Fragment>
    )
}