import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreActions, useStoreState} from "easy-peasy";
import {GroupWagers, PersonalWagers, useGroupWagers, Wager} from "./PersonalWagers";
import {AppCell} from "../pages/NewWagerPage";
import {HeadToHeadWager} from "./HeadToHeadWager";
import styled from 'styled-components';
import {sportsCodesToNames} from "./SportSelect";

const WagerBySportContainer = styled.div`

`

const WagersByCompetitionContainer = styled.div`
    
`

const pluckDeep = (obj, key) => key.split('.').reduce((accum, key) => accum && accum[key], obj)
const groupByPath = (collection, path) => collection.reduce(
    (result, item) => ({
        ...result,
        [pluckDeep(item, path)]: [
            ...(result[pluckDeep(item, path)] || []),
            item,
        ],
    }),
    {},
);

const WagersForCompetition = (props) => {
    const {competitionId, wagers} = props;

    return (
        <WagersByCompetitionContainer>
            {wagers.map(it => <Wager key={it.id} wager={it}/>)}
        </WagersByCompetitionContainer>
    )
}

const WagersForSport = (props) => {
    const {sport, wagers} = props;
    const wagersByCompetition = groupByPath(wagers, 'details.event.competitionId')
    return (
        <WagerBySportContainer>
            <h2> {sportsCodesToNames[sport] ?? 'Custom'} </h2>
            {Object.keys(wagersByCompetition)
                .map(it => <WagersForCompetition competitionId={it}
                                                 wagers={wagersByCompetition[it]}/>)}
        </WagerBySportContainer>
    )
}


export const Feed = () => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect([{collection: `groups/${profile.groups[0]}/wagers`, storeAs: 'wagers'}]);
    const rawWagers = useStoreState(state => state.firestore.data.wagers)

    const wagers = Object.values(rawWagers ?? {})
        .filter(wager => wager.status !== 'rejected')
        .filter(wager => wager.status !== 'open')

    window.wagers = wagers;

    const wagersBySport = groupByPath(wagers, 'details.event.sport');

    return (
        <AppCell>
            {Object.keys(wagersBySport).map(it => <WagersForSport sport={it} wagers={wagersBySport[it]}/>)}
        </AppCell>
    )
}