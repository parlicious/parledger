import {useStoreActions, useStoreState} from 'easy-peasy';
import React, {useEffect, useState} from 'react';
import {SportSection} from '../SelectEvent';
import styled from 'styled-components';
import {SignUpButton} from '../../pages/SignUpPage';
import {ConfirmButton, PrimaryButton} from '../../styles';
import {addImpliedOddsToEvents} from '../../stores/wagers';
import {UserAvatar} from '../UserAvatar';

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
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 0.2em;
`

const PoolMembers = (props) => {
    const {pool} = props;
    const section = {path: pool.options.path, events: pool.options.events.map(addImpliedOddsToEvents(5))}

    return (
        <PoolMembersContainer>
            <PoolMembersGrid>
                <h4> Member </h4>
                <h4> Possible Remaining </h4>
                <h4> Actual </h4>
                {Object.values(pool.members).map(member =>
                    <React.Fragment>
                        <div>
                            <UserAvatar user={member.info}/>
                            <span> {member.info.displayName} </span>
                        </div>
                        <span> {calculatePossiblePoints(member.selections, section.events)}</span>
                        <span> 0 </span>
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
    return 0;
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
        loadSelectedProps({...fromDatabase, ...propsSelected})
    }, [pool])

    const onSave = async () => {
        try {
            setSaving(true);
            await submitPoolEntry({poolId: pool.id, groupId: pool.groupId, selections: propsSelected});
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