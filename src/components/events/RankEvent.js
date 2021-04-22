import {AdjustedOdds, GridBasedEventCell, TimeAndDateCell, TimeAndDateText} from "./commonEventComponents";
import React from 'react';
import styled from 'styled-components';
import {useStoreState} from 'easy-peasy';
import {winningResults} from '../pools/PropsPool';


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
  border-bottom: 1px solid ${props => props.theme.interfaceColor};
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
  
  background: ${props => getBackgroundColor(props.propSelected, props.propCorrect)};
  color: ${props => props.propSelected ? '#0f2027' : 'inherit'};
  
  :hover {
    cursor: pointer;
    background: ${props => props.propSelected ? '#FFFFFFCC' : '#FFFFFF13'};
  }
`

const getBackgroundColor = (selected, correct) => {
    console.log(correct, selected);
    if(correct){
        return '#3cc921'
    } else if(selected && correct === null) {
        return '#FFFFFF'
    } else if(selected){
        return '#FF4040'
    } else {
        return 'inherit'
    }
}

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

export const RankOutcome = (props) => {
    const {outcome, onSelect, correct} = props;

    const selectedProps = useStoreState(state => state.pools.selectedProps);
    const propSelected = Object.values(selectedProps).includes(outcome?.id);

    return (
        <RankOutcomeContainer propSelected={propSelected} propCorrect={correct} onClick={() => onSelect(outcome)}>
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

const wasOutcomeCorrect = (eventResult, outcomeId) => {
    if(!eventResult){
        return null;
    } else if(outcomeId === eventResult){
        return true;
    } else {
        return false;
    }
}

export const RankEvent = (props) => {
    const {onSelect, event, displayGroup = 0, market = 0, eventResult} = props;
    const eventTime = new Date(event.startTime);
    const outcomes = event.displayGroups[displayGroup].markets[market]?.outcomes
        || event.displayGroups[displayGroup].originalMarkets[market]?.outcomes;

    const eventSelected = (outcome) => {
        console.log(`for event: ${event.id} selected ${outcome.id}`);
        onSelect({
            event,
            market: 0,
            outcome,
            displayGroup
        });
    }

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
                {outcomes?.length === 2 || (outcomes?.length === 3 && outcomes[2].description === 'Draw')
                    ? <RankEventTwoOptions>
                        <RankOutcome correct={wasOutcomeCorrect(eventResult, outcomes[0].id)} onSelect={eventSelected} outcome={outcomes[0]}/>
                        <RankOutcome correct={wasOutcomeCorrect(eventResult, outcomes[1].id)} onSelect={eventSelected} outcome={outcomes[1]}/>
                    </RankEventTwoOptions>
                    : <RankEventManyOptions>
                        {outcomes.map(it => <RankOutcome correct={wasOutcomeCorrect(eventResult, it.id)} onSelect={eventSelected} outcome={it}/>)}
                    </RankEventManyOptions>}
            </RankEventContainer>
        </GridBasedEventCell>
    )
};