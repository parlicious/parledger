import {useStoreActions, useStoreState} from 'easy-peasy';
import React, {useEffect, useState} from 'react';
import {SportSection} from '../SelectEvent';
import styled from 'styled-components';
import {SignUpButton} from '../../pages/SignUpPage';
import {ConfirmButton, PrimaryButton} from '../../styles';
import {addImpliedOddsToEvents} from '../../stores/wagers';
import {UserAvatar} from '../UserAvatar';

const results = {
    "8036708": "737276821",
    "8036729": "737277010",
    "8036734": "737277560",
    "8036752": "737277745",
    "8036760": "737278418",
    "8036767": "737279421",
    "8036769": "737279647",
    "8036771": "737279877",
    "8036774": "737280160",
    "8036782": "737280215",
    "8036784": "737280336",
    "8207144": "760485325",
    "8207145": "760485938",
    "8207149": "760486154",
    "8207151": "760486297",
    "8207156": "760487113",
    "8227694": "763115351",
    "8228006": "763128783",
    "8228008": "763128812",
    "8228667": "763241510",
    "8228687": "763244235",
    "8228695": "763247179",
    "8228719": "763254542",
    "8228734": "763256105",
    "8228747": "763257503",
    "8228768": "763262538",
    "8228812": "763265961",
    "8228826": "763268255",
    "8228832": "763269386",
    "8228836": "763269755",
    "8228839": "763270139",
    "8228848": "763271572",
    "8234342": "764005213",
    "8235687": "764184750",
    "8235692": "764185321",
    "8235694": "764185532",
    "8240554": "764813833",
    "8240556": "764814090",
    "8244605": "765319573",
    "8244607": "765320201",
    "8244627": "765322746",
    "8244629": "765323751",
    "8244642": "765325838",
    "8250705": "766121846",
    "8250709": "766122041",
    "8255073": "766717812",
    "8286029": "771277311",
    "8286030": "771277606",
    "8286033": "771277787"
}

const PropsSelectionProgressContainer = styled.div`
  position: sticky;

  top: 0;
  background: white;
  color: #0f2027;

  padding: 0.4em;
  max-width: 800px;

  margin: 0 auto;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 450px) {
    flex-direction: column;
    align-items: start;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const PoolActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const PoolTitleContainer = styled.div`
  flex-direction: column;

  @media (max-width: 450px) {
    flex-direction: row;
    align-items: start;
  }
`

const PoolDescriptionContainer = styled.div`
  background: white;
  color: #0f2027;

  max-width: 800px;

  margin: 0 auto;
  padding: 0.4em;
`

const PoolMembersContainer = styled.div`
  background: white;
  color: #0f2027;

  max-width: 800px;

  margin: 0 auto;
  padding: 0.4em;
`;

const PoolMembersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`

const ScoreboardHeader = styled.h4`
  border-bottom: 2px solid #0f2027;
  font-weight: bold;
  text-align: end;
`

const ScoreboardCell = styled.div`
  text-align: end;
`

const PoolMembers = (props) => {
    const {pool} = props;
    const section = {path: pool.options.path, events: pool.options.events.map(addImpliedOddsToEvents(5))}

    return (
        <PoolMembersContainer>
            <PoolMembersGrid>
                <ScoreboardHeader> Name </ScoreboardHeader>
                <ScoreboardHeader> Possible </ScoreboardHeader>
                <ScoreboardHeader> Actual </ScoreboardHeader>
                {Object.values(pool.members).map(member =>
                    <React.Fragment>
                        <ScoreboardCell>
                            {member.info.displayName}
                        </ScoreboardCell>
                        <ScoreboardCell> {calculatePossiblePoints(member.selections, section.events)} </ScoreboardCell>
                        <ScoreboardCell> {calculateActualPoints(member.selections, section.events)} </ScoreboardCell>
                    </React.Fragment>
                )}
            </PoolMembersGrid>
        </PoolMembersContainer>
    )
}

