import {action, computed, thunk} from "easy-peasy";

export const poolsModel = {
    submitPoolEntry: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase()
        await firebase.functions().httpsCallable('submitPoolEntry')(payload);
    }),
    selectedProps: {},
    loadSelectedProps: action((state, payload) => {
        return {
            ...state,
            selectedProps: payload
        }
    }),
    numSelected: computed(state => Object.values(state.selectedProps || {}).length || 0),
    /*
    When an 'event' is selected in a bovada event, we get the entire event, plus an index
    of the displayGroup and market, and the entire selected outcome. For a given pool, you
    can only select a single outcome of an event. So we'll keep a map of eventId => outcomeId
     */
    propEventSelected: action((state, payload) => {
        const {event, market, outcome, displayGroup} = payload;
        const newSelectedProps = {...state.selectedProps, [event.id]: outcome.id}
        return {
            ...state,
            selectedProps: newSelectedProps
        }
    }),
    clearPropsSelected: action((state, payload) => {
        return {
            ...state,
            selectedProps: {}
        }
    }),
    randomizePropsSelected: action((state, payload) => {
        const pool = payload;
        const randomSelections = Object.values(pool.events)
            .map(event => {
                const id = event.id;
                const outcomes = event.displayGroups[0].markets[0].outcomes;
                const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                return [id, randomOutcome.id]
            })
            .reduce((acc, [k, v]) => ({...acc, [k]: v}), {})

        return {
            ...state,
            selectedProps: randomSelections
        }
    })
}