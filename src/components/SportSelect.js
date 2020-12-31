import React from "react";
import styled from "styled-components";

const sports = {
    1: "Football",
    215: "Cricket",
    226: "Baseball",
    227: "Basketball",
    237: "Golf",
    238: "Boxing",
    239: "Tennis",
    240: "Soccer",
    1100: "Handball",
    1200: "Volleyball",
    1201: "UFC/MMA",
    1203: "Winter Olympics",
    1206: "Horses Futures & Props",
    1250: "Beach Volleyball",
    1600: "Futsal",
    1900: "Table Tennis",
    2100: "Hockey",
    2700: "Cycling",
    2900: "Winter Sports",
    6000: "Esports",
    7000: "Numbers Game",
    22877: "Rugby Union",
    22878: "Rugby League",
    22881: "Motor Sports",
    22883: "Other Sports",
    22884: "Snooker",
    22886: "Darts",
    22888: "Politics"
}

const SportIcon = styled.span`
  font-size: 4em;
`

const SportSelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const SportSelect = ({}) => {
    return (
        <SportSelectContainer>
            <SportIcon>
                🏈
            </SportIcon>
            <SportIcon>
                🏀
            </SportIcon>
            <SportIcon>
                ⚾️
            </SportIcon>
            <SportIcon>
                🏉
            </SportIcon>
        </SportSelectContainer>
    )
}