import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreActions, useStoreState} from "easy-peasy";
import {GroupWagers, PersonalWagers, useGroupWagers, Wager} from "./PersonalWagers";
import {AppCell} from "../pages/NewWagerPage";
import {HeadToHeadWager} from "./HeadToHeadWager";
import styled from 'styled-components';
import {sportsCodesToNames} from "./SportSelect";
import {useEffect, useState} from "react";

const WagerBySportContainer = styled.div`

`

const WagersByCompetitionContainer = styled.div`
    
`

const pluckDeep = (obj, key) => key.split('.').reduce((accum, key) => accum && accum[key], obj)
const groupByPath = (collection, path, transform = a => a) => collection.reduce(
    (result, item) => {
        const key = transform(pluckDeep(item, path))
        return {
        ...result,
            [key]: [
            ...(result[key] || []),
            item,
        ],
        }
    },
    {},
);

const WagersForCompetition = (props) => {
    const {link, wagers} = props;
    const [name, setName] = useState('');

    useEffect(() => {
        const getName = async () => {
            const res = await fetch(`https://services.bovada.lv/services/sports/event/v2/nav/A/description/${link}`);
            const body = await res.json();
            console.log(body);
            setName([...body?.parents?.slice(1) ?? [], body.current].map(it => it?.description).join(' - '))
        }

        getName();
    }, [link]);

    return (
        <WagersByCompetitionContainer>
            <p> {name} </p>
            {wagers.map(it => <Wager key={it.id} wager={it}/>)}
        </WagersByCompetitionContainer>
    )
}

const WagersForSport = (props) => {
    const {sport, wagers} = props;
    const wagersByCompetition = groupByPath(wagers, 'details.event.link', x => x?.substring(0, x?.lastIndexOf('/')))
    return (
        <WagerBySportContainer>
            <h2> {sportsCodesToNames[sport] ?? 'Custom'} </h2>
            {Object.keys(wagersByCompetition)
                .map(it => <WagersForCompetition link={it}
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

    useEffect(() => {
        const a = async () => {
            const res = await fetch("https://services.bovada.lv/services/sports/event/v2/nav/A/description//basketball/nba");
            const body = await res.json();
            console.log(body);
        }

        a();
    })

    const wagersBySport = groupByPath(wagers, 'details.event.sport');

    return (
        <AppCell>
            {Object.keys(wagersBySport).map(it => <WagersForSport sport={it} wagers={wagersBySport[it]}/>)}
        </AppCell>
    )
}