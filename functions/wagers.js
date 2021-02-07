const functions = require('firebase-functions');
const admin = require('firebase-admin');


const {v4: uuidv4} = require('uuid');
const {notifyGroupOfWager} = require('./groups');

const db = admin.firestore();

const ActionTypes = {
    WIN: 'WIN',
    LOSS: 'LOSS',
    PUSH: 'PUSH',
    PAID: 'PAID',
    CANCEL: 'CANCEL',
    CONFIRM_CANCEL: 'CONFIRM_CANCEL',
    CONFIRM_WINNER: 'CONFIRM_WINNER',
};

const Statuses = {
    PAID: 'paid',
    OPEN: 'open',
    BOOKED: 'booked',
    PENDING: 'pending',
    PROPOSED: 'resolutionProposed',
    REJECTED: 'rejected',
    CANCEL_PROPOSED: 'cancellationProposed',
}


const fail = (message) => {
    throw new functions.https.HttpsError('failed-precondition', message)
}

const onWagerWrite = async (change) => {
    const wager = change.after.data();
    if (wager && wager.proposedTo && wager.proposedTo.uid) {

        if (wager.status === Statuses.PENDING) {
            const snapshot = await db.collection('users').doc(wager.proposedTo.uid).get()
            const proposedToUser = snapshot.data();

            const mail = {
                to: proposedToUser.email,
                template: {
                    name: 'new-wager',
                    data: {
                        proposedBy: wager.proposedBy.displayName
                    }
                }
            }

            await db.collection('mail').add(mail);
        }
    }
}

async function lookupWager(groupId, wagerId) {
    const doc = await db.collection('groups').doc(groupId)
        .collection('wagers').doc(wagerId).get();

    if (!doc.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'This wager doesn\'t exist');
    }
    return doc.data();
}

function wagerIncludesUser(wager, uid) {
    return wager.proposedTo.uid === uid
        || wager.proposedBy.uid === uid;
}

function handlePaidAction(wager, user) {
    if (!wager.winner) {
        fail('A wager must have a winner before you pay it out');
    }

    if (wager.resolutionProposedBy.uid === user.uid) {
        fail('You were the one to propose a resolution');
    }

    if (wager.status !== Statuses.PROPOSED) {
        fail('Wager must be resolved before paying out');
    }

    return {
        ...wager,
        status: Statuses.PAID,
    }
}

function handleProposeResolution(wager, actionType, user, opponent) {
    if (wager.status !== Statuses.BOOKED) {
        fail('Invalid state to propose a winner');
    }

    const winnerByActionType = {
        [ActionTypes.WIN]: user,
        [ActionTypes.LOSS]: opponent,
        [ActionTypes.PUSH]: null,
    };

    return {
        ...wager,
        status: Statuses.PROPOSED,
        resolutionProposedBy: user,
        winner: winnerByActionType[actionType],
    }
}

function handleConfirmWinner(wager, user) {
    if (wager.status !== Statuses.PROPOSED) {
        fail('Invalid state to confirm a winner');
    }

    if (wager.resolutionProposedBy.uid === user.uid) {
        fail('You can\'t confirm something you proposed');
    }

    return {
        ...wager,
        status: Statuses.PAID
    }
}

function handleCancel(wager, user) {
    if (wager.status === Statuses.PAID || wager.status === Statuses.REJECTED) {
        fail('Cannot cancel a completed wager');
    }
    return {
        ...wager,
        cancellationProposedBy: user,
        status: Statuses.CANCEL_PROPOSED,
    };
}

function handleConfirmCancel(wager, user) {
    if (wager.status !== Statuses.CANCEL_PROPOSED) {
        fail('Invalid state to cancel a wager');
    }

    if (wager.cancellationProposedBy.uid === user.uid) {
        fail('You were the one to propose a cancellation');
    }

    return {
        ...wager,
        status: Statuses.REJECTED,
    }
}

function handleWagerAction(wager, actionType, user, opponent) {
    switch (actionType) {
        case ActionTypes.PAID:
            return handlePaidAction(wager, user);
        case ActionTypes.WIN:
        case ActionTypes.LOSS:
        case ActionTypes.PUSH:
            return handleProposeResolution(wager, actionType, user, opponent);
        case ActionTypes.CONFIRM_WINNER:
            return handleConfirmWinner(wager, user);
        case ActionTypes.CANCEL:
            return handleCancel(wager, user);
        case ActionTypes.CONFIRM_CANCEL:
            return handleConfirmCancel(wager, user);
        default:
            fail(`Unknown ActionType ${actionType}`);
    }
}

