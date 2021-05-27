import {ActiveWagers} from '../components/ActiveWagers';
import React, {useEffect} from 'react';
import {GroupStats} from '../components/GroupStats';
import styled from 'styled-components';
import {useStoreActions, useStoreState} from 'easy-peasy';
import {isEmpty, isLoaded} from 'react-redux-firebase';
import {GroupLedger} from '../components/wagers/GroupLedger';

const HomeScreenContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  padding: 1em;
  border-radius: 0.3em;
  
  max-width: 900px;
  margin: auto;

  @media(max-width: 550px){
    flex-direction: column;
  }
`;

export const HomePage = () => {
    const profile = useStoreState(state => state.firebase.profile)
    const initGroup = useStoreActions(actions => actions.users.loadActiveGroup);

    useEffect(() => {
        if(isLoaded(profile) && !isEmpty(profile)){
            initGroup();
        }
    }, [profile])

    return (
        <HomeScreenContainer>
            <ActiveWagers/>
            <GroupStats/>
            <GroupLedger/>
        </HomeScreenContainer>
    )
}