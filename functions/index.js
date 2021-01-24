const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { onWagerWrite, manageWager, confirmWager, createWager } = require('./wagers');
const { getAndSaveEventsFromBovada } = require('./bovada');
const { isValidInvitation, joinGroup, createGroup } = require('./groups');

admin.initializeApp({
    storageBucket: functions.config().storage.bucket
});

exports.createGroup = functions.https.onCall(createGroup);

exports.joinGroup = functions.https.onCall(joinGroup);

exports.createWager = functions.https.onCall(createWager)

exports.confirmWager = functions.https.onCall(confirmWager);

exports.manageWager = functions.https.onCall(manageWager);

exports.isValidInvitation = functions.https.onCall(isValidInvitation)

const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
}

exports.getEventsFromBovada = functions.runWith(runtimeOpts).pubsub.schedule("every 1 hours").onRun(getAndSaveEventsFromBovada);

exports.manuallyUpdateBovadaEvents = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
    await getAndSaveEventsFromBovada()
    res.send('ok');
})

exports.sendWagerProposalEmail = functions.firestore.document('groups/{groupId}/wagers/{wagerId}')
    .onWrite(onWagerWrite);