async function writeWager(newWager, groupId, wagerId, user1Uid, user2Uid) {
    const writeToGroups = db.collection('groups')
        .doc(groupId)
        .collection('wagers')
        .doc(wagerId)
        .set(newWager);


    const path = `wagers.${wagerId}`

    const writeToUser1 = db.collection('users')
        .doc(user1Uid)
        .update({[path]: newWager});

    const writeToUser2 = user2Uid
        ? db.collection('users')
        .doc(user2Uid)
        .update({[path]: newWager})
        : Promise.resolve();

    return Promise.all([writeToGroups, writeToUser1, writeToUser2]);
}

async function manageWager(data, context) {
    console.log(`AUDIT: action by ${context.auth.uid}`);
    const {groupId, wagerId, action} = data;

    const wager = await lookupWager(groupId, wagerId);

    if (!wagerIncludesUser(wager, context.auth.uid)) {
        throw new functions.https.HttpsError('unauthenticated', 'You have to be in the wager to update it');
    }

    const [user, opponent] = wager.proposedBy.uid === context.auth.uid
        ? [wager.proposedBy, wager.proposedTo]
        : [wager.proposedTo, wager.proposedBy];

    const newWager = {
        ...handleWagerAction(wager, action.type, user, opponent),
        lastUpdateBy: user.uid,
        lastUpdatedAt: admin.firestore.Timestamp.now()
    };

    await writeWager(newWager, groupId, wagerId, user.uid, opponent.uid);
};

async function confirmWager(data, context) {
    console.log(`AUDIT: action by ${context.auth.uid}`);
    const {groupId, wagerId, accept} = data;

    const wager = await lookupWager(groupId, wagerId);

    if (wager.status === Statuses.OPEN) {

        if (wager.proposedBy.uid === context.auth.uid && accept) {
            fail(`Can't accept an open wager you created yourself`);
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
            fail('This user may not accept the wager');
        }
    } else {
        action = accept ? 'accepted' : 'rejected'
    }

    const newWager = {
        ...wager,
        status: accept ? 'booked' : 'rejected',
        groupId: groupId,
        lastUpdateBy: context.auth.uid,
        lastUpdatedAt: admin.firestore.Timestamp.now()
    }

    await writeWager(newWager, groupId, wagerId, wager.proposedTo.uid, wager.proposedBy.uid);
    await notifyGroupOfWager(wager, action);

}

async function createWager(data, context) {
    const {groupId, proposedTo, details, type, isOpen} = data;
    const proposedBy = context.auth.uid;
    const usersSnapshot = await db.collection(`groups/${groupId}/users`).doc(proposedBy).get();
    if (!usersSnapshot.exists) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be a member of the group to create wagers in it.')
    }

    const creatingUserSnapshot = await db.collection('users').doc(proposedBy).get();
    if (!creatingUserSnapshot.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'The other party of the wager isn\'t registered');
    }

    let wagerToSave = {
        id: uuidv4(),
        createdAt: admin.firestore.Timestamp.now(),
        lastUpdateBy: context.auth.uid,
        lastUpdatedAt: admin.firestore.Timestamp.now(),
        groupId: groupId,
        type,
        proposedBy: {
            uid: proposedBy,
            displayName: creatingUserSnapshot.data().displayName
        },
        status: 'open',
        details: details
    }

    if (!isOpen) {
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

        wagerToSave = {
            ...wagerToSave,
            proposedTo: {
                uid: proposedTo,
                displayName: proposedToUserSnapshot.data().displayName,
            },
            status: 'pending'
        }
    }

    const wagerRef = {
        groupId: groupId,
        ...wagerToSave
    }

    await writeWager(wagerToSave, groupId, wagerToSave.id, proposedBy, proposedTo);

    await notifyGroupOfWager(wagerRef, 'proposed');

    return wagerToSave.id;
}

module.exports = {
    ActionTypes,
    Statuses,
    onWagerWrite,
    manageWager,
    confirmWager,
    createWager,
    fail
}