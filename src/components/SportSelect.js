import React, {useState} from "react";
import styled from "styled-components";
import {useStoreActions} from "easy-peasy";
import {useBreakpoint} from "../hooks";

const SportIcon = styled.i`
  font-size: 3em;

  :hover {
    cursor: pointer;
  }
`

const SportsOptionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
`

const sportCodesToIcons = [
    {code: "FOOT", name: 'Football', icon: 'football'},
    {code: "BASK", name: 'Basketball', icon: 'basketball'},
    // {code: "GOLF", name: 'Golf', icon: 'golf'},
    // {code: "BOXI", name: 'Boxing', icon: 'boxing'},
    // {code: "TENN", name: 'Tennis', icon: 'tennis'},
    {code: "SOCC", name: 'Soccer', icon: 'soccer'},
    {code: "HCKY", name: 'Hockey', icon: 'ice-hockey'},
    {code: "RUGU", name: 'Rugby Union', icon: 'rugby-union'},
    // {code: "POLI", name: 'Politics', icon: 'politics'},
    // {code: "CRIC", name: 'Cricket', icon: 'cricket'},
    {code: null, name: 'All', icon: 'all'},
]

const SportButtonContainer = styled.div`
  border-radius: 0.3em;
  padding: 0.3em;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  margin: 0 0.3em;

  :hover {
    background: white;
    color: #0F2027;
  }
`

const SportName = styled.div`

`

const SportButton = ({sport, onSelected}) => {
    const selectSport = useStoreActions(actions => actions.wagers.selectSport);
    const onClick = () => {
        selectSport(sport.code);
        onSelected();
    }
    return (
        <SportButtonContainer onClick={onClick} >
            <SportIcon className={`icon-${sport.icon}`}/>
            <SportName>{sport.name}</SportName>
        </SportButtonContainer>
    )
}

const ShowSelect = styled.div`
  width: 100%;
  background: white;
  color: #0F2027;
  
  text-align: center;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0.3em;
`

const SportSelectContainer = styled.div`
`


export const SportSelect = ({}) => {
    const width = useBreakpoint();
    const [selecting, setSelecting] = useState(false);
    const shouldShow = width > 450 || selecting;

    const toggleSelecting = () => setSelecting(!selecting)
    return (
        <SportSelectContainer>
            {shouldShow
                ? <SportsOptionsContainer>
                    {sportCodesToIcons.map(it => <SportButton onSelected={toggleSelecting} sport={it}/>)}
                </SportsOptionsContainer>
                : <ShowSelect onClick={toggleSelecting}>
                    Select a sport
                </ShowSelect>}
        </SportSelectContainer>
    )
}