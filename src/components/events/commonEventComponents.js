import styled from "styled-components";

export const EventContainer = styled.div`
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 0.3em;
  max-width: 800px;
  margin: 1em auto;
  
  @media (max-width: 450px) {
    font-size: 0.8em;
  }
`

export const GridBasedEventCell = styled(EventContainer)`
  display: grid;
  grid-template-columns: repeat(var(--num-columns), 1fr);
  --num-columns: ${props => props.condensed ? 4 : 5};
`

export const TitleCell = styled(EventContainer)`
  background: transparent;
  box-shadow: none;
`

export const TimeAndDateCell = styled.div`
  grid-column: 1;
  grid-row: span 2;
  padding: 1em;
  background: linear-gradient(to bottom, #FFFFFF14, #FFFFFF19);

  @media (max-width: 450px) {
    padding: 0.3em;
  }
`

export const TimeAndDateText = styled.div`

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  height: 100%;
  width: 100%;
`

export const OddsCell = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5em;

  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
`

export const MarketDescription = styled.div`
  border-bottom: 1px solid white;
  margin-bottom: 1em;
`

export const SelectableOddsCellContainer = styled(OddsCell)`
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

export const SectionNameCell = styled.div`
  color: white;
  grid-column: span calc(var(--num-columns) + 1);
`

export const EventHeaderContainer = styled.div`
  grid-column: span calc(var(--num-columns));
`

export const NotesRow = styled.div`
  grid-column: span calc(var(--num-columns));

  border-top: 1px solid white;
  font-size: smaller;
  padding: 0.5em;
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

export const OutcomeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

export const OddsContainer = styled.div`
  font-family: Monaco, SFMono-Regular, monospace;
`

export const AdjustedOdds = styled.span`
  font-size: 0.8em;
  color: #aaaaaa;
`
