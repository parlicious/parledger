import {action, actionOn, computed, thunk, useStoreActions, useStoreState} from "easy-peasy"
import {useState} from 'react';
import Fuse from 'fuse.js'

const fuseOptions = {
    keys : [ 
        "path.description",
        "events.description"
    ],
    ignoreLocation: true,
    threshold: 0.3,
};

const eventsByCategory = (sections) => {
    sections?.flatMap(section => {
        const slice = section.path.slice(-1)
        const key = slice && slice[0]
        return section.events.map(it => [key, it])
    }).reduce((acc, val) => ({...acc, [val[0]]: val[1]}), {})
}

const newWagerModel = {
    type: null,
    setType: action((state, payload) => {
        return {...state, type: payload};
    }),
    opponent: null,
    setOpponent: action((state, payload) => {
        return {...state, opponent: payload};
    }),
    details: null,
    setDetails: action((state, payload) => {
        return {...state, details: payload};
    })
}

function matchMarkets(originalMarkets, expectedMarkets) {
    return expectedMarkets.map(expectedMarket => originalMarkets.find(market => market.key === expectedMarket.key));
}

function normalizeMarkets(section) {
    const eventMarkets = section.events
        .map(e => e.displayGroups[0].markets);

    if(eventMarkets.length < 1) return section;

    const maxMarkets = eventMarkets.map(markets => markets.length)
        .reduce((a,b) => Math.max(a,b));
    
    const expectedMarkets = eventMarkets.find(markets => markets.length === maxMarkets);

    const normalizedEvents = section.events.map(event => ({
        ...event,
        displayGroups : [{
            ...event.displayGroups[0],
            originalMarkets : event.displayGroups[0].markets,
            markets : matchMarkets(event.displayGroups[0].markets, expectedMarkets)
        }]
    }));
    return { ...section, expectedMarkets, events: normalizedEvents };
}

function calculateImpliedOdds(outcome) {
    const decimal = Number(outcome.price.decimal);
    return {
        ...outcome,
        impliedOdds : 1 / decimal
    };
}

export function addImpliedOddsToEvents(maxOutcomes) { // use undefined for all outcomes
    return (event) => {
        const markets = event.displayGroups[0].markets
            .map(market => {
                if(!market || !market.outcomes || !market.outcomes.length) return market;
                const outcomesWithImpliedOdds = market.outcomes.map(calculateImpliedOdds);
                const adjustmentConstent = 100 / outcomesWithImpliedOdds
                    .map(o => o.impliedOdds)
                    .reduce((a,b) => a + b);
                const outcomes = outcomesWithImpliedOdds
                    .map((outcome, index) => ({ ...outcome, adjustedOdds: (outcome.impliedOdds * adjustmentConstent).toPrecision(2) + '%'}));
                return { ...market, outcomes };
            });
        
        return {
            ...event,
            displayGroups : [{
                ...event.displayGroups[0],
                markets
            }]
        };
    }
}

