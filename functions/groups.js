const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

const isValidInvitation = async (data) => {
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
};

async function notifyGroupOfWager(wager, action) {
    console.log(wager, action);
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

const getGroup = async (groupId) => {
    const doc = await db.collection('groups').doc(groupId).get();
    if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', `Group ${groupId} does not exist`)
    }

    return doc
}

const addUserToGroup = async (invitationCode, uid) => {
    const groupId = invitationCode.split('-')[0]
    const group = await getGroup(groupId);
    const matchingCode = group.data().codes.find(c => c.value === invitationCode);
    const codeIsValid = matchingCode && matchingCode.expires.toDate() > Date.now();

    const userRef = await db.collection('users').doc(uid).get()

    console.log(userRef.exists, codeIsValid, matchingCode);
    if (userRef.exists && codeIsValid) {
        const user = userRef.data();
        await group.ref.collection('users').doc(uid).set({
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            uid,
            joined: Date.now(),
            group: groupId
        })
        const groups = Array.from(new Set([groupId, ...user.groups || []]))
        await db.collection('users').doc(uid).set({...user, groups})
    }
}

async function createGroup (data, context) {
    const groupId = await createGroupInFirestore(data.uid, data.groupId, data.session);
    await addUserToGroup(groupId, data.uid, true)
}

async function joinGroup(data, context) {
    const groupId = data.joinCode.split('-')[0] // TODO: change this to be group id + auth hash and check it
    const usersSnapshot = await db.collection(`groups/${groupId}/users`).doc(data.uid).get();

    if (usersSnapshot.exists) {
        throw new functions.https.HttpsError('already-exists', 'You\'re already in this group');
    }

    await addUserToGroup(data.joinCode, data.uid, data.allowDerivatives)
}

module.exports = {
    isValidInvitation,
    notifyGroupOfWager,
    joinGroup,
    createGroup,
}