const calculatePossiblePoints = (propsSelected, events) => {
    console.log(propsSelected, events);
    const raw = Object.keys(propsSelected).map(k => {
            const event = events.find(it => it.id === k);
            const outcome = event.displayGroups[0].markets[0].outcomes.find(it => it.id === propsSelected[k]);

            return 1 - outcome.impliedOdds
        }
    ).reduce((a, b) => a + b, 0)

    return Math.floor(raw * 100);
}

// TODO
const calculateActualPoints = (propsSelected, events) => {
    console.log(propsSelected, events);
    const raw = Object.keys(propsSelected).map(k => {
            const event = events.find(it => it.id === k);
            const outcome = event.displayGroups[0].markets[0].outcomes.find(it => it.id === propsSelected[k]);

            if(results[k] === propsSelected[k]){
                return 1 - outcome.impliedOdds
            } else {
                return 0;
            }
        }
    ).reduce((a, b) => a + b, 0)

    return Math.floor(raw * 100);
}

export const PropsPool = (props) => {
    const {pool} = props;
    const auth = useStoreState(state => state.firebase.auth);
    const submitPoolEntry = useStoreActions(actions => actions.pools.submitPoolEntry);
    const section = {path: pool.options.path, events: pool.options.events.map(addImpliedOddsToEvents(5))}
    const propEventSelected = useStoreActions(actions => actions.pools.propEventSelected);
    const randomizeProps = useStoreActions(actions => actions.pools.randomizePropsSelected);
    const clearPropsSelected = useStoreActions(actions => actions.pools.clearPropsSelected);
    const loadSelectedProps = useStoreActions(actions => actions.pools.loadSelectedProps);
    const propsSelected = useStoreState(state => state.pools.selectedProps);
    const possible = Object.values(pool.options.events ?? {}).length
    const selected = useStoreState(state => state.pools.numSelected);
    const [saving, setSaving] = useState(false);
    const randomize = () => randomizeProps(section);

    const [possiblePoints, setPossiblePoints] = useState(0);

    useEffect(() => {
        const points = calculatePossiblePoints(propsSelected, section.events);
        setPossiblePoints(points);
    }, [propsSelected])

    useEffect(() => {
        const fromDatabase = pool.members[auth.uid]?.selections ?? {};
        // loadSelectedProps({...fromDatabase, ...propsSelected})
        loadSelectedProps(results);
    }, [pool])

    const onSave = async () => {
        try {
            setSaving(true);
            // await submitPoolEntry({poolId: pool.id, groupId: pool.groupId, selections: propsSelected});
            console.log({poolId: pool.id, groupId: pool.groupId, selections: propsSelected});
        } catch (e) {
            console.error(e);
        }

        setSaving(false);
    }

    return (
        <div>
            <PropsSelectionProgressContainer>
                <PoolTitleContainer>
                    <div>
                        <h2> Super Bowl Props </h2>
                    </div>
                    <div>
                        Selected {selected} of {possible} ({possiblePoints} points possible)
                    </div>
                </PoolTitleContainer>
                <PoolActionsContainer>
                    <ButtonsContainer>
                        {saving
                            ? <PrimaryButton disabled> Saving </PrimaryButton>
                            : <ConfirmButton onClick={onSave}> Save </ConfirmButton>}
                        <PrimaryButton onClick={clearPropsSelected}> Clear </PrimaryButton>
                        <PrimaryButton onClick={randomize}> Randomize </PrimaryButton>
                    </ButtonsContainer>
                </PoolActionsContainer>
            </PropsSelectionProgressContainer>
            <PoolDescriptionContainer>
                Select an option for each of the following props. You win points equal to the percentage likelihood of
                that
                event not occurring (e.g. an event with a 1% chance nets you 99 points). Most points wins. $20 to enter.
            </PoolDescriptionContainer>
            <PoolMembers pool={pool}/>
            {section && <SportSection showTitle={false} eventSelected={propEventSelected} section={section}/>}
        </div>
    )
}