import {ActiveWagers} from '../components/ActiveWagers';
import {Feed} from '../components/Feed';
import React from 'react';
import {GroupStats} from '../components/GroupStats';
import styled from 'styled-components';

const HomeScreenContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  
  @media(max-width: 550px){
    flex-direction: column;
  }
`;

export const HomePage = () => {
    return (
        <HomeScreenContainer>
            <ActiveWagers/>
            <GroupStats/>
        </HomeScreenContainer>
    )
}