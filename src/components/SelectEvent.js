import {useStoreState} from "easy-peasy";
import React, {useState} from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
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
    console.log(outcome)
    if (outcome) {
        return (
            <OutcomeContainer>
                {outcome.price.handicap && <OddsContainer>
                    {['O','U'].includes(outcome.type)  && outcome.type} {outcome.price.handicap + ' '}
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

const EventMarket = ({market}) => {
    return (
        <div>
            <MarketDescription>{market.description}</MarketDescription>
            {market.outcomes.map(it => <Outcome outcome={it}/>)}
        </div>
    )
};

const MarketContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  margin-top: 1em;
`

const EventHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const EventCell = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
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
  grid-row-start: 1;
  grid-row-end: 3;

  padding: 1em;

  display: flex;
  flex-direction: column;

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
  flex-direction: row-reverse;
  justify-content: space-between;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

const SelectableOddsCell = ({eventSelected, event, market, outcome, selectedMarket, selectedOutcome}) => {
    const opponent = selectedMarket === market && selectedOutcome !== outcome;
    const selected = selectedMarket === market && selectedOutcome === outcome;
    return (
        <SelectableOddsCellContainer selected={selected} opponent={opponent} onClick={() => eventSelected({event, market, outcome})}>
            <Outcome outcome={event?.displayGroups[0]?.markets[market]?.outcomes[outcome]}/> {selected && "You: "} {opponent && "Them: "}
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

export const Event = ({event, eventSelected, selectedMarket, selectedOutcome}) => {
    const eventTime = new Date(event.startTime);
    return (
        <EventCell key={event.id}>
            <TimeAndDateCell>
                <div>{eventTime.toLocaleDateString()}</div>
                <div>{eventTime.toLocaleTimeString()}</div>
            </TimeAndDateCell>
            <OddsCell>
                {event.competitors[0]?.name}
            </OddsCell>
            <SelectableOddsCell selectedOutcome={selectedOutcome}
                                selectedMarket={selectedMarket}
                                eventSelected={eventSelected}
                                event={event} market={0} outcome={0}/>
            <SelectableOddsCell selectedOutcome={selectedOutcome}
                                selectedMarket={selectedMarket} eventSelected={eventSelected}
                                event={event} market={2} outcome={0}/>
            <OddsCell>
                {event.competitors[1]?.name}
            </OddsCell>
            <SelectableOddsCell selectedOutcome={selectedOutcome}
                                selectedMarket={selectedMarket} eventSelected={eventSelected}
                                event={event} market={0} outcome={1}/>
            <SelectableOddsCell
                selectedOutcome={selectedOutcome}
                selectedMarket={selectedMarket}
                eventSelected={eventSelected} event={event} market={2} outcome={1}/>
            {event.notes && <NotesRow>
                {event.notes}
            </NotesRow>}
        </EventCell>
    )
};


export const SelectEvent = ({eventSelected}) => {
    const events = useStoreState(state => state.wagers.headToHeadEvents);
    const [numSections, setNumSections] = useState(2);
    const renderedEvents = events.slice(0, numSections)
    const fetchMoreData = () => setNumSections(numSections + 1)

    console.log(events[0])

    return (
        <React.Fragment>
            <InfiniteScroll
                dataLength={renderedEvents.length}
                next={fetchMoreData}
                hasMore={renderedEvents.length !== events.length}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{textAlign: "center"}}>
                        <b>Huh, that's it.</b>
                    </p>
                }
            >
                {renderedEvents.map(section => <SportSection eventSelected={eventSelected} section={section}/>)}
            </InfiniteScroll>
        </React.Fragment>
    )
}