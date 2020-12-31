const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {v4: uuidv4} = require('uuid');
const axios = require('axios');
// For the default version
const algoliasearch = require('algoliasearch');

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;

const ALGOLIA_INDEX_NAME = 'dev_users';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

exports.onUserCreated = functions.firestore.document('users/{uid}').onCreate((snap, context) => {
    // Get the note document
    const user = snap.data();

    // Add an 'objectID' field which Algolia requires
    user.objectID = context.params.uid;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    return index.saveObject(user);
});

admin.initializeApp({
    storageBucket: 'ledgerdotbet-dev.appspot.com'
});
const db = admin.firestore()

const getGroup = async (groupId) => {
    const doc = await db.collection('groups').doc(groupId).get();
    if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', `Group ${groupId} does not exist`)
    }

    return doc
}

const createGroupInFirestore = async (adminUid, groupId, session) => {
    if (!adminUid) {
        throw new functions.https.HttpsError('invalid-argument', 'Must Supply user id in request')
    }
    const group = {
        owner: adminUid,
        groupId: groupId,
        sessionToken: session,
    }

    const doc = await db.collection('groups').doc(groupId).get();

    if (doc.exists) {
        throw new functions.https.HttpsError('already-exists', 'A group already exists with this ID');
    } else {
        await db.collection('groups').doc(groupId).set(group);
    }

    return groupId
}

const addUserToGroup = async (invitationCode, uid, allowDerivatives) => {
    const groupId = invitationCode.split('-')[0]
    const group = await getGroup(groupId);
    const matchingCode = group.data().codes.find(c => c.value === invitationCode);
    const codeIsValid = matchingCode && matchingCode.expires.toDate() > Date.now();

    const userRef = await db.collection('users').doc(uid).get()

    console.log(userRef.exists, codeIsValid, matchingCode);
    if (userRef.exists && codeIsValid) {
        const user = userRef.data();
        await group.ref.collection('users').doc(uid).set({displayName: user.displayName, uid, allowDerivatives, joined: Date.now(), group: groupId})
        const groups = Array.from(new Set([groupId, ...user.groups || []]))
        await db.collection('users').doc(uid).set({...user, groups})
    }
}

exports.createGroup = functions.https.onCall(async (data, context) => {
    const groupId = await createGroupInFirestore(data.uid, data.groupId, data.session);
    await addUserToGroup(groupId, data.uid, true)
});

exports.joinGroup = functions.https.onCall(async (data, context) => {
    const groupId = data.joinCode; // TODO: change this to be group id + auth hash and check it
    const usersSnapshot = await db.collection(`groups/${groupId}/users`).doc(data.uid).get();

    if (usersSnapshot.exists) {
        throw new functions.https.HttpsError('already-exists', 'You\'re already in this group');
    }

    await addUserToGroup(groupId, data.uid, data.allowDerivatives)
});

exports.createWager = functions.https.onCall(async (data, context) => {
    const {groupId, proposedTo, details} = data;
    const proposedBy = context.auth.uid;
    const usersSnapshot = await db.collection(`groups/${groupId}/users`).doc(proposedBy).get();
    if (!usersSnapshot.exists) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be a member of the group to create wagers in it.')
    }

    const proposedToSnapshot = await db.collection(`groups/${groupId}/users`).doc(proposedTo).get();
    if (!proposedToSnapshot.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The other party of the wager isn\'t in this group')
    }

    if (proposedToSnapshot.data().uid === context.auth.uid) {
        throw new functions.https.HttpsError('failed-precondition', 'You can\'t create a wager with yourself')
    }

    const proposedToUserSnapshot = await db.collection('users').doc(proposedToSnapshot.data().uid).get();
    if (!proposedToUserSnapshot.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The other party of the wager isn\'t registered');
    }

    const creatingUserSnapshot = await db.collection('users').doc(proposedBy).get();
    if (!creatingUserSnapshot.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The other party of the wager isn\'t registered');
    }

    const wagerToSave = {
        id: uuidv4(),
        groupId: groupId,
        proposedBy: {
            uid: proposedBy,
            displayName: creatingUserSnapshot.data().displayName
        },
        proposedTo: {
            uid: proposedTo,
            displayName: proposedToUserSnapshot.data().displayName,
        },
        status: 'pending',
        details: details
    }

    const wagerRef = {
        groupId: groupId,
        ...wagerToSave
    }

    await db.collection('groups')
        .doc(groupId)
        .collection('wagers')
        .doc(wagerToSave.id)
        .set(wagerToSave);

    const path = `wagers.${wagerToSave.id}`

    await db.collection('users')
        .doc(proposedBy)
        .update({[path]: wagerRef})

    await db.collection('users')
        .doc(proposedTo)
        .update({[path]: wagerRef})

    await notifyGroupOfWager(wagerRef, 'proposed');
})

