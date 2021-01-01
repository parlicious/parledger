import {action, computed, thunk} from "easy-peasy"


const eventsByCategory = (sections) => {
    sections?.flatMap(section => {
        const slice = section.path.slice(-1)
        const key = slice && slice[0]
        return section.events.map(it => [key, it])
    }).reduce((acc, val) => ({...acc, [val[0]]: val[1]}), {})
}

export const wagersModel = {
    eventsUpdated: null,
    updatingEvents: action((state, payload) => {
        state.eventsUpdated = Date.now();
        return state;
    }),
    events: null,
    saveEvents: action((state, payload) => {
        state.events = payload;
        return state;
    }),
    headToHeadEvents: computed(state => {
        return state.events
            ?.map(it =>
                ({
                    path: it.path,
                    events: it.events.filter(event => event.displayGroups[0].markets?.every(market => market?.outcomes?.length === 2))
                }))
            ?.filter(it => it.events.length > 0)
    }),
    headToHeadEventsByCategory: computed(state => eventsByCategory(state.events)),
    loadEvents: thunk(async (actions, payload, helpers) => {
        const updatedAt = helpers.getStoreState().wagers?.eventsUpdated
        if (!updatedAt || (Date.now() - updatedAt > 5000)) {
            await actions.updatingEvents();
            const firebase = helpers.injections.getFirebase();
            const storage = firebase.storage();
            const eventsRef = storage.ref('events.json');
            const downloadUrl = await eventsRef.getDownloadURL();
            const result = await fetch(downloadUrl)
            const events = await result.json();
            window.events = events;
            actions.saveEvents(events);
        }
    }),
    groupWagers: [],
    setGroupWagers: action((state, payload) => {
        state.groupWagers = Object.values(payload ?? {})
            .filter(wager => wager.status !== 'rejected')
            .filter(wager => wager.proposedTo.uid !== state.auth.uid && wager.proposedTo.uid !== state.auth.uid)
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
    respondToWager: thunk(async (actions, payload, helpers) => {
        const firebase = helpers.injections.getFirebase();
        await firebase.functions().httpsCallable('confirmWager')(payload)
    })
}