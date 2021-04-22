import {isEmpty, isLoaded, useFirestoreConnect} from "react-redux-firebase";
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
    console.log(props);
    const {link, wagers, confirmWager} = props;
    const [name, setName] = useState('');

    useEffect(() => {
        const getName = async () => {
            const res = await fetch(`https://services.bovada.lv/services/sports/event/v2/nav/A/description/${link}`);
            const body = await res.json();
            setName([...body?.parents?.slice(1) ?? [], body.current].map(it => it?.description).join(' - '))
        }

        getName();
    }, [link]);

    return (
        <WagersByCompetitionContainer>
            <p> {name} </p>
            {wagers.map(it => <HeadToHeadWager onConfirm={confirmWager} key={it.id} wager={it}/>)}
        </WagersByCompetitionContainer>
    )
}

const WagersForSport = (props) => {
    const {sport, wagers, confirmWager} = props;
    const wagersByCompetition = groupByPath(wagers, 'details.event.link', x => x?.substring(0, x?.lastIndexOf('/')))
    return (
        <WagerBySportContainer>
            <h3> {sportsCodesToNames[sport] ?? 'Custom'} </h3>
            {Object.keys(wagersByCompetition)
                .map(it => <WagersForCompetition confirmWager={confirmWager} link={it}
                                                 wagers={wagersByCompetition[it]}/>)}
        </WagerBySportContainer>
    )
}


const FeedContainer = styled.div`
  display: flex;
  flex-direction: row;
  
  @media(max-width: 850px){
    flex-direction: column-reverse;
  }
`

const PersonalContainer = styled.div`
  flex-basis: 450px;
  padding: 1em;
`

const GroupContainer = styled.div`
  padding: 1em;
`


export const Feed = () => {
    const profile = useStoreState(state => state.firebase.profile)
    const activeGroup = useStoreState(state => state.users.activeGroup);
    useFirestoreConnect([{collection: `groups/${activeGroup}/wagers`, storeAs: 'wagers'}]);
    useFirestoreConnect({collection: `groups/${activeGroup}/users`, storeAs: 'groupMembers'});
    const rawWagers = useStoreState(state => state.firestore.data.wagers)
    const initGroup = useStoreActions(actions => actions.users.loadActiveGroup);

    useEffect(() => {
        if(isLoaded(profile) && !isEmpty(profile)){
            initGroup();
        }
    }, [profile])

    const confirmWagerAction = useStoreActions(actions => actions.wagers.respondToWager);
    const confirmWager = async (wagerId, groupId, acceptWager) => {
        await confirmWagerAction({wagerId, groupId, accept: acceptWager})
    };

    const wagers = Object.values(rawWagers ?? {})
        .filter(wager => wager.status !== 'rejected')
        .filter(wager => wager.status !== 'open')

    const wagersBySport = groupByPath(wagers, 'details.event.sport');

    return (
        <FeedContainer>
                <AppCell>
                    <h2> Group Wagers </h2>
                    {Object.keys(wagersBySport).map(it => <WagersForSport confirmWager={confirmWager} sport={it} wagers={wagersBySport[it]}/>)}
                </AppCell>
        </FeedContainer>
    )
}