exports.createOpenWager = functions.https.onCall(async (data, context) => {
    const {groupId, proposedBy, details} = data;
    const usersSnapshot = await db.collection(`groups/${groupId}/users`).doc(proposedBy).get();
    if (!usersSnapshot.exists) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be a member of the group to create wagers in it.')
    }

    const creatingUserSnapshot = await db.collection('users').doc(proposedBy).get();
    if (!creatingUserSnapshot.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The other party of the wager isn\'t registered');
    }

    const actorUserSnapshot = await db.collection('users').doc(details.actor).get();
    if (!actorUserSnapshot.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The actor of the wager isn\'t registered');
    }


    const wagerToSave = {
        id: uuidv4(),
        groupId: groupId,
        proposedBy: {
            uid: proposedBy,
            displayName: creatingUserSnapshot.data().displayName
        },
        status: 'open',
        details: details
    }

    const wagerRef = {
        groupId: groupId,
        ...wagerToSave
    }

    await db.collection('groups')
        .doc(groupId)
        .collection('wagers')
        .doc(wagerToSave.id)
        .set(wagerToSave);

    const path = `wagers.${wagerToSave.id}`

    await db.collection('users')
        .doc(proposedBy)
        .update({[path]: wagerRef})

    await notifyGroupOfWager(wagerRef, 'open');
})

exports.confirmWager = functions.https.onCall(async (data, context) => {
    console.log(`AUDIT: action by ${context.auth.uid}`);
    const {groupId, wagerId, accept} = data;

    const doc = await db.collection('groups').doc(groupId)
        .collection('wagers').doc(wagerId).get();

    if (!doc.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'This wager doesn\'t exist');
    }
    const wager = doc.data();

    if (wager.status === 'open') {

        if (wager.proposedBy.uid === context.auth.uid && accept) {
            throw new functions.https.HttpsError('failed-precondition', `Can't accept an open wager you created yourself`)
        }
        const snapshot = await db.collection('users').doc(context.auth.uid).get()
        const proposedToUser = snapshot.data();
        wager.proposedTo = {
            uid: context.auth.uid,
            displayName: proposedToUser.displayName
        }
    }


    let action = '';
    if (wager.proposedTo.uid !== context.auth.uid) {
        if (!accept && (wager.proposedBy.uid === context.auth.uid)) {
            action = 'rescinded';
        } else {
            throw new functions.https.HttpsError('failed-precondition', 'This user may not accept the wager');
        }
    } else {
        action = accept ? 'accepted' : 'rejected'
    }

    const newWager = {
        ...wager,
        status: accept ? 'booked' : 'rejected',
        groupId: groupId
    }

    await db.collection('groups')
        .doc(data.groupId)
        .collection('wagers')
        .doc(data.wagerId)
        .set(newWager);


    const path = `wagers.${data.wagerId}`

    await db.collection('users')
        .doc(wager.proposedTo.uid)
        .update({[path]: newWager})

    await db.collection('users')
        .doc(wager.proposedBy.uid)
        .update({[path]: newWager})

    await notifyGroupOfWager(wager, action);
});

async function notifyGroupOfWager(wager, action) {
    console.log(wager, action);
}


async function getAndSaveEventsFromBovada() {
    const eventsUrl = 'https://www.bovada.lv/services/sports/event/coupon/events/A/description?marketFilterId=def&preMatchOnly=true&lang=en';
    const axiosResult = await axios.get(eventsUrl, {
        responseType: 'arraybuffer'
    })
    const resultBuffer = Buffer.from(axiosResult.data, 'binary');

    const file = admin.storage().bucket().file('events.json');

    const result = await file.save(resultBuffer, {
        metadata: { contentType: "Application/JSON" },
        public: true,
        validation: 'md5'
    })

    console.log(result)
}

exports.isValidInvitation = functions.https.onCall(async (data, context) => {
    // an invitation code is the groupId + some randomness. We split to get the group, then
    // check if the invitation is still valid.
    const invitationCode = data.invitationCode;
    const groupId = invitationCode.split('-')[0]
    const doc = await db.collection('groups').doc(groupId).get();

    if (!doc.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The group for this code doesn\'t exist');
    }

    const codes = doc.data().codes;
    const matchingCode = codes.find(c => c.value === invitationCode);

    return matchingCode && matchingCode.expires > Date.now()
})

exports.getEventsFromBovada = functions.pubsub.schedule("every 1 hours").onRun(async (context) => {
    await getAndSaveEventsFromBovada()
});

exports.manuallyUpdateBovadaEvents = functions.https.onRequest(async (req, res) => {
    await getAndSaveEventsFromBovada()
    res.send('ok');
})