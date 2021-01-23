import {
    AdjustedOdds,
    EventContainer,
    GridBasedEventCell, OddsContainer,
    TimeAndDateCell,
    TimeAndDateText
} from "./commonEventComponents";
import React from 'react';
import styled from 'styled-components';


const RankEventContainer = styled.div`
  grid-column: span 4;
  grid-row: span 2;
  display: flex;
  flex-direction: column;
`

const RankEventTitle = styled.div`
  font-weight: bold;
  padding: 0.6em;
  text-align: right;
  border-bottom: 1px solid white;
`

const RankEventManyOptions = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40%, 1fr));
`

const RankEventTwoOptions = styled.div`
  display: flex;
  flex-direction: column;
`

const RankOutcomeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

const RankOdds = styled.div`
  font-family: Monaco, SFMono-Regular, monospace;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const RankOddsItem = styled.div`
  padding: 0 0.3em;
`

const RankOutcome = (props) => {
    const {outcome} = props;
    return (
        <RankOutcomeContainer>
            {outcome.description}
            <RankOdds>
                <RankOddsItem>{outcome.price.american}</RankOddsItem>
                <RankOddsItem>
                    <AdjustedOdds>{outcome.adjustedOdds}</AdjustedOdds>
                </RankOddsItem>
            </RankOdds>
        </RankOutcomeContainer>
    )
}

export const RankEvent = (props) => {
    const {headerComponent, footerComponent, event, displayGroup = 0} = props;
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];

    const outcomes = event.displayGroups[0].originalMarkets[0]?.outcomes || event.displayGroups[0].markets[0]?.outcomes;

    return (
        <GridBasedEventCell key={event.id}>

            <TimeAndDateCell>
                <TimeAndDateText>
                    <div>{eventTime.toLocaleDateString(undefined, {dateStyle: 'short'})}</div>
                    <div>{eventTime.toLocaleTimeString(undefined, {timeStyle: 'short'})}</div>
                </TimeAndDateText>
            </TimeAndDateCell>
            <RankEventContainer>
                <RankEventTitle>
                    {event.description}
                </RankEventTitle>
                {outcomes?.length === 2
                    ? <RankEventTwoOptions>
                        <RankOutcome outcome={outcomes[0]}/>
                        <RankOutcome outcome={outcomes[1]}/>
                    </RankEventTwoOptions>
                    : <RankEventManyOptions>
                        {outcomes.map(it => <RankOutcome outcome={it}/>)}
                    </RankEventManyOptions>}
            </RankEventContainer>
        </GridBasedEventCell>
    )
};