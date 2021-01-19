import {useStoreActions, useStoreState} from "easy-peasy";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import {Redirect, useHistory} from 'react-router-dom';
import {SportSelect} from "./SportSelect";

const OutcomeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const OddsContainer = styled.div`
  font-family: Monaco, SFMono-Regular, monospace;
`

const AdjustedOdds = styled.span`
  font-size: 0.8em;
  color: #aaaaaa;
`

export const Outcome = ({outcome, forcePrice}) => {
    const price = forcePrice ? <AdjustedOdds> {outcome.adjustedOdds ?? outcome.price.american} </AdjustedOdds> : ' ';
    if (outcome) {
        return (
            <OutcomeContainer>
                {outcome.price.handicap
                    ? <OddsContainer>
                        {['O', 'U'].includes(outcome.type) && outcome.type}&nbsp;{outcome.price.handicap} {price}
                    </OddsContainer>
                    : <OddsContainer>
                        {outcome.price.american} {outcome.adjustedOdds ?
                        <AdjustedOdds> {outcome.adjustedOdds} </AdjustedOdds> : ''}
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
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  grid-template-columns: repeat(var(--num-columns), 1fr);
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 0.3em;
  max-width: 800px;
  margin: 1em auto;

  --num-columns: ${props => props.condensed ? 4 : 5};

  @media (max-width: 450px) {
    font-size: 0.8em;
  }
`

export const TitleCell = styled(EventCell)`
  background: transparent;
  box-shadow: none;
`

const TimeAndDateCell = styled.div`
  grid-column: 1;
  grid-row: span 2;
  padding: 1em;
  background: linear-gradient(to bottom, #FFFFFF14, #FFFFFF19);

  @media (max-width: 450px) {
    padding: 0.3em;
  }
`

const TimeAndDateText = styled.div`

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  height: 100%;
  width: 100%;
`

const OddsCell = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5em;

  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
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
  column-span: 2;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

function topOutcomesNotClose(outcomes, numberToCheck) {
    const decimalPrices = outcomes?.slice(0, numberToCheck)
        ?.map(outcome => outcome?.price?.decimal ?? '0')
        ?.map(n => Number(n));

    if (!decimalPrices || !decimalPrices.length) return false;

    const mean = decimalPrices.reduce((a, b) => a + b) / decimalPrices.length;

    const diffs = decimalPrices.map(price => Math.abs(price - mean));

    return diffs.every(diff => diff > .06);
}

const SelectableOddsCell = ({
                                eventSelected = () => {
                                }, event, market, outcome, selected, opponent
                            }) => {

    const outcomes = event?.displayGroups?.[0]?.markets?.[market]?.outcomes;
    return (
        <SelectableOddsCellContainer selected={selected} opponent={opponent}
                                     onClick={() => outcomes?.[outcome] && eventSelected({event, market, outcome})}>
            <Outcome outcome={outcomes?.[outcome]} forcePrice={topOutcomesNotClose(outcomes, 2)}/>
        </SelectableOddsCellContainer>
    )
}

const SectionNameCell = styled.div`
  color: white;
  grid-column: span calc(var(--num-columns) + 1);
`

export const TitleRow = ({name, expectedMarkets}) => {
    return (
        <TitleCell>
            <SectionNameCell>
                <h2>{name}</h2>
            </SectionNameCell>
            <div/>
            <div/>
            <OddsCell>
                {expectedMarkets?.[0]?.description}
            </OddsCell>
            <OddsCell>
                {expectedMarkets?.[1]?.description}
            </OddsCell>
            <OddsCell>
                {expectedMarkets?.[2]?.description}
            </OddsCell>
        </TitleCell>
    )
}

const EventHeaderContainer = styled.div`
  grid-column: span calc(var(--num-columns));
`

const NotesRow = styled.div`
  grid-column: span calc(var(--num-columns));

  border-top: 1px solid white;
  font-size: smaller;
  padding: 0.5em;
`

const SportSection = ({section, eventSelected}) => {
    const comp = section.path.find(p => p.type === 'COMPETITION')?.description;
    const descriptionPrefix = comp ? comp + ' - ' : '';
    const fullDescription = descriptionPrefix + section.path[0].description;
    return (
        <div>
            <TitleRow name={fullDescription} expectedMarkets={section.expectedMarkets}/>
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
                    event={event} market={1} outcome={rowNum}/>
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
    console.log(props.wagerMembers)
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


export const SelectEvent = ({}) => {
    const events = useStoreState(state => state.wagers.filteredEvents);
    const [numSections, setNumSections] = useState(10);
    const renderedEvents = events?.slice(0, numSections) || [];
    const opponent = useStoreState(state => state.wagers.new.opponent);
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

    if (opponent === null) {
        return <Redirect to={'/wagers/new'}/>
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