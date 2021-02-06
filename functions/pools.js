const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const {fail} = require('./wagers');
const db = admin.firestore();

const PoolTypes = {
    PICKEM: 'pickem'
}


/**
 * Exclusive: pool options can only be selected once
 * Open: pool options can be selected any number of times
 * Tiered: pool options are broken up into tiers and the pool
 *   specifies how many of each tier you can pick
 */
const SelectionTypes = {
    EXCLUSIVE: 'exclusive',
    OPEN: 'open',
    TIERED: 'tiered'
}

async function getPool(poolId, groupId) {
    console.log(poolId, groupId)
    const snapshot = await db
        .collection('groups')
        .doc(groupId)
        .collection('pools')
        .doc(poolId).get();

    if (!snapshot.exists) {
        fail(`Pool ${poolId} for group ${groupId} does not exist`)
    }

    return snapshot.data();
}

async function handlePickemEntry(pool, selections, context) {
    if (pool.selectionType === SelectionTypes.EXCLUSIVE) {
        const allSelections = new Set(Object.values(pool.members || {})
            .filter(it => it.info.uid !== context.auth.uid)
            .map(it => it.selections).flat());

        selections.forEach(it => {
            if (allSelections.has(it)) {
                fail('This selection has already been selected!')
            }
        })
    }

    const usersSnapshot = await db.collection(`groups/${pool.groupId}/users`).doc(context.auth.uid).get()

    const updateKey = `members.${context.auth.uid}`;

    await db.collection('groups')
        .doc(pool.groupId)
        .collection('pools')
        .doc(pool.id)
        .update({
            [updateKey]: {
                selections,
                info: usersSnapshot.data()
            }
        })
}


/**
 * Pools are more self contained than wagers - the options and the picks are
 * stored in the same data structure. Pools have:
 *
 *  - options: {[optionId]: option}
 *  - selections: {[uid]: [optionId]}
 *  - title: string
 *  - description: string
 *  - acceptsPicksUntil date
 *  - selectionType: SelectionTypes
 *  - type: PoolTypes
 */
async function submitPoolEntry(data, context) {
    console.log(`AUDIT: action by ${context.auth.uid}`);
    console.log('called with:', data);
    const {poolId, groupId, selections} = data;

    const pool = await getPool(poolId, groupId);

    if (pool?.acceptingPicksUntil.toDate() < Date.now()) {
        fail('Entries for this pool have closed');
    }

    switch (pool.type) {
        case PoolTypes.PICKEM:
            return handlePickemEntry(pool, selections, context)
        default:
            fail('Unknown Pool Type')
    }
}

async function manuallyCreateSuperBowlProps() {
    const pool = {
        acceptingPicksUntil: admin.firestore.Timestamp.now(),
        groupId: "CPBNJGExlWuZmzLc613T",
        id: "",
        members: {},
        name: "Super Bowl Prop Sheet",
        optionsType: "bovada",
        selectionType: SelectionTypes.OPEN,
        selections: {},
        type: PoolTypes.PICKEM,
    }

    const eventsUrl = 'https://www.bovada.lv/services/sports/event/coupon/events/A/description/football/super-bowl-specials?marketFilterId=rank&preMatchOnly=true&lang=en';
    const axiosResult = await axios.get(eventsUrl)
    const section = axiosResult.data[0];

    await db.collection('groups')
        .doc(pool.groupId)
        .collection('pools')
        .add({...pool, options: section});
}


module.exports = {
    submitPoolEntry,
    manuallyCreateSuperBowlProps
}