export const wagersModel = {
    eventsUpdated: null,
    fuse: null,
    searchString: null,
    eventsToGet: 5,
    increaseEventsToGet: action((state) => ({...state, eventsToGet: state.eventsToGet + 5})),
    setSearchString: action((state, searchString) => ({ ...state, searchString })),
    updatingEvents: action((state, payload) => {
        return {...state, eventsUpdated: Date.now()}
    }),
    selectedSport: null,
    selectSport: action((state, payload) => {
        return {...state, selectedSport: payload, searchString: null}
    }),
    events: null,
    allEvents: null,
    saveEvents: action((state, payload) => {
        return {
            ...state,
            events: payload,
            allEvents: payload,
        }
    }),
    filteredEvents: computed(state => {
        if(state?.searchString && state?.fuse) {
            return state.fuse
                .search(state.searchString)
                .map(result => result.item);
        }
        if (!state?.selectedSport) {
            return state.events;
        } else {
            return state?.events?.filter(e => e.path[0].sportCode === state.selectedSport)
        }
    }),
    createFuse: actionOn( 
        actions => actions.saveEvents,
        state => {
            const fuse = state.events && new Fuse(state.events, fuseOptions);
            return { ...state, fuse };
        }
    ),
    eventsByCategory: computed(state => eventsByCategory(state.events)),
    loadMoreEvents: thunk(async (actions, payload, helpers) => {
        await actions.increaseEventsToGet();
        await actions.loadEvents();
    }),
    loadEvents: thunk(async (actions, payload, helpers) => {
        const updatedAt = helpers.getStoreState().wagers?.eventsUpdated
        const eventsToGet = helpers.getStoreState().wagers?.eventsToGet;
        if (!updatedAt || (Date.now() - updatedAt > 5000)) {
            await actions.updatingEvents();
            const result = await fetch(`https://www.bovada.lv/services/sports/event/coupon/events/A/description?lang=en&eventsLimitByPath=${eventsToGet}`)
            const json = await result.json();
            console.log(json);
            const events = (json)
                .map(normalizeMarkets)
                .map(it =>
                    ({
                        path: it.path,
                        events: it.events.map(addImpliedOddsToEvents(2)),
                        expectedMarkets: it.expectedMarkets,
    
                    }))
                .filter(it => it.events.length > 0);
            window.events = events;
            actions.saveEvents(events);
        }
    }),
    groupWagers: [],
    setGroupWagers: action((state, payload) => {
        console.log(state);
        const groupWagers = Object.values(payload ?? {})
            .filter(wager => wager.status !== 'rejected')
            .filter(wager => wager.proposedBy?.uid !== state.auth.uid && wager.proposedTo?.uid !== state.auth.uid)

        return {...state, groupWagers}
    }),
    loadGroupWagers: thunk(async (actions, payload, helpers) => {
        const state = helpers.getStoreState();
        console.log(state);
        actions.setGroupWagers(state.firestore.data.wagers);
    }),
    createWager: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase()
        await firebase.functions().httpsCallable('createWager')(payload);
    }),
    manageWager: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase()
        await firebase.functions().httpsCallable('manageWager')(payload);
    }),
    respondToWager: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase();
        console.log(firebase);
        await firebase.functions().httpsCallable('confirmWager')(payload)
    }),
    activeWager: null,
    setActiveWager: action((state, payload) => {
        return {...state, activeWager: payload}
    }),
    new: newWagerModel
}

export const generateWagerFromSelection = ({risk, toWin, self, opponent, details, type}) => {
    return {
        type,
        proposedBy: self,
        proposedTo: opponent,
        details: {
            risk,
            toWin,
            ...details,
        }
    };
}

export const useSaveWager = () => {
    const profile = useStoreState(state => state.firebase.profile);
    const activeGroup = useStoreState(state => state.users.activeGroup);
    const [submitting, setSubmitting] = useState(false);
    const [apiSuccess, setApiSuccess] = useState(null);
    const [apiError, setApiError] = useState(null);
    const createWager = useStoreActions(actions => actions.wagers.createWager);

    const save = async ({risk, toWin, opponent, details, type}) => {
        const wager = {
            groupId: activeGroup,
            type,
            details: {
                risk,
                toWin,
                ...details,
            }
        }

        try {
            setSubmitting(true);
            if (opponent.uid === 'OPEN') {
                await createWager({isOpen: true, ...wager});
            } else {
                await createWager({proposedTo: opponent.uid, ...wager});
            }
            setApiSuccess("Wager was proposed!")
        } catch (error) {
            setApiError(error.message);
        }

        setSubmitting(false);
    }

    return {submitting, apiError, apiSuccess, save};
}

export const useManageWager = () => {
    const profile = useStoreState(state => state.firebase.profile);
    const [submitting, setSubmitting] = useState(false);
    const [apiSuccess, setApiSuccess] = useState(null);
    const [apiError, setApiError] = useState(null);
    const manageWager = useStoreActions(actions => actions.wagers.manageWager);

    const save = async ({wager, action}) => {
        try {
            setSubmitting(true);
            await manageWager({groupId: wager.groupId, wagerId: wager.id, action})
            setApiSuccess("Wager was updated!")
        } catch (error) {
            setApiError(error.message);
        }

        setSubmitting(false);
    }

    return {submitting, apiError, apiSuccess, save};
}