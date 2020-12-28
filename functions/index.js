const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {v4: uuidv4} = require('uuid');

admin.initializeApp();
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

const addUserToGroup = async (groupId, uid, allowDerivatives) => {
    const group = await getGroup(groupId);
    const userRef = await db.collection('users').doc(uid).get()
    if (userRef.exists) {
        const user = userRef.data();
        await group.ref.collection('members').doc(uid).set({displayName: user.displayName, uid, allowDerivatives, joined: Date.now()})
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
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).doc(data.uid).get();

    if (membersSnapshot.exists) {
        throw new functions.https.HttpsError('already-exists', 'You\'re already in this group');
    }

    await addUserToGroup(groupId, data.uid, data.allowDerivatives)
});

exports.createWager = functions.https.onCall(async (data, context) => {
    const {groupId, proposedTo, details} = data;
    const proposedBy = context.auth.uid;
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).doc(proposedBy).get();
    if (!membersSnapshot.exists) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be a member of the group to create wagers in it.')
    }

    const proposedToSnapshot = await db.collection(`groups/${groupId}/members`).doc(proposedTo).get();
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
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).doc(proposedBy).get();
    if (!membersSnapshot.exists) {
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